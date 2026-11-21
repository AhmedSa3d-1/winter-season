import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Star, X, Trash2, Check, Snowflake, Eye, Download, Share2, Sparkles, CalendarDays } from "lucide-react";
import logoUrl from "./assets/1a3e951f2b30e0fe-photo1746480554737042166.jpeg";
import watermarkUrl from "./assets/logo_transparent.png";

type Anime = { title: string; genre: string; synopsis: string; tag?: string };
type Group = { date: string; short: string; items: Anime[] };

const groups: Group[] = [
  { date: "ديسمبر 2026", short: "DEC", items: [
    { title: "The Apothecary Diaries: The Late Lady's Treasure", genre: "دراما، تاريخي، طبي، غموض", synopsis: "لغز جديد حول كنز سري مخبأ في مدينة على الماء، في مغامرة شتوية دافئة لماو ماو. - فيلم", tag: "فيلم" },
    { title: "WONDERING MATE", genre: "خيال علمي", synopsis: "آكو، أفاتار فتاة ثانوية تحلم أن تصبح إنسانة، وبيت، أفاتار لا يريد أن يصبح إنسانًا. قصة أفاتارين قد يتغيران في عالم لم يكن من المفترض أن يتغير." },
    { title: "Disney Twisted-Wonderland The Animation Season 2: Episode of Savanaclaw", genre: "فانتازيا، إيسيكاي، مدرسي", synopsis: "اقتباس أنمي للعبة موبايل ديزني اليابانية، في فصل جديد داخل أكاديمية نايت ريفن. - موسم جديد" },
    { title: "The Reincarnated Elf Left on a Journey to Master His Magic...", genre: "مغامرة، فانتازيا، إيسيكاي، تناسخ", synopsis: "موظف عمره 30 سنة يموت في حادثة ويولد من جديد إلفًا اسمه ليز. الإلف يعيش حتى 1000 سنة، فيقرر أن يغادر البيت ويعيش حياة كاملة ويتقن السحر." },
    { title: "Spirit Circle", genre: "أكشن، مغامرة، كوميدي، دراما، رومانسي، تناسخ", synopsis: "فوتا أوكيا، فتى عمره 14 سنة يرى الأشباح، معجب بزميلته الجديدة كوكو إيشيجامي. كوكو تخبره أن العلامة على خده لعنة صنعتها في حياة سابقة، فيبدأ في اكتشاف علاقتهما عبر الحيوات الماضية." },
  ]},
  { date: "4 يناير 2027", short: "04", items: [
    { title: "Haru to Gen ~70-sai, Hajimete no Kosodate~", genre: "حياة يومية، دراما", synopsis: "زوجان في السبعين يبدآن لأول مرة رحلة تربية طفل، في قصة إنسانية هادئة عن العائلة والبدايات الجديدة. - عمل قصير" },
    { title: "Welcome to Demon School! Iruma-kun: IruMafia Edition", genre: "فانتازيا، جريمة منظمة", synopsis: "إيروما، فتى فقير وطيب، يساعد رجلًا عجوزًا مصابًا ويكتشف أنه دون سوليفان، زعيم مافيا بابيل. دون يأخذه ويطلب منه أن يصبح حفيده ووريث عصابة شياطين." },
    { title: "Shin Oishinbo", genre: "كوميدي، أكل، حياة يومية", synopsis: "عودة جديدة لعالم الطعام والحياة اليومية، مع أطباق شتوية ونكهات تجمع الناس حول مائدة واحدة." },
    { title: "Magical Buffs: The Support Caster is Stronger Than He Realized!", genre: "أكشن، فانتازيا", synopsis: "ويم، ساحر دعم يقوّي حلفاءه بتعاويذه. فريقه يطرده لأنه يرى أن سحر الدعم بلا فائدة في القتال، فيبدأ من جديد وحده ويثبت أن الدعم هو أقوى سحر." },
  ]},
  { date: "5 يناير 2027", short: "05", items: [
    { title: "Mera x Death: The Strange Love Between Me and the Reaper", genre: "أكشن، فانتازيا", synopsis: "علاقة غريبة بين فتى وحاصدة أرواح، بين الخطر والمشاعر، في قصة تجمع الأكشن بالرومانسية السوداوية." },
  ]},
  { date: "6 يناير 2027", short: "06", items: [
    { title: "Wanpaku! Touken Ranbu", genre: "كوميدي، تاريخي", synopsis: "نسخة مصغرة مرحة من سيوف توكين رانبو، في مواقف يومية خفيفة وشقاوة شتوية. - عمل قصير" },
    { title: "Multi-mind Mayhem", genre: "أكشن، فانتازيا، إيسيكاي، تناسخ", synopsis: "بارد، وريث عائلة نبيلة، بداخله 3 أرواح: روحه، ومحارب من عصر سينجوكو، وطالب ثانوي أوتاكو من العصر الحديث. يستخدم خبراتهم الثلاثة ليصبح مقاتلًا ومخترعًا ورجل أعمال." },
  ]},
  { date: "7 يناير 2027", short: "07", items: [
    { title: "Gacha Girls Corps", genre: "أكشن، مغامرة، فانتازيا", synopsis: "مغامرة العمر مضمونة، مع فريق بنات يخوض معارك وحظوظًا لا تتوقف في عالم مليء بالمفاجآت." },
    { title: "CHARISMA", genre: "كوميدي، حياة يومية", synopsis: "مجموعة شباب يعيشون معًا في بيت واحد، وكل واحد يحاول أن ينمّي الكاريزما الخاصة به ويصل إلى «الكاريزما الحقيقية»." },
    { title: "I Lost My Adventurer's License, but It's Fine Because I Have an Adorable Daughter Now", genre: "أكشن، مغامرة، فانتازيا", synopsis: "دوجلاس، ساحر تعزيز أسطوري سابق، طُرد من فريق البطل وسُحبت منه رخصته. أصبح متشردًا حتى قابل رابي، بنت صغيرة ملعونة، فتبدأ مغامرة جديدة بينهما بعلاقة أبوية." },
    { title: "Are You a Landmine, Chihara-san?", genre: "كوميدي، رومانسي", synopsis: "طالب ثانوي يجلس بجانب ماي تشيهارا، البنت التي يقول عنها الجميع «لغم» بسبب ستايلها الغامق ونظرتها الحادة. يكتشف أنها ليست خطيرة كما يظن الناس، وأنها بنت طيبة بطريقة غريبة." },
    { title: "Otherworldly Munchkin: Let's Speedrun the Dungeon with Only 1 HP!", genre: "أكشن، مغامرة، فانتازيا، إيسيكاي، تناسخ", synopsis: "يوكيو، 16 سنة، يموت وهو ينقذ أخته الصغيرة سانا، 14 سنة، من غول. يُعرض عليه التناسخ، فيقرر أن يبحث عن أخته وينقذها حتى لو كان معه 1 HP فقط." },
  ]},
  { date: "8 يناير 2027", short: "08", items: [
    { title: "BanG Dream! MyGO!!!!! // Ave Mujica", genre: "دراما، موسيقى", synopsis: "فصل جديد من فرق بانج دريم، بين الموسيقى والمشاعر والصراع على المسرح في ليالي الشتاء." },
    { title: "BLESS", genre: "دراما، فنون بصرية", synopsis: "آيا، عُرض عليه أن يصبح موديل وهو صغير، لكن حلمه الحقيقي أن يصبح خبير مكياج. يقابل جون، زميلته التي تخجل من النمش في وجهها، فيقرران دخول مسابقة عروض أزياء في المدرسة معًا، هو بالمكياج وهي بالعرض." },
  ]},
  { date: "9 يناير 2027", short: "09", items: [
    { title: "YAIBA: Samurai Legend Season 2", genre: "مغامرة، ساموراي", synopsis: "عودة يايبا في موسم ثانٍ مليء بالسيوف والمنافسات والروح القتالية. - موسم جديد" },
    { title: "The Eternal Fool's Words of Wisdom: A Pawsitively Fantastic Adventure", genre: "فانتازيا", synopsis: "أسلي، ساحر شاب عاش منعزلًا ألفي سنة، مع رفيقه الكلب بوتي. بوتي يطلب منه أن يخرج ليرى العالم من جديد، فيعود للمجتمع ويحاول أن يستعيد اسمه ويواجه شرًا كبيرًا." },
    { title: "MASHLE: MAGIC AND MUSCLES The Tri-Magicathlon Divine Visionary Final Exam Arc", genre: "أكشن، كوميدي، فانتازيا، مدرسي، ساخر", synopsis: "ماش يعود في اختبار جديد يجمع العضلات والسحر والكوميديا، في أقوى فصل من الامتحانات. - موسم جديد" },
    { title: "The Fable 2nd Season", genre: "كوميدي، جريمة منظمة", synopsis: "عودة القاتل الأسطوري في حياة يومية هادئة ظاهريًا، لكن الفوضى لا تتركه أبدًا. - موسم جديد" },
  ]},
  { date: "10 يناير 2027", short: "10", items: [
    { title: "Peropero Sparkles", genre: "كوميدي، حياة يومية", synopsis: "حكايات صغيرة لامعة عن الأكل والضحك واللحظات اليومية التي تصنع يومًا أجمل." },
    { title: "Josemaru", genre: "حياة يومية", synopsis: "قصة قصيرة مرحة عن يوميات شخصية لا تتوقف عن إثارة الضحك. - عمل قصير" },
    { title: "Mercedes and the Waning Moon", genre: "مغامرة، فانتازيا، مصاص دماء", synopsis: "مرسيدس، وُلدت من جديد مصاصة دماء لأب نبيل وأم منبوذة. تعرف أن أباها سيختار وريثًا غيرها، فتفكر كيف ستعيش هي وأمها والخادمة العجوز وحدهن." },
    { title: "Shangri-La Frontier Season 3", genre: "أكشن، مغامرة، فانتازيا، ألعاب فيديو", synopsis: "سونراكو يعود إلى أخطر لعبة في العالم، في موسم ثالث مليء بالزعماء والأسرار والتحديات. - موسم جديد" },
  ]},
  { date: "11 يناير 2027", short: "11", items: [
    { title: "THE ONE PIECE", genre: "مغامرة، أكشن، فانتازيا", synopsis: "إعادة إنتاج ملحمية لرحلة لوفي وطاقمه نحو الكنز الأسطوري، بروح جديدة ورؤية مختلفة للبداية التي أحبها الجميع. - موسم جديد" },
    { title: "Jujutsu Kaisen Season 3", genre: "أكشن، فانتازيا", synopsis: "يوجي ورفاقه يواجهون لعنة الإبادة في معارك أخطر من أي وقت، حيث يصبح كل قرار مصيريًا. - موسم جديد" },
    { title: "Frieren: Beyond Journey's End Season 2", genre: "مغامرة، فانتازيا، دراما", synopsis: "فريرن تواصل رحلتها لفهم المشاعر الإنسانية والذكريات، في فصل شتوي هادئ ومؤثر. - موسم جديد" },
    { title: "Kimi ni Todoke Season 3", genre: "رومانسي، مدرسي", synopsis: "ساواكو وكازيهايا يكبران معًا، وبين الخجل والاعترافات الصغيرة تكبر قصة حب لطيفة. - موسم جديد" },
    { title: "Blue Box Season 2", genre: "رومانسي، رياضي", synopsis: "تايكي وتشيناتسو بين الريشة وكرة السلة، وبين الحلم والقلب، في موسم ثانٍ مليء بالمشاعر الصادقة. - موسم جديد" },
  ]},
  { date: "12 يناير 2027", short: "12", items: [
    { title: "One-Punch Man Season 3 Part 2", genre: "أكشن، كوميدي", synopsis: "سايتاما يعود بلكمة واحدة، بينما تتصاعد حرب الأبطال والوحوش إلى ذروة لا تُنسى. - موسم جديد" },
    { title: "My Hero Academia: Final Season Part 2", genre: "أكشن", synopsis: "الفصل الأخير من معركة الأبطال، حيث يقرر ديكو ورفاقه مصير عالم الأبطال إلى الأبد. - موسم جديد" },
    { title: "Dandadan Season 2 Part 2", genre: "أكشن، كوميدي، خارق", synopsis: "موومو وأوكارون بين الأشباح والفضائيين، في مغامرة مجنونة لا تعرف الهدوء. - موسم جديد" },
    { title: "SPY x FAMILY Season 3 Part 2", genre: "أكشن، كوميدي", synopsis: "عائلة فورجر تعود بأسرار ومهمات ومواقف عائلية مضحكة، وأنيا كالعادة في قلب الفوضى. - موسم جديد" },
  ]},
  { date: "13 يناير 2027", short: "13", items: [
    { title: "SAKAMOTO DAYS Season 2", genre: "أكشن، كوميدي", synopsis: "ساكاموتو، القاتل الأسطوري الذي أصبح صاحب متجر، يعود لحماية عائلته بأسلوب مضحك وقوي. - موسم جديد" },
    { title: "Chainsaw Man: Reze Arc", genre: "أكشن، فانتازيا", synopsis: "دينجي يلتقي ريزي في قصة حب وخطر، في فصل سينمائي مشحون بالمشاعر والانفجارات. - فيلم", tag: "فيلم" },
    { title: "Oshi no Ko Season 3", genre: "دراما، موسيقى", synopsis: "أكوا وروبي يواصلان كشف أسرار عالم الأيدولز والانتقام والشهرة. - موسم جديد" },
    { title: "Re:Zero Season 4", genre: "إيسيكاي، فانتازيا، دراما", synopsis: "سوبارو يعود للموت والعودة من جديد، في مواجهة ألم جديد واختيارات أصعب. - موسم جديد" },
  ]},
  { date: "14 يناير 2027", short: "14", items: [
    { title: "Mushoku Tensei Season 3", genre: "إيسيكاي، فانتازيا", synopsis: "روديوس يواصل رحلته في عالم جديد، بين العائلة والسحر والمسؤولية. - موسم جديد" },
    { title: "That Time I Got Reincarnated as a Slime Season 4", genre: "إيسيكاي، فانتازيا", synopsis: "ريمورو يبني مملكته ويواجه أعداء جددًا بحكمة وقوة لا تتوقف. - موسم جديد" },
    { title: "The Apothecary Diaries Season 3", genre: "دراما، غموض", synopsis: "ماو ماو تعود بألغاز القصر وأسرار الطب والسموم في موسم جديد. - موسم جديد" },
    { title: "Kaguya-sama: Love is War Season 4", genre: "رومانسي، كوميدي", synopsis: "كاغويا وشيروغاني في حرب حب جديدة، من سيفترف أولًا؟ - موسم جديد" },
  ]},
  { date: "15 يناير 2027", short: "15", items: [
    { title: "Horimiya: The Missing Pieces Season 2", genre: "رومانسي، كوميدي", synopsis: "هوري وميامورا يعودان بلحظات لم تُحكَ بعد، مليئة بالدفء والضحك. - موسم جديد" },
    { title: "Demon Slayer: Infinity Castle Part 2", genre: "أكشن، فانتازيا", synopsis: "تانجيرو ورفاقه في قلب القلعة اللانهائية، في معركة مصيرية ضد موزان. - فيلم", tag: "فيلم" },
    { title: "Fruits Basket: Prelude", genre: "رومانسي، دراما", synopsis: "قصة حب والدي تورو، البداية التي صنعت كل شيء في فروتس باسكت. - فيلم", tag: "فيلم" },
    { title: "A Couple of Cuckoos Season 2", genre: "رومانسي، كوميدي", synopsis: "ناجي وإيريكا وأصدقاؤهما في فوضى رومانسية جديدة لا تنتهي. - موسم جديد" },
  ]},
  { date: "16 يناير 2027", short: "16", items: [
    { title: "Call of the Night Season 2", genre: "رومانسي، فانتازيا، مصاص دماء", synopsis: "كو ونازونا تحت سماء الليل، بين الحرية والحب والخلود. - موسم جديد" },
    { title: "Rent-a-Girlfriend Season 4", genre: "رومانسي، كوميدي", synopsis: "كازويا وشيزورو في موسم جديد من الارتباك والمشاعر غير المحسومة. - موسم جديد" },
    { title: "The Dangers in My Heart Season 3", genre: "رومانسي، كوميدي", synopsis: "إيتشيكاوا ويامادا يكبران معًا، في قصة مراهقة صادقة ولطيفة. - موسم جديد" },
    { title: "Aikatsu! Winter Stage", genre: "موسيقى، مدرسي", synopsis: "أويكاتسو تعود على مسرح الشتاء، حيث تلمع الأيدولز بالأغاني والرقصات والأحلام الكبيرة." },
  ]},
  { date: "17 يناير 2027", short: "17", items: [
    { title: "WIND BREAKER Season 3", genre: "أكشن، مدرسي", synopsis: "ساكورا وفرقة بوفورين يحمون مدينتهم في موسم جديد من القتال والصداقة. - موسم جديد" },
    { title: "Kaiju No. 8 Season 2 Part 2", genre: "أكشن، فانتازيا", synopsis: "كافكا يواجه الكايجو الأقوى، بينما يقاتل ليحمي من يحبهم. - موسم جديد" },
    { title: "Fate/strange Fake Season 2", genre: "أكشن، فانتازيا", synopsis: "حرب كأس مزيفة في أمريكا، مع خدم وأبطال وصراع لا يتوقف. - موسم جديد" },
    { title: "Gachiakuta Season 2", genre: "أكشن، فانتازيا", synopsis: "رودو يحول القمامة إلى قوة، في عالم قاسٍ لا يرحم الضعفاء. - موسم جديد" },
  ]},
];

const total = groups.reduce((n, g) => n + g.items.length, 0);
const COLLECTION = "winter2027_picks";
const FILTERS = ["الكل", "أفلام", "مواسم جديدة", "أكشن", "رومانسي", "كوميدي", "إيسيكاي", "فانتازيا"];
const TOP5_TITLES = ["Spirit Circle", "THE ONE PIECE", "One-Punch Man Season 3 Part 2", "Shangri-La Frontier Season 3", "SAKAMOTO DAYS Season 2"];
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
const SNOW = Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 9) * 1.1, dur: 9 + (i % 6) * 2.2, size: 10 + (i % 4) * 5, char: i % 3 === 0 ? "❄" : i % 3 === 1 ? "✦" : "•" }));

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
            const created = await callApi("records.create", { collection: COLLECTION, value: { titles: ordered }, idempotency_key: "winter2027-picks-v1" });
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
    if (activeFilter === "الكل") return true;
    if (activeFilter === "أفلام") return a.tag === "فيلم" || a.genre.includes("فيلم");
    if (activeFilter === "مواسم جديدة") return a.title.includes("Season") || a.title.includes("Part") || a.synopsis.includes("موسم جديد");
    return a.genre.includes(activeFilter);
  };

  const selectedList: SelectedDetail[] = useMemo(() => { const o: SelectedDetail[] = []; groups.forEach((g) => g.items.forEach((it) => { if (selected.has(it.title)) o.push({ ...it, date: g.date }); })); return o; }, [selected]);
  const filtered = useMemo(() => groups.map((g) => ({ ...g, items: g.items.filter((a) => matchesFilter(a) && (a.title.toLowerCase().includes(query.toLowerCase()) || a.genre.includes(query) || a.synopsis.includes(query))) })).filter((g) => g.items.length > 0), [activeFilter, query]);
  const top5 = useMemo(() => TOP5_TITLES.map((t) => { for (const g of groups) { const f = g.items.find((x) => x.title === t); if (f) return { ...f, date: g.date }; } return null; }).filter(Boolean) as SelectedDetail[], []);

  const buildCanvas = async (list: SelectedDetail[]) => {
    const logoImg = await loadImage(logoUrl).catch(() => null);
    const watermarkImg = await loadImage(watermarkUrl).catch(() => null);
    const W = 1080, H = 1920; const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H; const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "#020a1e"); grad.addColorStop(0.35, "#0a2a5e"); grad.addColorStop(0.7, "#2f6cb5"); grad.addColorStop(1, "#cfeeff"); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 220; i++) { const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 2.8 + 0.4; ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.1})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    if (logoImg) {
      const cx = W / 2, cy = 132, rad = 64; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip(); const ratio = logoImg.width / logoImg.height; let dw = rad * 2.2, dh = dw / ratio; if (dh < rad * 2) { dh = rad * 2.2; dw = dh * ratio; } ctx.drawImage(logoImg, cx - dw / 2, cy - dh / 2, dw, dh); ctx.restore(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, rad + 3, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "900 46px Cairo, sans-serif"; ctx.fillText("قائمة مشاهدة شتاء 2027 ❄️", W / 2, 258); ctx.fillStyle = "#bfe6ff"; ctx.font = "800 30px Cairo, sans-serif"; ctx.fillText("أوتاكو في القمة  •  WINTER 2027", W / 2, 300); ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.moveTo(W * 0.18, 328); ctx.lineTo(W * 0.82, 328); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = "700 22px Cairo, sans-serif"; ctx.fillText(`اخترت ${list.length} من ${total} عمل`, W / 2, 362);
    const count = list.length; let fontTitle = 30, fontMeta = 18, lineH = 84, cols = 1;
    if (count > 14) { cols = 2; if (count <= 20) { fontTitle = 23; fontMeta = 15; lineH = 66; } else if (count <= 26) { fontTitle = 19; fontMeta = 13; lineH = 56; } else { fontTitle = 18; fontMeta = 12; lineH = 52; } }
    else if (count <= 8) { fontTitle = 32; fontMeta = 20; lineH = 92; } else { fontTitle = 28; fontMeta = 18; lineH = 78; }
    const startY = 410;
    const rowCount = cols === 1 ? count : Math.ceil(count / 2);
    const maxContentHeight = 1240;
    if (rowCount > 1) lineH = Math.min(lineH, maxContentHeight / rowCount);
    list.forEach((anime, idx) => { const isSecond = cols === 2 && idx >= Math.ceil(count / 2); const colIdx = cols === 1 ? 0 : (isSecond ? 1 : 0); const rowIdx = cols === 1 ? idx : (isSecond ? idx - Math.ceil(count / 2) : idx); const x = colIdx === 0 ? 72 : 552; const y = startY + rowIdx * lineH; const dt = anime.title.length > (cols === 1 ? 52 : 32) ? anime.title.slice(0, cols === 1 ? 52 : 32) + "…" : anime.title; const gt = anime.genre.length > (cols === 1 ? 38 : 26) ? anime.genre.slice(0, cols === 1 ? 38 : 26) + "…" : anime.genre; ctx.textAlign = "left"; ctx.fillStyle = "#bfe6ff"; ctx.font = `800 ${fontMeta}px Cairo, sans-serif`; ctx.fillText(`${idx + 1}`, x, y - 6, 30); ctx.fillStyle = "#fff"; ctx.font = `800 ${fontTitle}px Cairo, sans-serif`; ctx.fillText(dt, x + 34, y, cols === 1 ? 860 : 420); ctx.fillStyle = "#dff2ff"; ctx.font = `600 ${fontMeta}px Cairo, sans-serif`; ctx.fillText(`${anime.date} • ${gt}`, x + 34, y + fontTitle * 0.7, cols === 1 ? 860 : 420); });
    if (watermarkImg) { ctx.save(); ctx.globalAlpha = 0.10; const size = 620, ratio = watermarkImg.width / watermarkImg.height; let dw = size, dh = size / ratio; if (dh > size) { dh = size; dw = size * ratio; } ctx.translate(W / 2, 980); ctx.rotate(-0.32); ctx.drawImage(watermarkImg, -dw / 2, -dh / 2, dw, dh); ctx.restore(); }
    ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.moveTo(80, 1710); ctx.lineTo(W - 80, 1710); ctx.stroke(); ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "800 26px Cairo, sans-serif"; ctx.fillText(`${total} عمل في شتاء 2027 • Winter 2027`, W / 2, 1752); ctx.fillStyle = "#bfe6ff"; ctx.font = "700 20px Cairo, sans-serif"; ctx.fillText("otaku fel qema  •  أوتاكو في القمة", W / 2, 1858); ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "600 14px Cairo, sans-serif"; ctx.fillText("أنشئت من موقع جدول شتاء 2027", W / 2, 1886);
    const dataUrl = canvas.toDataURL("image/png"); const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), "image/png", 0.92) as unknown as Blob); return { dataUrl, blob };
  };
  const handleCreateImage = async () => { if (!selected.size) { showToast("اختار عمل واحد على الأقل ⭐"); return; } setGenerating(true); try { const { dataUrl, blob } = await buildCanvas(selectedList); setGeneratedUrl(dataUrl); setGeneratedBlob(blob); setShowModal(true); } catch { showToast("حصلت مشكلة في إنشاء الصورة، جرّب تاني"); } finally { setGenerating(false); } };
  const handleDownload = () => { if (!generatedUrl) return; const a = document.createElement("a"); a.href = generatedUrl; a.download = `my-winter-2027-list-${selected.size}.png`; document.body.appendChild(a); a.click(); a.remove(); showToast("تم التحميل ⬇️"); };
  const handleShareImage = async () => { if (!generatedBlob) { handleDownload(); return; } const file = new File([generatedBlob], `winter2027-${selected.size}.png`, { type: "image/png" }); // @ts-ignore
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { // @ts-ignore
        await navigator.share({ files: [file], title: "قائمة مشاهدة شتاء 2027 - أوتاكو في القمة", text: `اخترت ${selected.size} من ${total} عمل في شتاء 2027` }); showToast("تمت المشاركة ✨"); return; } catch { } } handleDownload(); };

  const saveLabel = saveState === "saving" ? "جارٍ الحفظ…" : saveState === "saved" ? "تم حفظ اختياراتك ✓" : saveState === "offline" ? "الحفظ غير متاح حالياً" : saveState === "error" ? "تعذّر الحفظ — حاول مجدداً" : saveState === "loading" ? "جارٍ تحميل اختياراتك…" : "اختياراتك تُحفظ هنا";

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }} className="min-h-screen w-full overflow-x-clip bg-[#020a1e] text-white" dir="rtl">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-[-30%] opacity-[0.10]" style={{ backgroundImage: `url(${watermarkUrl})`, backgroundRepeat: "repeat", backgroundSize: "440px auto", backgroundPosition: "center", transform: "rotate(-18deg)" }} />
      </div>
      {SNOW.map((s, i) => <span key={i} className="snowflake" style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, fontSize: `${s.size}px` }}>{s.char}</span>)}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-3 pb-10 sm:px-6 lg:px-8">
        {/* TOP BAR — small logo */}
        <div className="sticky top-[var(--safe-area-inset-top)] z-30 mt-2 flex items-center justify-between gap-2 rounded-2xl glass px-2 py-2" data-safe-area-sticky-top>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="شعار أوتاكو في القمة" className="h-[52px] w-[120px] shrink-0 rounded-xl border border-white/50 object-cover sm:h-[60px] sm:w-[160px]" />
            <div className="leading-tight"><p className="text-[13px] font-black">أوتاكو في القمة</p><p dir="ltr" className="font-en text-[10px] font-bold tracking-widest text-[#bfe6ff]">WINTER 2027</p></div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-[#071a3a]"><Snowflake className="h-3.5 w-3.5" /> ❄️ شتاء</span>
        </div>

        <header className="mt-5 text-center md:mx-auto md:max-w-3xl lg:mt-8">
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-[11px] font-extrabold text-[#dff2ff] sm:text-xs"><Sparkles className="h-3.5 w-3.5" /> قائمة من الملف فقط • اختار بالنجمة ⭐</span>
          <h1 className="mt-4 text-[clamp(2.1rem,9vw,4.5rem)] font-black leading-[1.05] drop-shadow-[0_4px_20px_rgba(124,196,255,.5)] sm:mt-6">جدول أنمي<br />شتاء 2027 ❄️</h1>
          <p dir="ltr" className="font-en mt-2 text-base font-bold tracking-[0.18em] text-[#bfe6ff] sm:text-lg">WINTER 2027 - {total} عمل</p>
          <p className="mx-auto mt-3 max-w-[620px] text-[14px] font-bold leading-7 text-[#d9ecff] sm:text-[15px] sm:leading-8">كل الأنميات بالترتيب، من ديسمبر 2026 لحد 17 يناير 2027 — اتبع رحلة الثلج، واختار أعمالك بالنجمة ⭐</p>
          <div className="ice-rule mx-auto mt-4 max-w-[300px] sm:max-w-[420px]" />
        </header>

        {/* TOP 5 SWIPE */}
        <section aria-label="أفضل 5 أعمال" className="mt-6">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black"><span className="text-2xl">🏆</span> Top 5 سوايب</h2><span className="text-[11px] font-bold text-[#bfe6ff]">اسحب يمين وشمال ←</span></div>
          <div className="no-scrollbar -mx-1 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:gap-4">
            {top5.map((a, i) => { const isSel = selected.has(a.title); return (
              <article key={a.title} className="anime-card mx-1 w-[230px] shrink-0 snap-center rounded-3xl p-4 sm:w-[280px] lg:w-[300px]">
                <div className="flex items-center justify-between"><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#071a3a]">#{i + 1} • TOP</span><button onClick={() => toggle(a.title)} aria-label={isSel ? "إزالة" : "إضافة"} className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${isSel ? "bg-white text-[#071a3a]" : "border border-white/50 text-white"}`}>{isSel ? "★" : "☆"}</button></div>
                <p className="mt-3 text-[11px] font-bold text-[#bfe6ff]">{a.date} • {a.genre}</p>
                <h3 dir="ltr" className="mt-1 text-left text-[19px] font-bold leading-snug [overflow-wrap:anywhere]">{a.title}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-6 text-[#e6f5ff] [overflow-wrap:anywhere]">{a.synopsis.length > 110 ? a.synopsis.slice(0, 110) + "…" : a.synopsis}</p>
              </article>); })}
          </div>
        </section>

        {/* SEARCH + FILTERS */}
        <section className="mt-5 rounded-3xl glass p-3" aria-label="بحث وفلاتر">
          <label className="relative block"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bfe6ff]" /><span className="sr-only">ابحث في القائمة</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="دوّر على اسم أنمي أو تصنيف…" className="w-full rounded-2xl border border-white/30 bg-[#071a3a]/70 py-3.5 pl-4 pr-10 text-[15px] font-bold text-white placeholder:text-[#9fc8ee] outline-none focus:border-white" /></label>
          <div className="mt-3 flex flex-wrap gap-2">{FILTERS.map((f) => <button key={f} onClick={() => setActiveFilter(f)} className={`rounded-full px-3.5 py-2 text-[13px] font-extrabold ${activeFilter === f ? "bg-white text-[#071a3a] shadow-lg" : "border border-white/35 bg-white/10 text-white hover:bg-white/20"}`}>{f}</button>)}</div>
          <div className="mt-3 flex items-center justify-between gap-2"><button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-black text-[#071a3a]">{expanded ? "طيّ القائمة" : "عرض القائمة"} <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} /></button><span className="rounded-xl border border-white/30 px-3 py-2.5 text-xs font-extrabold text-[#dff2ff]">{filtered.reduce((n, g) => n + g.items.length, 0)} / {total} عمل</span></div>
          {selected.size > 0 && <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 border border-white/30 px-3 py-2.5 text-xs font-bold"><Star className="h-4 w-4 fill-white" /> اخترت {selected.size} عمل — انزل تحت لإنشاء صورة قائمتك <button onClick={clearAll} className="mr-auto flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1"><Trash2 className="h-3.5 w-3.5" /> مسح</button></div>}
          <p className="mt-2 text-[11px] font-bold text-[#b9d6ef]">{saveLabel}</p>
        </section>

        {/* SNOW JOURNEY TIMELINE */}
        {expanded && (
          <div className="relative mt-7 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            <div className="absolute bottom-6 right-[18px] top-2 w-[3px] rounded-full bg-gradient-to-b from-white via-[#bfe6ff] to-[#7cc4ff] md:hidden" />
            <div className="contents md:contents">
              {filtered.length === 0 && <div className="rounded-3xl border border-dashed border-white/40 p-8 text-center md:col-span-2 lg:col-span-3 xl:col-span-4"><p className="text-lg font-black">مفيش نتيجة مطابقة ❄️</p><p className="mt-2 text-sm text-[#d9ecff]">جرّب كلمة تانية أو اختار «الكل».</p><button onClick={() => { setQuery(""); setActiveFilter("الكل"); }} className="mt-4 min-h-11 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071a3a]">إعادة ضبط القائمة</button></div>}
              {filtered.map((group) => (
                <section key={group.date} aria-label={group.date} className="relative mb-7 pr-12 pl-1 md:mb-0 md:px-1">
                  <span className="absolute right-[5px] top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-[0_0_18px_rgba(255,255,255,.9)] md:hidden">❄️</span>
                  <div className="date-strip overflow-hidden rounded-2xl px-4 py-3.5 shadow-[0_14px_35px_rgba(0,0,0,.25)]">
                    <div className="flex items-center justify-between gap-2"><div><p className="flex items-center gap-1.5 text-[11px] font-black tracking-widest"><CalendarDays className="h-4 w-4" /> موعد العرض • RELEASE</p><h2 className="mt-0.5 text-[clamp(1.5rem,6vw,2rem)] font-black leading-none">{group.date}</h2></div><div className="text-left shrink-0"><div className="font-en text-2xl font-bold leading-none">{String(group.items.length).padStart(2, "0")}</div><div className="mt-1 text-[10px] font-black">عمل • TITLES</div></div></div>
                  </div>
                  <div className="mt-3 space-y-4">
                    {group.items.map((anime) => { const isSel = selected.has(anime.title); const open = openSynopsis.has(anime.title); return (
                      <article key={anime.title} className={`anime-card relative mx-1 rounded-3xl p-4 ${isSel ? "ring-2 ring-white shadow-[0_0_28px_rgba(255,255,255,.35)]" : ""}`}>
                        <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-[#071a3a]">{group.date}</span><button onClick={() => toggle(anime.title)} aria-label={isSel ? "إزالة من القائمة" : "إضافة للقائمة"} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[18px] ${isSel ? "bg-white text-[#071a3a]" : "border-white/50 text-white"}`}>{isSel ? "★" : "☆"}</button></div>
                        <h3 dir="ltr" className="mt-3 text-left text-[clamp(1.3rem,5vw,1.7rem)] font-bold leading-[1.1] [overflow-wrap:anywhere]">{anime.title}</h3>
                        <p className="mt-2 text-center text-[14px] font-extrabold leading-6 text-[#eaf7ff] [overflow-wrap:anywhere]">{anime.genre}</p>
                        <div className="mt-3 flex items-center gap-2"><span className="h-px flex-1 bg-white/30" /><span className="text-[10px] font-black tracking-widest text-[#bfe6ff]">النبذة • SYNOPSIS</span><span className="h-px flex-1 bg-white/30" /></div>
                        {open ? <p className="mt-2 rounded-xl bg-[#071a3a]/45 px-3 py-3 text-[14px] font-semibold leading-7 text-[#eaf7ff] [overflow-wrap:anywhere]">{anime.synopsis}</p> : <p className="mt-2 text-center text-[12px] font-bold text-[#bfe6ff]">النبذة مخفية ❄️</p>}
                        <div className="mt-3 flex items-center justify-between gap-2">{anime.tag && <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#071a3a]">فيلم • MOVIE</span>}<button onClick={() => toggleSynopsis(anime.title)} className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3.5 py-2 text-xs font-black"><Eye className="h-3.5 w-3.5" /> {open ? "إخفاء النبذة" : "اقرأ النبذة"}</button><button onClick={() => toggle(anime.title)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-black ${isSel ? "bg-white text-[#071a3a]" : "bg-[#dff2ff] text-[#071a3a]"}`}>{isSel ? <><Check className="h-3.5 w-3.5" /> تم الاختيار</> : <><Star className="h-3.5 w-3.5" /> اختر للقائمة</>}</button></div>
                      </article>); })}
                  </div>
                </section>))}
            </div>
          </div>
        )}

        <footer className="mt-8 overflow-hidden rounded-[24px] border border-white/40 bg-gradient-to-b from-[#123264] to-[#071a3a] px-4 py-7 text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#071a3a]">❄️ جاهز لموسم الشتاء؟</div>
          <h2 className="mt-4 text-[clamp(1.7rem,7vw,2.4rem)] font-black leading-[1.1]">أنهي أنمي مستنيه؟<br /><span className="text-[#bfe6ff]">اكتب في الكومنتات 👇</span></h2>
          <p className="mx-auto mt-3 max-w-[400px] text-sm font-bold leading-7 text-[#d9ecff]">قولّنا أول عمل هتبدأ بيه، واعمل منشن لصاحبك الأوتاكو اللي لازم يشوف القائمة دي.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">{["#شتاء_2027", "#أنمي", "#أوتاكو_في_القمة", "#WinterAnime"].map((t) => <span key={t} dir="ltr" className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[#dff2ff]">{t}</span>)}</div>
          <div className="ice-rule mx-auto mt-5 max-w-[280px]" /><p className="mt-3 text-[11px] font-bold text-[#b9d6ef]">القائمة من الملف فقط • بدون إضافة أعمال أو معلومات خارج القائمة</p>
        </footer>
        <p className="mt-4 text-center text-[11px] leading-5 text-[#9fc8ee]">تصميم شتوي بمقاس مناسب للمشاركة • يُعرض بجودة عالية على الشاشات الكبيرة والهواتف</p>
        {selected.size > 0 && <div className="h-[110px]" />}
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/30 bg-[#071a3a]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#071a3a]"><Star className="h-5 w-5 fill-[#071a3a]" /></div><div className="min-w-0"><p className="text-sm font-black [overflow-wrap:anywhere]">اخترت {selected.size} من {total} — ⭐ قائمتي</p><p className="text-[11px] font-bold text-[#bfe6ff]">اضغط «شير قايمتي» لعمل صورة 1080×1920</p></div></div>
            <div className="flex gap-2 sm:w-auto"><button onClick={handleCreateImage} disabled={generating} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#071a3a] disabled:opacity-60 sm:min-w-[190px]">{generating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071a3a] border-t-transparent" /> : <Share2 className="h-4 w-4" />}{generating ? "بنجهز الصورة..." : "شير قايمتي 📤"}</button><button onClick={clearAll} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-black"><Trash2 className="h-4 w-4" /> امسح الكل</button></div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#020a1e]/85 backdrop-blur-md pt-[max(1rem,var(--safe-area-inset-top))] pb-6">
          <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6"><div className="w-full max-w-[680px] overflow-hidden rounded-[24px] border border-white/30 bg-[#0a1d3d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#071a3a]">❄️</div><div><p className="text-sm font-black">صورة قائمتك جاهزة 📸</p><p className="text-[11px] font-bold text-[#bfe6ff]">1080×1920 • ستوري • شتوية</p></div></div><button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><X className="h-4 w-4" /></button></div>
            <div className="p-3 sm:p-4">{generatedUrl ? <div className="overflow-hidden rounded-[18px] border border-white/30 bg-black"><img src={generatedUrl} alt={`قائمة مشاهدة شتاء 2027 - ${selected.size} عمل`} className="mx-auto block h-auto max-h-[calc(100dvh-var(--safe-area-inset-top)-14rem)] w-full object-contain" /></div> : <div className="rounded-xl bg-white/10 p-8 text-center"><p className="text-sm font-bold text-[#dff2ff]">جاري تجهيز الصورة...</p></div>}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button onClick={handleDownload} className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a3a]"><Download className="h-4 w-4" /> تحميل PNG ⬇️</button><button onClick={handleShareImage} className="flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-[#dff2ff] px-5 py-3.5 text-sm font-black text-[#071a3a]"><Share2 className="h-4 w-4" /> مشاركة الصورة</button></div>
              <div className="mt-4 rounded-xl bg-black/30 border border-white/15 p-3"><p className="mb-2 text-xs font-black text-[#bfe6ff]">قائمتك كنص:</p><p className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-[11px] leading-5 font-bold text-[#eaf7ff] [overflow-wrap:anywhere]">{selectedList.map((a, i) => `${i + 1}. ${a.title} • ${a.date} • ${a.genre}`).join("\n")}</p></div>
              <p className="mt-3 text-center text-[11px] font-bold leading-5 text-[#9fc8ee]">اللوجو في الأعلى، وعلامة مائية شفافة للوجو في الأسفل — صورة PNG شتوية جاهزة للنشر كستوري.</p>
            </div>
          </div></div>
        </div>
      )}
      {toast && <div className="fixed bottom-[130px] left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-4 py-2.5 text-sm font-black text-[#071a3a] shadow-2xl">{toast}</div>}
    </div>
  );
}
