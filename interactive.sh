#!/usr/bin/env bash
set -euo pipefail

API="https://hololive.wiki/w/api.php"
ROOT_PAGE="Membership_Emotes"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd curl
need_cmd jq
need_cmd python3

api_get() {
  curl -sG "$API" "$@"
}

get_branches_html() {
  local section_index
  section_index="$(
    api_get \
      --data-urlencode "action=parse" \
      --data-urlencode "page=$ROOT_PAGE" \
      --data-urlencode "prop=sections" \
      --data-urlencode "format=json" |
    jq -r '.parse.sections[] | select(.line == "Emotes by branches") | .index'
  )"

  if [[ -z "${section_index:-}" ]]; then
    echo "Could not find section: Emotes by branches" >&2
    exit 1
  fi

  api_get \
    --data-urlencode "action=parse" \
    --data-urlencode "page=$ROOT_PAGE" \
    --data-urlencode "section=$section_index" \
    --data-urlencode "prop=text" \
    --data-urlencode "format=json" |
  jq -r '.parse.text["*"]'
}

extract_branches_json() {
  python3 - <<'PY'
import json
import sys
from html.parser import HTMLParser
from html import unescape

html = sys.stdin.read()

class BranchParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_li = False
        self.in_a = False
        self.current = None
        self.text_parts = []
        self.items = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "li":
            self.in_li = True
        elif tag == "a" and self.in_li:
            self.in_a = True
            self.current = {
                "title": attrs.get("title", "").strip(),
                "href": attrs.get("href", "").strip()
            }
            self.text_parts = []

    def handle_data(self, data):
        if self.in_li and self.in_a:
            self.text_parts.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.in_a:
            self.in_a = False
            if self.current:
                text = unescape("".join(self.text_parts)).strip()
                title = self.current.get("title", "")
                href = self.current.get("href", "")
                if text and title and not href.startswith("#"):
                    self.items.append({
                        "name": text,
                        "title": title,
                        "href": href
                    })
                self.current = None
                self.text_parts = []
        elif tag == "li":
            self.in_li = False

parser = BranchParser()
parser.feed(html)

seen = set()
out = []
for item in parser.items:
    key = item["title"]
    if key not in seen:
        seen.add(key)
        out.append(item)

print(json.dumps(out, ensure_ascii=False))
PY
}

prompt_branch_selection() {
  local branches_json="$1"
  python3 - "$branches_json" <<'PY'
import json
import sys

branches = json.loads(sys.argv[1])

print("Available branches:")
print("  0) All branches")
for i, b in enumerate(branches, start=1):
    print(f"  {i}) {b['name']}")
PY

  local choice
  printf "Select a branch number (0 for all): " >&2
  read -r choice

  if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo "Invalid selection: $choice" >&2
    exit 1
  fi

  python3 - "$branches_json" "$choice" <<'PY'
import json
import sys

branches = json.loads(sys.argv[1])
choice = int(sys.argv[2])

if choice == 0:
    print(json.dumps(branches, ensure_ascii=False))
elif 1 <= choice <= len(branches):
    print(json.dumps([branches[choice - 1]], ensure_ascii=False))
else:
    print(f"Invalid selection: {choice}", file=sys.stderr)
    sys.exit(1)
PY
}

get_sections_json() {
  local page_title="$1"
  api_get \
    --data-urlencode "action=parse" \
    --data-urlencode "page=$page_title" \
    --data-urlencode "prop=sections" \
    --data-urlencode "format=json"
}

get_section_html() {
  local page_title="$1"
  local section_index="$2"
  api_get \
    --data-urlencode "action=parse" \
    --data-urlencode "page=$page_title" \
    --data-urlencode "section=$section_index" \
    --data-urlencode "prop=text" \
    --data-urlencode "format=json" |
  jq -r '.parse.text["*"]'
}

extract_emotes_json() {
  python3 - <<'PY'
import json
import re
import sys
from html import unescape
from urllib.parse import urljoin

html = sys.stdin.read()
base = "https://hololive.wiki"

# Collect image candidates. MediaWiki/Fandom markup varies a bit, so use a few fallbacks.
img_blocks = re.findall(r'(<img\b[^>]*>)', html, flags=re.I)
items = []
seen = set()

for block in img_blocks:
    src_match = re.search(r'\bsrc="([^"]+)"', block, flags=re.I)
    if not src_match:
        continue

    src = unescape(src_match.group(1).strip())
    url = urljoin(base, src)

    # Prefer human-readable fields when present.
    name = None
    for attr in ("data-image-name", "alt", "title"):
        m = re.search(r'\b' + re.escape(attr) + r'="([^"]*)"', block, flags=re.I)
        if m:
            value = unescape(m.group(1).strip())
            if value:
                name = value
                break

    if not name:
        continue

    # Skip obvious UI / lazyload / placeholder junk
    lower_name = name.lower()
    lower_url = url.lower()
    if any(x in lower_url for x in (
        "/static/", "spinner", "placeholder", "blank.gif", "pixel"
    )):
        continue
    if any(x in lower_name for x in (
        "loading", "placeholder", "sprite"
    )):
        continue

    # Normalize filenames if that's all we got
    name = re.sub(r'\.[A-Za-z0-9]{2,5}$', '', name)
    name = name.replace('_', ' ').strip()

    key = (name, url)
    if key in seen:
        continue
    seen.add(key)
    items.append({
        "name": name,
        "url": url
    })

print(json.dumps(items, ensure_ascii=False))
PY
}

build_branch_json() {
  local page_title="$1"

  local sections_json
  sections_json="$(get_sections_json "$page_title")"

  if [[ "$(printf '%s' "$sections_json" | jq -r '.parse.title // empty')" == "" ]]; then
    echo "Could not load page: $page_title" >&2
    exit 1
  fi

  local plan_json
  plan_json="$(
    printf '%s' "$sections_json" |
    python3 - <<'PY'
import json
import sys

data = json.load(sys.stdin)
sections = data.get("parse", {}).get("sections", [])

result = []
current_generation = None

for s in sections:
    line = s.get("line", "").strip()
    index = s.get("index", "").strip()
    try:
        level = int(s.get("level", "0"))
    except ValueError:
        continue

    if not line or not index:
        continue

    if line == "Beginning":
        continue

    # On these pages, generations are usually level 2 and talents are level 3.
    if level <= 2:
        current_generation = {
            "generation": line,
            "talents": []
        }
        result.append(current_generation)
    elif level == 3:
        if current_generation is None:
            current_generation = {
                "generation": "Ungrouped",
                "talents": []
            }
            result.append(current_generation)
        current_generation["talents"].append({
            "name": line,
            "section_index": index
        })

print(json.dumps(result, ensure_ascii=False))
PY
  )"

  BRANCH_PAGE_TITLE="$page_title" PLAN_JSON="$plan_json" python3 - <<'PY'
import json
import os
import subprocess
import sys

page_title = os.environ["BRANCH_PAGE_TITLE"]
plan = json.loads(os.environ["PLAN_JSON"])

def get_emotes_for_section(title: str, section_index: str):
    env = os.environ.copy()
    # Call back into the shell function through the parent script is awkward,
    # so invoke curl+jq inline here for section HTML and parse it below.
    cmd = [
        "bash", "-lc",
        r'''
set -euo pipefail
curl -sG "https://hololive.wiki/w/api.php" \
  --data-urlencode "action=parse" \
  --data-urlencode "page='"$0"'" \
  --data-urlencode "section='"$1"'" \
  --data-urlencode "prop=text" \
  --data-urlencode "format=json" |
jq -r '.parse.text["*"]' |
python3 - <<'PY2'
import json
import re
import sys
from html import unescape
from urllib.parse import urljoin

html = sys.stdin.read()
base = "https://hololive.wiki"

img_blocks = re.findall(r'(<img\b[^>]*>)', html, flags=re.I)
items = []
seen = set()

for block in img_blocks:
    src_match = re.search(r'\bsrc="([^"]+)"', block, flags=re.I)
    if not src_match:
        continue

    src = unescape(src_match.group(1).strip())
    url = urljoin(base, src)

    name = None
    for attr in ("data-image-name", "alt", "title"):
        m = re.search(r'\b' + re.escape(attr) + r'="([^"]*)"', block, flags=re.I)
        if m:
            value = unescape(m.group(1).strip())
            if value:
                name = value
                break

    if not name:
        continue

    lower_name = name.lower()
    lower_url = url.lower()
    if any(x in lower_url for x in ("/static/", "spinner", "placeholder", "blank.gif", "pixel")):
        continue
    if any(x in lower_name for x in ("loading", "placeholder", "sprite")):
        continue

    name = re.sub(r'\.[A-Za-z0-9]{2,5}$', '', name)
    name = name.replace('_', ' ').strip()

    key = (name, url)
    if key in seen:
        continue
    seen.add(key)
    items.append({"name": name, "url": url})

print(json.dumps(items, ensure_ascii=False))
PY2
''',
        title,
        section_index
    ]
    out = subprocess.check_output(cmd, text=True)
    return json.loads(out)

for generation in plan:
    for talent in generation["talents"]:
        talent["emotes"] = get_emotes_for_section(page_title, talent["section_index"])
        del talent["section_index"]

print(json.dumps(plan, ensure_ascii=False, indent=2))
PY
}

main() {
  local branches_html branches_json selected_json

  branches_html="$(get_branches_html)"
  branches_json="$(printf '%s' "$branches_html" | extract_branches_json)"

  if [[ "$(printf '%s' "$branches_json" | jq 'length')" -eq 0 ]]; then
    echo "No branches found." >&2
    exit 1
  fi

  selected_json="$(prompt_branch_selection "$branches_json")"

  python3 - "$selected_json" <<'PY'
import json
import sys
items = json.loads(sys.argv[1])
for item in items:
    print(item["title"])
PY |
  while IFS= read -r page_title; do
    build_branch_json "$page_title"
  done |
  jq -s 'if length == 1 then .[0] else . end'
}

main "$@"
