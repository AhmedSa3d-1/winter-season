#!/usr/bin/env python3
import json, re, sys, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "data" / "anime.xlsx"
OUT = ROOT / "src" / "data" / "anime.json"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def cell_val(cell):
    t = cell.attrib.get("t")
    v = cell.find("m:v", NS)
    if v is None:
        is_ = cell.find("m:is", NS)
        if is_ is None:
            return ""
        return "".join(x.text or "" for x in is_.findall(".//m:t", NS))
    return v.text or ""


def load_rows(path):
    with zipfile.ZipFile(path) as z:
        sheet = [n for n in z.namelist() if n.startswith("xl/worksheets/sheet")][0]
        root = ET.fromstring(z.read(sheet))
    rows = root.findall(".//m:sheetData/m:row", NS)
    parsed = []
    headers = []
    for i, row in enumerate(rows):
        cells = {}
        for c in row.findall("m:c", NS):
            ref = c.attrib.get("r", "")
            col = re.sub(r"\d", "", ref)
            cells[col] = cell_val(c).strip()
        if i == 0:
            cols = sorted(cells.keys(), key=lambda x: (len(x), x))
            headers = [(col, cells[col]) for col in cols]
        else:
            obj = {name: cells.get(col, "") for col, name in headers}
            if any(v for v in obj.values()):
                parsed.append(obj)
    return parsed


def short_label(date: str) -> str:
    m = re.search(r"(\d{1,2})", date)
    if m and any(ch.isdigit() for ch in date.split()[0]):
        return m.group(1).zfill(2)
    months = {
        "يناير": "JAN", "فبراير": "FEB", "مارس": "MAR", "أبريل": "APR", "مايو": "MAY", "يونيو": "JUN",
        "يوليو": "JUL", "أغسطس": "AUG", "سبتمبر": "SEP", "أكتوبر": "OCT", "نوفمبر": "NOV", "ديسمبر": "DEC",
    }
    for ar, en in months.items():
        if ar in date:
            return en[:3]
    return date[:3]


def main():
    if not XLSX.exists():
        print(f"Missing {XLSX}", file=sys.stderr)
        sys.exit(1)
    rows = load_rows(XLSX)
    groups = []
    by_date = {}
    for row in rows:
        title = row.get("اسم الأنمي", "").strip()
        date = (row.get("موعد الإصدار المتحقق") or row.get("موعد العرض") or "").strip() or "موعد غير محدد"
        if not title:
            continue
        genre = row.get("التصنيفات", "").strip().replace("،", "، ")
        genre = re.sub(r"\s*،\s*", "، ", genre)
        synopsis = row.get("النبذة", "").strip()
        release_type = row.get("نوع الإصدار", "")
        image = (row.get("رابط الصورة") or row.get("الصورة") or "").strip()
        tag = "فيلم" if "فيلم" in release_type else ""
        item = {"title": title, "genre": genre, "synopsis": synopsis}
        if tag:
            item["tag"] = tag
        if image:
            item["image"] = image
        g = by_date.get(date)
        if g is None:
            g = {"date": date, "short": short_label(date), "items": []}
            by_date[date] = g
            groups.append(g)
        g["items"].append(item)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"groups": groups}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({sum(len(g['items']) for g in groups)} items, {len(groups)} groups)")


if __name__ == "__main__":
    main()
