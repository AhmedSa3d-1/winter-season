import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Star, X, Trash2, Check, Snowflake, Eye, Download, Share2, Sparkles, CalendarDays } from "lucide-react";
import logoUrl from "./assets/logo.png";
import watermarkUrl from "./assets/logo_transparent.png";
import animeData from "./src/data/anime.json";
import siteConfig from "./src/data/site-config.json";
import top5Data from "./src/data/top5.json";

type Anime = { title: string; genre: string; synopsis: string; tag?: string; image?: string; releaseDate?: string };
type Group = { date: string; short: string; items: Anime[] };
type SeasonKey = "winter" | "spring" | "summer" | "fall";
type SeasonTheme = { bg: string; bgDark: string; surface: string; surfaceDark: string; surface2: string; accent: string; accent2: string; sky: string; navy: string; cream: string; muted: string; line: string; scrollbar: string; particle: string[] };
type SeasonConfig = { key: SeasonKey; name: string; nameEn: string; year: string; emoji: string; badge: string; titleLine1: string; titleLine2: string; subtitle: string; description: string; searchPlaceholder: string; footerCta: string; footerTitle1: string; footerTitle2: string; footerText: string; hashtags: string[]; shareTitle: string; shareFilePrefix: string; canvasTitle: string; canvasSubtitle: string; canvasFooter: string; storyLabel: string; theme: SeasonTheme };
type SiteConfig = { activeSeason: SeasonKey; seasons: Record<SeasonKey, SeasonConfig> };

const config = siteConfig as SiteConfig;
const season = config.seasons[config.activeSeason] ?? config.seasons.winter;
const theme = season.theme;

const groups: Group[] = (animeData as { groups: Group[] }).groups;

const total = groups.reduce((n, g) => n + g.items.length, 0);
const COLLECTION = `${season.key}${season.year}_picks`;
const FILTERS = ["الكل", "أفلام", "مواسم جديدة", "أكشن", "رومانسي", "كوميدي", "إيسيكاي", "فانتازيا"];
const TOP5_TITLES = (((top5Data as { titles?: unknown }).titles as unknown[]) ?? []).filter((t): t is string => typeof t === "string");
type SelectedDetail = Anime & { date: string };

type StoredRecord = { id: string; value: { titles?: unknown }; idempotency_key?: string };
type StorageResult = { records?: StoredRecord[]; id?: string };

async function callApi(action: string, args: Record<string, unknown>): Promise<StorageResult> {
  const storageKey = `winter-anime:${String(args.collection ?? COLLECTION)}`;
  const records = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as StoredRecord[];
  if (action === "records.list") return { records };
  if (action === "records.create") {
    const idempotencyKey = String(args.idempotency_key ?? "");
    const existing = records.find((record) => record.idempotency_key === idempotencyKey);
    if (existing) return { id: existing.id };
    const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    records.push({ id, value: args.value as StoredRecord["value"], idempotency_key: idempotencyKey });
    localStorage.setItem(storageKey, JSON.stringify(records));
    return { id };
  }
  if (action === "records.replace") {
    const index = records.findIndex((record) => record.id === args.id);
    if (index < 0) throw new Error("تعذّر العثور على الاختيارات المحفوظة");
    records[index] = { ...records[index], value: args.value as StoredRecord["value"] };
    localStorage.setItem(storageKey, JSON.stringify(records));
    return {};
  }
  throw new Error(`إجراء غير معروف: ${action}`);
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => resolve(img); img.onerror = () => reject(new Error("logo failed")); img.src = src; });
}
function colorMix(a: string, b: string, t: number) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}
const SNOW = Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 9) * 1.1, dur: 9 + (i % 6) * 2.2, size: 10 + (i % 4) * 5, char: theme.particle[i % theme.particle.length] }));
const THEME_VARS = { "--bg": theme.bg, "--bg-dark": theme.bgDark, "--surface": theme.surface, "--surface-dark": theme.surfaceDark, "--surface-2": theme.surface2, "--accent": theme.accent, "--accent-2": theme.accent2, "--sky": theme.sky, "--navy": theme.navy, "--cream": theme.cream, "--muted": theme.muted, "--line": theme.line, "--scrollbar": theme.scrollbar } as React.CSSProperties;

export default function App() {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openSynopsis, setOpenSynopsis] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"loading" | "saved" | "saving" | "offline" | "error" | "idle">("loading");
  const recordIdRef = useRef<string | null>(null);
  const pendingSelectionRef = useRef<Set<string> | null>(null);
  const persistingRef = useRef(false);
  recordIdRef.current = recordId;

  useEffect(() => {
    document.title = `${season.titleLine1} ${season.titleLine2} | أوتاكو في القمة`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", season.description);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", theme.bg);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await callApi("records.list", { collection: COLLECTION });
        if (cancelled) return;
        const records = data?.records ?? [];
        if (records.length > 0) {
          const first = records[0];
          setRecordId(first.id);
          const titles = Array.isArray(first.value?.titles) ? first.value.titles : [];
          const known = new Set(groups.flatMap((g) => g.items.map((i) => i.title)));
          setSelected(new Set(titles.filter((t: unknown) => typeof t === "string" && known.has(t as string))));
          setSaveState("saved");
        } else setSaveState("idle");
      } catch { if (!cancelled) setSaveState("offline"); }
    })();
    return () => { cancelled = true; };
  }, []);

  const persistSelection = (next: Set<string>) => {
    pendingSelectionRef.current = new Set(next);
    if (persistingRef.current) return;
    persistingRef.current = true;
    void (async () => {
      while (pendingSelectionRef.current) {
        const pending = pendingSelectionRef.current;
        pendingSelectionRef.current = null;
        const ordered: string[] = [];
        groups.forEach((g) => g.items.forEach((it) => { if (pending.has(it.title)) ordered.push(it.title); }));
        setSaveState("saving");
        try {
          if (!recordIdRef.current) {
            const created = await callApi("records.create", { collection: COLLECTION, value: { titles: ordered }, idempotency_key: `${COLLECTION}-v1` });
            if (!created.id) throw new Error("تعذّر إنشاء سجل الاختيارات");
            recordIdRef.current = created.id;
            setRecordId(created.id);
          } else await callApi("records.replace", { collection: COLLECTION, id: recordIdRef.current, value: { titles: ordered } });
          if (!pendingSelectionRef.current) setSaveState("saved");
        } catch {
          if (!pendingSelectionRef.current) { setSaveState("error"); showToast("ما اتحفظتوش — جرّبوا تاني"); }
        }
      }
      persistingRef.current = false;
    })();
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const toggle = (title: string) => { const n = new Set(selected); if (n.has(title)) n.delete(title); else n.add(title); setSelected(n); void persistSelection(n); };
  const clearAll = () => { if (!selected.size) return; const n = new Set<string>(); setSelected(n); void persistSelection(n); };
  const toggleSynopsis = (t: string) => { const n = new Set(openSynopsis); if (n.has(t)) n.delete(t); else n.add(t); setOpenSynopsis(n); };

  const matchesFilter = (a: Anime) => {
    const g = a.genre.toLowerCase();
    if (activeFilter === "الكل") return true;
    if (activeFilter === "أفلام") return a.tag === "فيلم" || g.includes("فيلم") || g.includes("movie");
    if (activeFilter === "مواسم جديدة") return /season|part|موسم|جزء/i.test(a.title) || /موسم جديد|season/i.test(a.synopsis);
    const map: Record<string, string[]> = { "أكشن": ["أكشن", "action"], "رومانسي": ["رومانسي", "romance"], "كوميدي": ["كوميدي", "comedy"], "إيسيكاي": ["إيسيكاي", "isekai"], "فانتازيا": ["فانتازيا", "fantasy"] };
    return (map[activeFilter] ?? [activeFilter]).some((k) => g.includes(k.toLowerCase()));
  };

  const selectedList: SelectedDetail[] = useMemo(() => { const o: SelectedDetail[] = []; groups.forEach((g) => g.items.forEach((it) => { if (selected.has(it.title)) o.push({ ...it, date: g.date }); })); return o; }, [selected]);
  const filtered = useMemo(() => groups.map((g) => ({ ...g, items: g.items.filter((a) => matchesFilter(a) && (a.title.toLowerCase().includes(query.toLowerCase()) || a.genre.includes(query) || a.synopsis.includes(query))) })).filter((g) => g.items.length > 0), [activeFilter, query]);
  const top5 = useMemo(() => TOP5_TITLES.map((t) => { for (const g of groups) { const f = g.items.find((x) => x.title === t); if (f) return { ...f, date: g.date }; } return null; }).filter(Boolean) as SelectedDetail[], []);

  const buildCanvas = async (list: SelectedDetail[]) => {
    await document.fonts?.ready?.catch(() => undefined);
    const logoImg = await loadImage(logoUrl).catch(() => null);
    const watermarkImg = await loadImage(watermarkUrl).catch(() => null);
    const W = 1080, H = 1920; const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H; const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, theme.bg); grad.addColorStop(0.28, theme.surface2); grad.addColorStop(0.62, colorMix(theme.sky, theme.surface2, 0.35)); grad.addColorStop(1, theme.accent); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.5, 180, 20, W * 0.5, 180, 520); glow.addColorStop(0, "rgba(255,255,255,0.16)"); glow.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 700);
    for (let i = 0; i < 180; i++) { const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 2.4 + 0.3; ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.35 + 0.06})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = "#fff"; ctx.font = "28px Arial"; for (let y = 80; y < 1840; y += 160) for (let x = 60; x < 1040; x += 140) ctx.fillText(theme.particle[0] ?? "✦", x + ((y / 160) % 2) * 35, y); ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.strokeRect(36, 36, W - 72, H - 72);
    if (logoImg) {
      const cx = W / 2, cy = 132, rad = 64; ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 28; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip(); const ratio = logoImg.width / logoImg.height; let dw = rad * 2.2, dh = dw / ratio; if (dh < rad * 2) { dh = rad * 2.2; dw = dh * ratio; } ctx.drawImage(logoImg, cx - dw / 2, cy - dh / 2, dw, dh); ctx.restore(); ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, rad + 3, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "900 48px Changa, sans-serif"; ctx.fillText(season.canvasTitle, W / 2, 258); ctx.fillStyle = theme.accent2; ctx.font = "700 28px Oswald, Changa, sans-serif"; ctx.fillText(season.canvasSubtitle, W / 2, 300);
    const rule = ctx.createLinearGradient(W * 0.18, 0, W * 0.82, 0); rule.addColorStop(0, "rgba(255,255,255,0)"); rule.addColorStop(0.5, "rgba(255,255,255,.75)"); rule.addColorStop(1, "rgba(255,255,255,0)"); ctx.strokeStyle = rule; ctx.beginPath(); ctx.moveTo(W * 0.18, 328); ctx.lineTo(W * 0.82, 328); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = "700 22px Changa, sans-serif"; ctx.fillText(`اخترت ${list.length} من ${total} عمل`, W / 2, 362);
    const count = list.length; let fontTitle = 30, fontMeta = 18, lineH = 84, cols = 1;
    if (count > 14) { cols = 2; if (count <= 20) { fontTitle = 23; fontMeta = 15; lineH = 66; } else if (count <= 26) { fontTitle = 19; fontMeta = 13; lineH = 56; } else { fontTitle = 18; fontMeta = 12; lineH = 52; } }
    else if (count <= 8) { fontTitle = 32; fontMeta = 20; lineH = 92; } else { fontTitle = 28; fontMeta = 18; lineH = 78; }
    const startY = 410;
    const rowCount = cols === 1 ? count : Math.ceil(count / 2);
    const maxContentHeight = 1240;
    if (rowCount > 1) lineH = Math.min(lineH, maxContentHeight / rowCount);
    list.forEach((anime, idx) => { const isSecond = cols === 2 && idx >= Math.ceil(count / 2); const colIdx = cols === 1 ? 0 : (isSecond ? 1 : 0); const rowIdx = cols === 1 ? idx : (isSecond ? idx - Math.ceil(count / 2) : idx); const x = colIdx === 0 ? 72 : 552; const y = startY + rowIdx * lineH; const dt = anime.title.length > (cols === 1 ? 52 : 32) ? anime.title.slice(0, cols === 1 ? 52 : 32) + "…" : anime.title; const gt = anime.genre.length > (cols === 1 ? 38 : 26) ? anime.genre.slice(0, cols === 1 ? 38 : 26) + "…" : anime.genre; ctx.textAlign = "left"; ctx.fillStyle = theme.accent2; ctx.font = `800 ${fontMeta}px Oswald, Changa, sans-serif`; ctx.fillText(`${idx + 1}`, x, y - 6, 30); ctx.fillStyle = "#fff"; ctx.font = `800 ${fontTitle}px Changa, sans-serif`; ctx.fillText(dt, x + 34, y, cols === 1 ? 860 : 420); ctx.fillStyle = "rgba(223,242,255,.88)"; ctx.font = `600 ${fontMeta}px Changa, sans-serif`; ctx.fillText(`${anime.date} • ${gt}`, x + 34, y + fontTitle * 0.7, cols === 1 ? 860 : 420); });
    if (watermarkImg) { ctx.save(); ctx.globalAlpha = 0.09; const size = 620, ratio = watermarkImg.width / watermarkImg.height; let dw = size, dh = size / ratio; if (dh > size) { dh = size; dw = size * ratio; } ctx.translate(W / 2, 980); ctx.rotate(-0.32); ctx.drawImage(watermarkImg, -dw / 2, -dh / 2, dw, dh); ctx.restore(); }
    const footRule = ctx.createLinearGradient(80, 0, W - 80, 0); footRule.addColorStop(0, "rgba(255,255,255,0)"); footRule.addColorStop(0.5, "rgba(255,255,255,.5)"); footRule.addColorStop(1, "rgba(255,255,255,0)"); ctx.strokeStyle = footRule; ctx.beginPath(); ctx.moveTo(80, 1710); ctx.lineTo(W - 80, 1710); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "800 26px Changa, sans-serif"; ctx.fillText(`${total} عمل في ${season.name} ${season.year} • ${season.nameEn.toUpperCase()} ${season.year}`, W / 2, 1752); ctx.fillStyle = theme.accent2; ctx.font = "700 20px Changa, sans-serif"; ctx.fillText("otaku fel qema  •  أوتاكو في القمة", W / 2, 1858); ctx.fillStyle = "rgba(255,255,255,.58)"; ctx.font = "600 14px Changa, sans-serif"; ctx.fillText(season.canvasFooter, W / 2, 1886);
    const dataUrl = canvas.toDataURL("image/png"); const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), "image/png", 0.92) as unknown as Blob); return { dataUrl, blob };
  };
  const handleCreateImage = async () => { if (!selected.size) { showToast("اختار عمل واحد على الأقل ⭐"); return; } setGenerating(true); try { const { dataUrl, blob } = await buildCanvas(selectedList); setGeneratedUrl(dataUrl); setGeneratedBlob(blob); setShowModal(true); } catch { showToast("حصلت مشكلة في إنشاء الصورة، جرّب تاني"); } finally { setGenerating(false); } };
  const handleDownload = () => { if (!generatedUrl) return; const a = document.createElement("a"); a.href = generatedUrl; a.download = `my-${season.shareFilePrefix}-list-${selected.size}.png`; document.body.appendChild(a); a.click(); a.remove(); showToast("تم التحميل ⬇️"); };
  const handleShareImage = async () => { if (!generatedBlob) { handleDownload(); return; } const file = new File([generatedBlob], `${season.shareFilePrefix}-${selected.size}.png`, { type: "image/png" }); // @ts-ignore
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { // @ts-ignore
        await navigator.share({ files: [file], title: season.shareTitle, text: `اخترت ${selected.size} من ${total} عمل في ${season.name} ${season.year}` }); showToast("تمت المشاركة ✨"); return; } catch { } } handleDownload(); };

  const saveLabel = saveState === "saving" ? "جارٍ الحفظ…" : saveState === "saved" ? "تم حفظ اختياراتك ✓" : saveState === "offline" ? "الحفظ غير متاح حالياً" : saveState === "error" ? "تعذّر الحفظ — حاول مجدداً" : saveState === "loading" ? "جارٍ تحميل اختياراتك…" : "اختياراتك تُحفظ هنا";

  return (
    <div data-safe-area-inset-root style={{ ...THEME_VARS, boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }} className="relative min-h-screen w-full overflow-x-clip bg-[var(--bg)] text-[var(--cream)]" dir="rtl">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--sky)_22%,transparent),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_80%_0%,color-mix(in_srgb,var(--accent-2)_12%,transparent),transparent_60%)]" />
        <div className="absolute inset-[-30%] opacity-[0.07]" style={{ backgroundImage: `url(${watermarkUrl})`, backgroundRepeat: "repeat", backgroundSize: "440px auto", backgroundPosition: "center", transform: "rotate(-18deg)" }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      {SNOW.map((s, i) => <span key={i} className="snowflake" style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, fontSize: `${s.size}px` }}>{s.char}</span>)}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-3 pb-10 sm:px-6 lg:px-8">
        {/* TOP BAR — small logo */}
        <div className="sticky top-[calc(var(--safe-area-inset-top)+0.5rem)] z-30 mt-3 flex items-center justify-between gap-2 rounded-2xl glass px-3 py-2.5 sm:px-4" data-safe-area-sticky-top>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-70 blur-sm" />
              <img src={logoUrl} alt="شعار أوتاكو في القمة" className="relative h-[48px] w-[48px] rounded-full border border-white/40 object-cover shadow-[0_8px_24px_rgba(0,0,0,.35)] sm:h-[56px] sm:w-[56px]" />
            </div>
            <div className="leading-tight"><p className="text-[13px] font-black tracking-wide sm:text-sm">أوتاكو في القمة</p><p dir="ltr" className="font-en text-[10px] font-bold tracking-[0.22em] text-[var(--accent-2)]/90">{season.subtitle}</p></div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-[11px] font-black text-[var(--navy)] shadow-[0_8px_24px_rgba(255,255,255,.12)]"><Snowflake className="h-3.5 w-3.5" /> {season.badge}</span>
        </div>

        <header className="relative mt-8 text-center md:mx-auto md:max-w-4xl lg:mt-12">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--sky)_18%,transparent),transparent_70%)] blur-2xl" />
          <span className="relative inline-flex min-h-9 items-center gap-2 rounded-full border border-white/20 bg-white/[0.07] px-4 py-1.5 text-[11px] font-extrabold tracking-wide text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-md sm:text-xs"><Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" /> قائمة من الملف فقط • اختار بالنجمة ⭐</span>
          <h1 className="relative mt-5 text-[clamp(1.9rem,7vw,5rem)] font-black leading-[1.02] tracking-tight [text-shadow:0_4px_40px_color-mix(in_srgb,var(--sky)_35%,transparent)] sm:mt-7">
            <span className="block text-white/95">{season.titleLine1}</span>
            <span className="mt-1 block bg-gradient-to-b from-white via-[var(--accent)] to-[var(--sky)] bg-clip-text text-transparent">{season.titleLine2}</span>
          </h1>
          <p dir="ltr" className="font-en relative mt-4 text-sm font-bold tracking-[0.32em] text-[var(--accent-2)]/90 sm:text-base">{season.subtitle} <span className="mx-2 text-white/30">•</span> {total} TITLES</p>
          <p className="relative mx-auto mt-4 max-w-[680px] text-[14px] font-semibold leading-7 text-[#d4e9fb]/90 sm:text-[15px] sm:leading-8">{season.description}</p>
          <div className="ice-rule mx-auto mt-6 max-w-[220px] sm:max-w-[360px]" />
          <div className="relative mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3">
            {[{ label: "الأعمال", value: String(total) }, { label: "المواعيد", value: String(groups.length) }, { label: "اختياراتك", value: String(selected.size) }].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-3 py-3 sm:py-4">
                <div className="font-en text-xl font-bold text-white sm:text-2xl">{stat.value}</div>
                <div className="mt-0.5 text-[11px] font-bold text-[var(--muted)] sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* TOP 5 SWIPE */}
        <section aria-label="أفضل 5 أعمال" className="mt-10 sm:mt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p dir="ltr" className="font-en text-[11px] font-bold tracking-[0.28em] text-[var(--accent-2)]/80">CURATED PICKS</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-black sm:text-2xl"><span className="text-2xl">🏆</span> Top 5 سوايب</h2>
            </div>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-[var(--muted)]">اسحب يمين وشمال ←</span>
          </div>
          <div className="no-scrollbar -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 sm:gap-4">
            {top5.map((a, i) => { const isSel = selected.has(a.title); return (
              <article key={a.title} className={`anime-card group relative mx-1 w-[248px] shrink-0 snap-center overflow-hidden rounded-[28px] p-4 sm:w-[292px] lg:w-[312px] ${isSel ? "ring-1 ring-white/70 shadow-[0_0_0_1px_rgba(255,255,255,.18),0_24px_60px_rgba(124,196,255,.18)]" : ""}`}>
                {a.image && (
                  <>
                    <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.03]" style={{ backgroundImage: `url(${a.image})` }} aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#071a3a]/20 via-[#071a3a]/45 to-[#071a3a]/95" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden="true" />
                  </>
                )}
                <div className="relative z-10 [text-shadow:0_2px_12px_rgba(0,0,0,.65)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/60 bg-white/95 px-3 py-1 text-[11px] font-black text-[var(--navy)] shadow-sm">#{i + 1} <span className="font-en tracking-wider">TOP</span></span>
                    <button onClick={() => toggle(a.title)} aria-label={isSel ? "إزالة" : "إضافة"} className={`premium-btn flex h-10 w-10 items-center justify-center rounded-full text-lg backdrop-blur-md ${isSel ? "bg-white text-[var(--navy)] shadow-[0_8px_24px_rgba(255,255,255,.2)]" : "border border-white/35 bg-black/20 text-white hover:bg-white/10"}`}>{isSel ? "★" : "☆"}</button>
                  </div>
                  <p className="mt-4 text-[11px] font-bold tracking-wide text-[var(--accent-2)]/95">{a.releaseDate ?? a.date} <span className="text-white/35">•</span> {a.genre}</p>
                  <h3 dir="ltr" className="mt-2 text-center text-[1.35rem] font-bold leading-snug [overflow-wrap:anywhere] sm:text-[1.45rem]">{a.title}</h3>
                  <p className="mt-3 text-[12px] font-semibold leading-6 text-[#e8f6ff]/90 [overflow-wrap:anywhere]">{a.synopsis.length > 110 ? a.synopsis.slice(0, 110) + "…" : a.synopsis}</p>
                </div>
              </article>); })}
          </div>
        </section>

        {/* SEARCH + FILTERS */}
        <section className="mt-6 rounded-[28px] glass p-4 sm:p-5" aria-label="بحث وفلاتر">
          <div className="flex flex-col gap-4">
            <label className="relative block">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accent-2)]/80" />
              <span className="sr-only">ابحث في القائمة</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={season.searchPlaceholder} className="w-full rounded-2xl border border-white/15 bg-[var(--navy)]/55 py-3.5 pl-4 pr-11 text-[15px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)] placeholder:text-[var(--muted)]/75 outline-none transition focus:border-white/35 focus:bg-[var(--navy)]/70" />
            </label>
            <div className="flex flex-wrap gap-2">{FILTERS.map((f) => <button key={f} onClick={() => setActiveFilter(f)} className={`premium-btn rounded-full px-4 py-2 text-[13px] font-extrabold transition ${activeFilter === f ? "bg-white text-[var(--navy)] shadow-[0_10px_24px_rgba(255,255,255,.14)]" : "border border-white/15 bg-white/[0.04] text-white/90 hover:border-white/25 hover:bg-white/[0.08]"}`}>{f}</button>)}</div>
            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => setExpanded(!expanded)} className="premium-btn flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-black text-[var(--navy)] shadow-[0_10px_24px_rgba(255,255,255,.12)]">{expanded ? "طيّ القائمة" : "عرض القائمة"} <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} /></button>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-[11px] font-bold text-[var(--muted)]">{saveLabel}</span>
                <span className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-extrabold text-[var(--accent)]">{filtered.reduce((n, g) => n + g.items.length, 0)} / {total}</span>
              </div>
            </div>
            {selected.size > 0 && <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.09] to-white/[0.03] px-4 py-3 text-xs font-bold text-[var(--cream)]"><Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" /> <span>اخترت {selected.size} عمل — انزل تحت لإنشاء صورة قائمتك</span><button onClick={clearAll} className="mr-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 transition hover:bg-white/10"><Trash2 className="h-3.5 w-3.5" /> مسح</button></div>}
          </div>
        </section>

        {/* SNOW JOURNEY TIMELINE */}
        {expanded && (
          <div className="mt-8 space-y-6 md:space-y-8">
            {filtered.length === 0 && <div className="glass rounded-[28px] border-dashed p-10 text-center"><p className="text-xl font-black">مفيش نتيجة مطابقة {season.emoji}</p><p className="mt-2 text-sm text-[#d4e9fb]/85">جرّب كلمة تانية أو اختار «الكل».</p><button onClick={() => { setQuery(""); setActiveFilter("الكل"); }} className="premium-btn mt-5 min-h-11 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[var(--navy)]">إعادة ضبط القائمة</button></div>}
            {filtered.map((group) => (
              <section key={group.date} aria-label={group.date} className="rounded-[32px] border border-white/10 bg-white/[0.02] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] sm:p-4 md:p-5">
                <div className="date-strip rounded-2xl px-4 py-4 sm:px-5">
                  <div className="relative flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.18em] text-[var(--accent-2)]/90"><CalendarDays className="h-4 w-4" /> موعد العرض <span className="font-en text-white/35">RELEASE</span></p>
                      <h2 className="mt-1 text-[clamp(1.6rem,6vw,2.2rem)] font-black leading-none text-white">{group.date}</h2>
                    </div>
                    <div className="shrink-0 text-left">
                      <div className="font-en text-3xl font-bold leading-none text-white">{String(group.items.length).padStart(2, "0")}</div>
                      <div className="mt-1 text-[10px] font-black tracking-[0.18em] text-[var(--muted)]">عمل <span className="font-en">TITLES</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {group.items.map((anime) => { const isSel = selected.has(anime.title); const open = openSynopsis.has(anime.title); return (
                    <article key={anime.title} className={`anime-card group overflow-hidden rounded-[28px] p-4 sm:p-5 ${isSel ? "ring-1 ring-white/60 shadow-[0_0_0_1px_rgba(255,255,255,.15),0_24px_60px_rgba(124,196,255,.14)]" : ""}`}>
                      {anime.image && (
                        <>
                          <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.03]" style={{ backgroundImage: `url(${anime.image})` }} aria-hidden="true" />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#071a3a]/30 via-[#071a3a]/62 to-[#071a3a]/94" aria-hidden="true" />
                          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
                        </>
                      )}
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-black text-white/95 backdrop-blur-md">{anime.releaseDate ?? group.date}</span>
                          <button onClick={() => toggle(anime.title)} aria-label={isSel ? "إزالة من القائمة" : "إضافة للقائمة"} className={`premium-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[18px] backdrop-blur-md ${isSel ? "border-white/70 bg-white text-[var(--navy)] shadow-[0_8px_24px_rgba(255,255,255,.18)]" : "border-white/25 bg-black/15 text-white hover:bg-white/10"}`}>{isSel ? "★" : "☆"}</button>
                        </div>
                        <h3 dir="ltr" className="mt-4 text-center text-[clamp(1.35rem,5vw,1.7rem)] font-bold leading-[1.15] [overflow-wrap:anywhere] [text-shadow:0_2px_14px_rgba(0,0,0,.45)]">{anime.title}</h3>
                        <p className="mt-2 text-center text-[13px] font-extrabold leading-6 text-[#eaf7ff]/90 [overflow-wrap:anywhere]">{anime.genre}</p>
                        <div className="mt-4 flex items-center gap-2"><span className="h-px flex-1 bg-gradient-to-l from-white/25 to-transparent" /><span className="text-[10px] font-black tracking-[0.2em] text-[#c9e7ff]/85">النبذة <span className="font-en">SYNOPSIS</span></span><span className="h-px flex-1 bg-gradient-to-r from-white/25 to-transparent" /></div>
                        <div className="mt-3 min-h-[72px]">
                          {open ? <p className="rounded-2xl border border-white/10 bg-[var(--navy)]/45 px-3.5 py-3 text-[13px] font-semibold leading-7 text-[#eaf7ff]/95 backdrop-blur-sm [overflow-wrap:anywhere]">{anime.synopsis}</p> : <p className="py-4 text-center text-[12px] font-bold text-[var(--accent-2)]/80">النبذة مخفية {season.emoji}</p>}
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-2">{anime.tag ? <span className="rounded-full border border-white/60 bg-white/95 px-3 py-1 text-[11px] font-black text-[var(--navy)]">{anime.tag}</span> : <span />}
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleSynopsis(anime.title)} className="premium-btn flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3 py-2 text-[11px] font-black backdrop-blur-sm hover:bg-white/10"><Eye className="h-3.5 w-3.5" /> {open ? "إخفاء" : "النبذة"}</button>
                            <button onClick={() => toggle(anime.title)} className={`premium-btn flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-black ${isSel ? "bg-white text-[var(--navy)] shadow-[0_8px_20px_rgba(255,255,255,.14)]" : "bg-[var(--accent)] text-[var(--navy)] shadow-[0_8px_20px_rgba(223,242,255,.12)]"}`}>{isSel ? <><Check className="h-3.5 w-3.5" /> تم</> : <><Star className="h-3.5 w-3.5" /> اختر</>}</button>
                          </div>
                        </div>
                      </div>
                    </article>); })}
                </div>
              </section>))}
          </div>
        )}

        <footer className="relative mt-10 overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-b from-[var(--surface-2)]/80 to-[var(--navy)] px-5 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,.25)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,.08),transparent_65%)]" />
          <div className="relative mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black text-[var(--accent)] backdrop-blur-md">{season.footerCta}</div>
          <h2 className="relative mt-5 text-[clamp(1.8rem,7vw,2.8rem)] font-black leading-[1.1] tracking-tight">{season.footerTitle1}<br /><span className="bg-gradient-to-b from-[var(--accent)] to-[var(--sky)] bg-clip-text text-transparent">{season.footerTitle2}</span></h2>
          <p className="relative mx-auto mt-4 max-w-[440px] text-sm font-semibold leading-7 text-[#d4e9fb]/90">{season.footerText}</p>
          <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">{season.hashtags.map((t) => <span key={t} dir="ltr" className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[var(--accent)]/90">{t}</span>)}</div>
          <div className="ice-rule relative mx-auto mt-7 max-w-[240px]" /><p className="relative mt-4 text-[11px] font-bold text-[var(--muted)]/85">القائمة من الملف فقط • بدون إضافة أعمال أو معلومات خارج القائمة</p>
        </footer>
        <p className="mt-5 text-center text-[11px] leading-5 text-[#8fb8da]/80">تصميم شتوي بمقاس مناسب للمشاركة • يُعرض بجودة عالية على الشاشات الكبيرة والهواتف</p>
        {selected.size > 0 && <div className="h-[118px]" />}
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[color-mix(in_srgb,var(--navy)_88%,transparent)] shadow-[0_-20px_60px_rgba(0,0,0,.35)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-[var(--accent)] text-[var(--navy)] shadow-[0_10px_24px_rgba(255,255,255,.12)]"><Star className="h-5 w-5 fill-[var(--navy)]" /></div>
              <div className="min-w-0"><p className="text-sm font-black [overflow-wrap:anywhere]">اخترت {selected.size} من {total} <span className="text-white/40">—</span> ⭐ قائمتي</p><p className="text-[11px] font-bold text-[var(--accent-2)]/85">اضغط «شير قايمتي» لعمل صورة 1080×1920</p></div>
            </div>
            <div className="flex gap-2 sm:w-auto">
              <button onClick={handleCreateImage} disabled={generating} className="premium-btn flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[var(--navy)] shadow-[0_12px_28px_rgba(255,255,255,.12)] disabled:opacity-60 sm:min-w-[200px]">{generating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--navy)]/25 border-t-[var(--navy)]" /> : <Share2 className="h-4 w-4" />}{generating ? "بنجهز الصورة..." : "شير قايمتي 📤"}</button>
              <button onClick={clearAll} className="premium-btn flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-black hover:bg-white/[0.09]"><Trash2 className="h-4 w-4" /> امسح الكل</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl pt-[max(1rem,var(--safe-area-inset-top))] pb-6">
          <div className="flex min-h-full items-start justify-center p-3 sm:items-center sm:p-6"><div className="glass w-full max-w-[720px] overflow-hidden rounded-[28px] shadow-[0_32px_100px_rgba(0,0,0,.5)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-[var(--accent)] text-lg text-[var(--navy)] shadow-sm">{season.emoji}</div><div><p className="text-sm font-black sm:text-base">صورة قائمتك جاهزة 📸</p><p className="text-[11px] font-bold text-[var(--accent-2)]/85">{season.storyLabel}</p></div></div>
              <button onClick={() => setShowModal(false)} aria-label="إغلاق" className="premium-btn flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 sm:p-5">
              {generatedUrl ? <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/40 shadow-inner"><img src={generatedUrl} alt={`${season.shareTitle} - ${selected.size} عمل`} className="mx-auto block h-auto max-h-[calc(100dvh-var(--safe-area-inset-top)-15rem)] w-full object-contain" /></div> : <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center"><p className="text-sm font-bold text-[var(--accent)]">جاري تجهيز الصورة...</p></div>}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button onClick={handleDownload} className="premium-btn flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[var(--navy)] shadow-[0_10px_24px_rgba(255,255,255,.1)]"><Download className="h-4 w-4" /> تحميل PNG ⬇️</button>
                <button onClick={handleShareImage} className="premium-btn flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[var(--accent)]/95 px-5 py-3.5 text-sm font-black text-[var(--navy)]"><Share2 className="h-4 w-4" /> مشاركة الصورة</button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-xs font-black text-[var(--accent-2)]">قائمتك كنص:</p>
                <p className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-[11px] leading-6 font-semibold text-[#eaf7ff]/90 [overflow-wrap:anywhere]">{selectedList.map((a, i) => `${i + 1}. ${a.title} • ${a.date} • ${a.genre}`).join("\n")}</p>
              </div>
              <p className="mt-4 text-center text-[11px] font-bold leading-5 text-[var(--muted)]/80">اللوجو في الأعلى، وعلامة مائية شفافة للوجو في الأسفل — صورة PNG جاهزة للنشر كستوري.</p>
            </div>
          </div></div>
        </div>
      )}
      {toast && <div className="fixed bottom-[132px] left-1/2 z-[70] -translate-x-1/2 rounded-full border border-white/15 bg-[color-mix(in_srgb,var(--navy)_88%,black)] px-5 py-2.5 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,0,0,.4)] backdrop-blur-xl">{toast}</div>}
    </div>
  );
}
