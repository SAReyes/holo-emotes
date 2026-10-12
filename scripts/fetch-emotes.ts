import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { dirname, join, relative } from "path";
import { select } from "@inquirer/prompts";
import { parse as parseHtml, type HTMLElement } from "node-html-parser";
import { assertAllowed } from "./robots";
import { localThumbPath, THUMBS_DIR } from "../src/emote-image";

const BASE_URL = "https://hololive.wiki";
const ROOT_PAGE = `${BASE_URL}/wiki/Membership_Emotes`;

type EmoteMap      = Record<string, string>;
type TalentMap     = Record<string, EmoteMap>;
type GenerationMap = Record<string, TalentMap>;
type BranchMap     = Record<string, GenerationMap>;
type TalentPages   = Record<string, string>;

interface TalentInfo {
  page: string;
  oshiMark: string;
  fanName: string;
}
type TalentInfoMap = Record<string, TalentInfo>;

async function fetchArticle(url: string): Promise<HTMLElement> {
  await assertAllowed(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wiki error: ${res.status} ${res.statusText} (${url})`);
  const body = parseHtml(await res.text()).querySelector(".mw-parser-output");
  if (!body) throw new Error(`Could not find article body: ${url}`);
  return body;
}

function headingText(h: HTMLElement): string {
  return (h.querySelector(".mw-headline") ?? h).text.trim();
}

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

async function buildBranchData(url: string): Promise<{ generations: GenerationMap; pages: TalentPages }> {
  const body = await fetchArticle(url);
  const result: GenerationMap = {};
  const pages: TalentPages = {};
  let generation: string | null = null;
  let talent: string | null = null;

  for (const el of body.querySelectorAll("h2, h3, img")) {
    if (el.tagName === "H2") {
      generation = headingText(el);
      talent = null;
    } else if (el.tagName === "H3") {
      talent = headingText(el);
      const href = el.querySelector('a[href^="/wiki/"]')?.getAttribute("href");
      if (href && !href.includes("?")) pages[talent] = BASE_URL + href;
    } else if (talent) {
      const emote = parseEmote(el);
      if (!emote) continue;
      const gen = generation ?? "Ungrouped";
      const emotes = ((result[gen] ??= {})[talent] ??= {});
      if (!(emote.name in emotes)) emotes[emote.name] = emote.url;
    }
  }

  return { generations: result, pages };
}

function infoboxCell(body: HTMLElement, label: string): HTMLElement | null {
  for (const th of body.querySelectorAll("th")) {
    if (!th.text.replace(/\s+/g, " ").includes(label)) continue;
    const td = th.nextElementSibling;
    if (td && td.tagName === "TD") return td;
  }
  return null;
}

function cellLines(td: HTMLElement): string[] {
  return td.innerHTML
    .split(/<br\s*\/?>/i)
    .map((part) => parseHtml(part).text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

async function fetchTalentInfo(page: string): Promise<Omit<TalentInfo, "page"> | null> {
  const body = await fetchArticle(page);
  const mark = infoboxCell(body, "Oshi Mark");
  if (!mark) return null;
  const fan = infoboxCell(body, "Fan Name");
  const fanLines = fan ? cellLines(fan) : [];
  const current = fanLines.find((l) => /\(current\)/i.test(l)) ?? fanLines[fanLines.length - 1] ?? "";
  return {
    oshiMark: cellLines(mark).join(" ").trim(),
    fanName: current.replace(/\((current|former)\)/gi, "").trim(),
  };
}

async function fetchTalents(pages: TalentPages): Promise<TalentInfoMap> {
  const result: TalentInfoMap = {};
  const names = Object.keys(pages);
  console.error(`Fetching ${names.length} talent pages…`);
  for (const name of names) {
    const page = pages[name]!;
    const info = await fetchTalentInfo(page);
    if (!info) {
      console.error(`  no oshi mark on ${page}`);
      continue;
    }
    result[name] = { page, ...info };
  }
  return result;
}

const SKIP_URL_FRAGMENTS = ["/static/", "spinner", "placeholder", "blank.gif", "pixel"];
const SKIP_NAME_FRAGMENTS = ["loading", "placeholder", "sprite"];

function parseEmote(img: HTMLElement): { name: string; url: string } | null {
  const src = img.getAttribute("src") ?? "";
  if (!src) return null;

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

  name = name.replace(/\.[A-Za-z0-9]{2,5}$/, "").replace(/_/g, " ").trim();

  return { name, url };
}

const DOWNLOAD_CONCURRENCY = 6;

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
  const pages: TalentPages = {};

  for (const branch of selected) {
    console.error(`Fetching data for ${branch.name}…`);
    const { generations: data, pages: branchPages } = await buildBranchData(branch.url);
    Object.assign(pages, branchPages);

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
    const talents = await fetchTalents(pages);
    writeFileSync(`${outputPath}/talents.json`, JSON.stringify(talents, null, 2) + "\n", "utf-8");
    console.error(`  → ${outputPath}/talents.json (${Object.keys(talents).length} talents)`);
    await syncThumbs(result, outputPath);
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
