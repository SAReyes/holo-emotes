import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { dirname, join, relative } from "path";
import { select } from "@inquirer/prompts";
import { parse as parseHtml, type HTMLElement } from "node-html-parser";
import { assertAllowed } from "./robots";
import { localThumbPath, THUMBS_DIR } from "../src/emote-image";

// Reads the rendered article pages under /wiki/. hololive.wiki's robots.txt
// disallows /w/ (the API) and every ?action= URL, but not plain article pages.
// Every request is checked against the live robots.txt first (see robots.ts).
const BASE_URL = "https://hololive.wiki";
const ROOT_PAGE = `${BASE_URL}/wiki/Membership_Emotes`;

type EmoteMap      = Record<string, string>;       // emote name → url
type TalentMap     = Record<string, EmoteMap>;     // talent name → emotes
type GenerationMap = Record<string, TalentMap>;    // generation name → talents
type BranchMap     = Record<string, GenerationMap>; // branch name → generations

// ---------------------------------------------------------------------------
// Page fetching
// ---------------------------------------------------------------------------

/** Fetch an article and return its rendered body (the .mw-parser-output element). */
async function fetchArticle(url: string): Promise<HTMLElement> {
  await assertAllowed(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wiki error: ${res.status} ${res.statusText} (${url})`);
  const body = parseHtml(await res.text()).querySelector(".mw-parser-output");
  if (!body) throw new Error(`Could not find article body: ${url}`);
  return body;
}

/** Heading text without the "[edit]" link; entities are decoded by the parser. */
function headingText(h: HTMLElement): string {
  return (h.querySelector(".mw-headline") ?? h).text.trim();
}

// ---------------------------------------------------------------------------
// Branch discovery
// ---------------------------------------------------------------------------

interface Branch {
  name: string;
  url: string;
}

async function fetchBranches(): Promise<Branch[]> {
  const body = await fetchArticle(ROOT_PAGE);
  const seen = new Set<string>();
  const results: Branch[] = [];

  for (const a of body.querySelectorAll('a[href^="/wiki/Membership_Emotes/"]')) {
    const href = a.getAttribute("href") ?? "";
    const name = a.text.trim();
    if (name && !seen.has(href)) {
      seen.add(href);
      results.push({ name, url: BASE_URL + href });
    }
  }

  if (results.length === 0) throw new Error("Could not find any branch links on the root page");
  return results;
}

// ---------------------------------------------------------------------------
// Branch data (generations → talents → emotes)
// ---------------------------------------------------------------------------

/** Walk headings and images in document order: h2 → generation, h3 → talent, img → emote. */
async function buildBranchData(url: string): Promise<GenerationMap> {
  const body = await fetchArticle(url);
  const result: GenerationMap = {};
  let generation: string | null = null;
  let talent: string | null = null;

  for (const el of body.querySelectorAll("h2, h3, img")) {
    if (el.tagName === "H2") {
      generation = headingText(el);
      talent = null;
    } else if (el.tagName === "H3") {
      talent = headingText(el);
    } else if (talent) {
      const emote = parseEmote(el);
      if (!emote) continue;
      const gen = generation ?? "Ungrouped";
      const emotes = ((result[gen] ??= {})[talent] ??= {});
      if (!(emote.name in emotes)) emotes[emote.name] = emote.url;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Emote parsing
// ---------------------------------------------------------------------------

const SKIP_URL_FRAGMENTS = ["/static/", "spinner", "placeholder", "blank.gif", "pixel"];
const SKIP_NAME_FRAGMENTS = ["loading", "placeholder", "sprite"];

function parseEmote(img: HTMLElement): { name: string; url: string } | null {
  const src = img.getAttribute("src") ?? "";
  if (!src) return null;

  // Resolve protocol-relative (//...), absolute-path (/...), and full URLs
  let url: string;
  if (src.startsWith("//")) {
    url = "https:" + src;
  } else if (src.startsWith("http")) {
    url = src;
  } else {
    url = BASE_URL + src;
  }

  if (SKIP_URL_FRAGMENTS.some((x) => url.toLowerCase().includes(x))) return null;

  const rawName =
    img.getAttribute("data-image-name") ??
    img.getAttribute("alt") ??
    img.getAttribute("title") ??
    "";

  let name = rawName.trim();
  if (!name || SKIP_NAME_FRAGMENTS.some((x) => name.toLowerCase().includes(x))) return null;

  // Normalize: strip extension, replace underscores
  name = name.replace(/\.[A-Za-z0-9]{2,5}$/, "").replace(/_/g, " ").trim();

  return { name, url };
}

// ---------------------------------------------------------------------------
// Thumbnail download (delta only)
// ---------------------------------------------------------------------------

const DOWNLOAD_CONCURRENCY = 6;

/** Every image URL referenced by the branch data, mapped to its local file path. */
function thumbTargets(result: BranchMap, outputPath: string): Map<string, string> {
  const targets = new Map<string, string>();
  for (const generations of Object.values(result)) {
    for (const talents of Object.values(generations)) {
      for (const emotes of Object.values(talents)) {
        for (const url of Object.values(emotes)) {
          const local = localThumbPath(url);
          if (!local) throw new Error(`Cannot derive a local path for ${url}`);
          targets.set(url, join(outputPath, local.replace(/^\/emotes\//, "")));
        }
      }
    }
  }
  return targets;
}

async function download(url: string, file: string): Promise<void> {
  await assertAllowed(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image error: ${res.status} ${res.statusText} (${url})`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walkFiles(full) : [full];
  });
}

/** Download thumbnails that are missing locally and delete ones no branch references any more. */
async function syncThumbs(result: BranchMap, outputPath: string): Promise<void> {
  const targets = thumbTargets(result, outputPath);
  const missing = [...targets].filter(([, file]) => !existsSync(file));
  console.error(`Thumbnails: ${targets.size} referenced, ${missing.length} to download`);

  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < missing.length) {
      const [url, file] = missing[next++]!;
      await download(url, file);
      done++;
      if (done % 100 === 0 || done === missing.length) console.error(`  ${done}/${missing.length}`);
    }
  };
  await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker));

  const wanted = new Set(targets.values());
  const thumbsDir = join(outputPath, THUMBS_DIR.replace(/^emotes\//, ""));
  const orphans = walkFiles(thumbsDir).filter((f) => !wanted.has(f));
  for (const f of orphans) unlinkSync(f);
  if (orphans.length) {
    console.error(`  removed ${orphans.length} orphaned file(s):`);
    for (const f of orphans) console.error(`    ${relative(outputPath, f)}`);
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let outputPath: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-o" || args[i] === "--output") && args[i + 1]) {
      outputPath = args[++i]!;
    }
  }

  return { outputPath };
}

async function main() {
  const { outputPath } = parseArgs();

  console.error("Fetching branches…");
  const branches = await fetchBranches();

  if (branches.length === 0) {
    console.error("No branches found.");
    process.exit(1);
  }

  let selected: Branch[];

  if (outputPath) {
    selected = branches;
  } else {
    const choice = await select({
      message: "Select a branch:",
      choices: [
        { name: "All branches", value: "all" },
        ...branches.map((b, i) => ({ name: b.name, value: String(i) })),
      ],
    });

    selected = choice === "all" ? branches : [branches[parseInt(choice, 10)]!];
  }

  if (outputPath) {
    mkdirSync(outputPath, { recursive: true });
  }

  const result: BranchMap = {};

  for (const branch of selected) {
    console.error(`Fetching data for ${branch.name}…`);
    const data = await buildBranchData(branch.url);

    if (Object.keys(data).length === 0) {
      console.error(`  → skipped (no emotes)`);
      continue;
    }

    result[branch.name] = data;

    if (outputPath) {
      const fileName = branch.name.replace(/[/\\?%*:|"<>]/g, "-") + ".json";
      const filePath = `${outputPath}/${fileName}`;
      writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
      console.error(`  → ${filePath}`);
    }
  }

  if (outputPath) {
    await syncThumbs(result, outputPath);
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
