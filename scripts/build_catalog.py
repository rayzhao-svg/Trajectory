#!/usr/bin/env python3
"""Build data/catalog/courses.json from the Yale College Programs of Study 2026–2027.

Source pages: https://catalog.yale.edu/ycps/courses/<subject>/
The script downloads those pages, parses CourseLeaf course blocks, and writes a
normalized catalog. It does not invent titles, numbers, or designations.
"""

from __future__ import annotations

import json
import re
import subprocess
import html as html_lib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "catalog" / "courses.json"
META = ROOT / "data" / "catalog" / "meta.json"

SUBJECTS = [
    "econ", "cpsc", "math", "chem", "biol", "phys", "mcdb", "mb_b", "phil",
    "plsc", "glbl", "ep_e", "amth", "s_ds", "psyc", "socy", "enas", "engl",
    "span", "hist", "hsar", "hums",
]

DESIGNATIONS = {"HU", "SC", "SO", "QR", "WR", "L1", "L2", "L3", "L4", "L5"}
CODE_RE = re.compile(
    r"^([A-Z][A-Z&]*?)\s+(\d+)([A-Z]*?)(a or b|b or a|a and b|b and a|a|b)?$"
)


def download(slug: str) -> str:
    RAW.mkdir(parents=True, exist_ok=True)
    dest = RAW / f"{slug}.html"
    url = f"https://catalog.yale.edu/ycps/courses/{slug}/"
    if not dest.exists() or dest.stat().st_size < 1000:
        subprocess.check_call(["curl", "-fsSL", url, "-o", str(dest)])
    return dest.read_text(encoding="utf-8")


def clean(fragment: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_lib.unescape(text).replace("\xa0", " ").replace("\u2002", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*", "\n", text)
    return text.strip()


def parse_code_token(token: str) -> dict | None:
    token = re.sub(r"\s+", " ", token).strip(" []")
    match = CODE_RE.match(token)
    if not match:
        return None
    subject, number, suffix, term = match.groups()
    term = term or ""
    if term in {"a or b", "b or a"}:
        terms = ["fall", "spring"]
    elif term in {"a", "a and b"}:
        terms = ["fall"]
    elif term in {"b", "b and a"}:
        terms = ["spring"]
    else:
        terms = []
    return {
        "code": f"{subject} {number}{suffix}",
        "subject": subject,
        "number": int(number),
        "suffix": suffix,
        "terms": terms,
    }


def parse_header(header: str) -> list[dict]:
    starred = header.startswith("*")
    header = header[1:].strip() if starred else header
    bracketed = header.startswith("[")
    header = header.strip("[] ")
    if "," not in header:
        return []
    left, title = header.split(",", 1)
    title = title.strip()
    pieces = []
    if re.search(r"\band\b", left) and left.count(" and ") == 1:
        a, b = left.split(" and ")
        parsed = [parse_code_token(a), parse_code_token(b)]
        if all(parsed):
            pieces = [{"primary": parsed[0], "cross": []} , {"primary": parsed[1], "cross": []}]
    if not pieces:
        parts = [parse_code_token(part) for part in left.split("/")]
        parts = [part for part in parts if part]
        if not parts:
            return []
        pieces = [{"primary": parts[0], "cross": parts[1:]}]
    records = []
    for piece in pieces:
        primary = piece["primary"]
        records.append({
            "code": primary["code"],
            "subject": primary["subject"],
            "number": primary["number"],
            "title": title,
            "terms": primary["terms"],
            "limitedEnrollmentMarker": starred,
            "bracketedNotOfferedThisCatalogYear": bracketed,
            "crossListedAs": [item["code"] for item in piece["cross"]],
        })
    return records


def parse_credit(raw: str | None, description: str) -> tuple[float, str, str | None]:
    if raw:
        raw = raw.replace("1½", "1 1/2").replace("½", "1/2").replace("¼", "1/4").replace("¾", "3/4")
        raw_compact = raw.lower()
        if raw_compact.startswith("1 1/2"):
            return 1.5, "printed", raw
        if raw_compact.startswith("1/2"):
            return 0.5, "printed", raw
        if raw_compact.startswith("2"):
            return 2.0, "printed", raw
        if raw_compact.startswith("1 course"):
            return 1.0, "printed", raw
        if raw_compact.startswith("0 course"):
            if "half of the term" in description.lower() or "first half of the term" in description.lower():
                return 0.5, "half-term-module", raw
            return 1.0, "printed-zero-defaulted-to-one", raw
    if "half of the term" in description.lower():
        return 0.5, "half-term-module", raw
    return 1.0, "omitted-defaulted-to-one", raw


def parse_blocks(page: str, slug: str) -> list[dict]:
    blocks = re.findall(r'<div class="courseblock">(.*?)</div>', page, re.S)
    courses = []
    source = f"https://catalog.yale.edu/ycps/courses/{slug}/"
    for block in blocks:
        title_match = re.search(r"<strong>(.*?)</strong>", block, re.S)
        if not title_match:
            continue
        header = clean(title_match.group(1)).replace("\n", " ")
        desc_match = re.search(r'class="courseblockdesc">(.*)', block, re.S)
        description = clean(desc_match.group(1)) if desc_match else ""
        instructor_match = re.search(r'class="instructor">(.*?)</span>', block, re.S)
        instructor = clean(instructor_match.group(1)) if instructor_match else ""
        designations = [
            item for item in re.findall(r'YaleDesign Small Caps">([A-Z0-9]+)', block)
            if item in DESIGNATIONS
        ]
        credit_match = re.search(r'class="keeptogether">([^<]+)', block)
        printed = clean(credit_match.group(1)) if credit_match else None
        credits, credit_status, printed_credit = parse_credit(printed, description)
        prereq_language = bool(re.search(r"\b(Prerequisite|Prerequisites|After)\b", description))
        for record in parse_header(header):
            record.update({
                "description": description,
                "instructor": instructor,
                "designations": designations,
                "credits": credits,
                "creditStatus": credit_status,
                "printedCredit": printed_credit,
                "hasPrerequisiteLanguage": prereq_language,
                "sourceUrl": source,
                "catalogYear": "2026-2027",
                "rawHeader": header,
            })
            courses.append(record)
    return courses


def main() -> None:
    by_code: dict[str, dict] = {}
    alias: dict[str, str] = {}
    skipped = 0
    for slug in SUBJECTS:
        page = download(slug)
        for course in parse_blocks(page, slug):
            code = course["code"]
            if code in by_code:
                existing = by_code[code]
                for key in ("designations", "terms"):
                    existing[key] = sorted(set(existing[key]) | set(course[key]))
                if len(course["description"]) > len(existing["description"]):
                    existing["description"] = course["description"]
                    existing["sourceUrl"] = course["sourceUrl"]
                continue
            by_code[code] = course
            for cross in course["crossListedAs"]:
                alias.setdefault(cross, code)
    # Break two-cycles created when each cross-listed subject page is parsed as its own primary.
    for left, right in list(alias.items()):
        if alias.get(right) == left and left != right:
            keep, drop = sorted((left, right))
            alias[drop] = keep
            alias.pop(keep, None)
            by_code.pop(drop, None)
    courses = sorted(by_code.values(), key=lambda item: (item["subject"], item["number"], item["code"]))
    for course in courses:
        course["aliases"] = sorted({alias_code for alias_code, primary in alias.items() if primary == course["code"]})
    payload = {
        "catalogYear": "2026-2027",
        "retrievedAt": datetime.now(timezone.utc).isoformat(),
        "source": "https://catalog.yale.edu/ycps/courses/",
        "courses": courses,
        "aliases": alias,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    credit_counts: dict[str, int] = {}
    for course in courses:
        credit_counts[course["creditStatus"]] = credit_counts.get(course["creditStatus"], 0) + 1
    meta = {
        "catalogYear": "2026-2027",
        "courseCount": len(courses),
        "aliasCount": len(alias),
        "creditStatus": credit_counts,
        "subjects": sorted({course["subject"] for course in courses}),
        "creditPolicy": (
            "Explicit printed credits (1/2, 1 1/2, 2) are kept. "
            "Yale states that most courses carry one credit and that variations are noted. "
            "When a 2026–2027 course page prints '0 Course cr' or omits the credit, Trajectory stores 1.0 "
            "and marks creditStatus. BIOL modules whose descriptions say they meet for half a term are stored as 0.5."
        ),
        "listingKey": {
            "asterisk": "YCPS key: a star marks a limited-enrollment seminar. The 2026–2027 pages also star some standard lectures; the marker is preserved, not treated as cancellation.",
            "brackets": "YCPS key: a bracketed course is not offered in the current catalog year but is expected the succeeding year.",
            "a or b": "Fall and spring listings of the same course.",
        },
    }
    META.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps({"courses": len(courses), "aliases": len(alias), "credits": credit_counts, "skipped": skipped}, indent=2))


if __name__ == "__main__":
    main()
