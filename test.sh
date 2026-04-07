#!/usr/bin/env bash
set -euo pipefail

API="https://hololive.wiki/w/api.php"
PAGE="Membership_Emotes"

# 1) Find the section index
SECTION_INDEX="$(
  curl -sG "$API" \
    --data-urlencode "action=parse" \
    --data-urlencode "page=$PAGE" \
    --data-urlencode "prop=sections" \
    --data-urlencode "format=json" |
  jq -r '.parse.sections[] | select(.line == "Emotes by branches") | .index'
)"

if [[ -z "${SECTION_INDEX:-}" ]]; then
  echo "Could not find section: Emotes by branches" >&2
  exit 1
fi

echo "Found section index: $SECTION_INDEX" >&2

# 2) Fetch section HTML
HTML="$(
  curl -sG "$API" \
    --data-urlencode "action=parse" \
    --data-urlencode "page=$PAGE" \
    --data-urlencode "section=$SECTION_INDEX" \
    --data-urlencode "prop=text" \
    --data-urlencode "format=json" |
  jq -r '.parse.text["*"]'
)"

# 3) Extract branch names (portable)
printf '%s\n' "$HTML" |
  sed -n 's/.*<li><a[^>]*>\([^<]*\)<\/a>.*/\1/p'
