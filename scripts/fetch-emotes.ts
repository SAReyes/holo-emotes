import { mkdirSync, writeFileSync } from "fs";
import { select } from "@inquirer/prompts";
import { parse as parseHtml } from "node-html-parser";

const API = "https://hololive.wiki/w/api.php";
const ROOT_PAGE = "Membership_Emotes";
const BASE_URL = "https://hololive.wiki";

type EmoteMap      = Record<string, string>;       // emote name → url
type TalentMap     = Record<string, EmoteMap>;     // talent name → emotes
type GenerationMap = Record<string, TalentMap>;    // generation name → talents
type BranchMap     = Record<string, GenerationMap>; // branch name → generations

/** Section headings come back HTML-escaped (e.g. "Fuwawa &amp; Mococo"); decode to plain text. */
function sectionHeading(line: string): string {
  return parseHtml(line).textContent.trim();
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

async function apiGet(params: Record<string, string>): Promise<unknown> {
  const url = new URL(API);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Wiki API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Branch discovery
// ---------------------------------------------------------------------------

interface Branch {
  name: string;
  title: string;
  href: string;
}

async function fetchBranches(): Promise<Branch[]> {
  const sectionsData = (await apiGet({
    action: "parse",
    page: ROOT_PAGE,
    prop: "sections",
    format: "json",
  })) as { parse: { sections: Array<{ line: string; index: string }> } };

  const section = sectionsData.parse.sections.find(
    (s) => s.line === "Emotes by branches"
  );
  if (!section) throw new Error('Could not find section: "Emotes by branches"');

  const htmlData = (await apiGet({
    action: "parse",
    page: ROOT_PAGE,
    section: section.index,
    prop: "text",
    format: "json",
  })) as { parse: { text: { "*": string } } };

  return parseBranches(htmlData.parse.text["*"]);
}

function parseBranches(html: string): Branch[] {
  const root = parseHtml(html);
  const seen = new Set<string>();
  const results: Branch[] = [];

  for (const a of root.querySelectorAll("li a")) {
    const title = a.getAttribute("title") ?? "";
    const href = a.getAttribute("href") ?? "";
    const name = a.text.trim();

    if (name && title && !href.startsWith("#") && !seen.has(title)) {
      seen.add(title);
      results.push({ name, title, href });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Branch data (generations → talents → emotes)
// ---------------------------------------------------------------------------

interface TalentPlan {
  name: string;
  sectionIndex: string;
  emotes: EmoteMap;
}

interface GenerationPlan {
  generation: string;
  talents: TalentPlan[];
}

async function buildBranchData(pageTitle: string): Promise<GenerationMap> {
  const sectionsData = (await apiGet({
    action: "parse",
    page: pageTitle,
    prop: "sections",
    format: "json",
  })) as {
    parse: {
      title?: string;
      sections: Array<{ line: string; index: string; level: string }>;
    };
  };

  if (!sectionsData.parse.title) {
    throw new Error(`Could not load page: ${pageTitle}`);
  }

  // Build plan: level ≤ 2 → generation header, level 3 → talent section
  const plan: GenerationPlan[] = [];
  let currentGeneration: GenerationPlan | null = null;

  for (const s of sectionsData.parse.sections) {
    const line = sectionHeading(s.line);
    const level = parseInt(s.level, 10);

    if (!line || !s.index || line === "Beginning") continue;

    if (level <= 2) {
      currentGeneration = { generation: line, talents: [] };
      plan.push(currentGeneration);
    } else if (level === 3) {
      if (!currentGeneration) {
        currentGeneration = { generation: "Ungrouped", talents: [] };
        plan.push(currentGeneration);
      }
      currentGeneration.talents.push({
        name: line,
        sectionIndex: s.index,
        emotes: {},
      });
    }
  }

  // Fetch emotes for every talent section
  for (const generation of plan) {
    for (const talent of generation.talents) {
      const sectionData = (await apiGet({
        action: "parse",
        page: pageTitle,
        section: talent.sectionIndex,
        prop: "text",
        format: "json",
      })) as { parse: { text: { "*": string } } };

      talent.emotes = parseEmotes(sectionData.parse.text["*"]);
    }
  }

  // Convert plan to nested dictionaries, dropping empty talents and generations
  const result: GenerationMap = {};
  for (const gen of plan) {
    const talentMap: TalentMap = {};
    for (const { name, emotes } of gen.talents) {
      if (Object.keys(emotes).length > 0) {
        talentMap[name] = emotes;
      }
    }
    if (Object.keys(talentMap).length > 0) {
      result[gen.generation] = talentMap;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Emote parsing
// ---------------------------------------------------------------------------

const SKIP_URL_FRAGMENTS = ["/static/", "spinner", "placeholder", "blank.gif", "pixel"];
const SKIP_NAME_FRAGMENTS = ["loading", "placeholder", "sprite"];

function parseEmotes(html: string): EmoteMap {
  const root = parseHtml(html);
  const result: EmoteMap = {};

  for (const img of root.querySelectorAll("img")) {
    const src = img.getAttribute("src") ?? "";
    if (!src) continue;

    // Resolve protocol-relative (//...), absolute-path (/...), and full URLs
    let url: string;
    if (src.startsWith("//")) {
      url = "https:" + src;
    } else if (src.startsWith("http")) {
      url = src;
    } else {
      url = BASE_URL + src;
    }

    if (SKIP_URL_FRAGMENTS.some((x) => url.toLowerCase().includes(x))) continue;

    const rawName =
      img.getAttribute("data-image-name") ??
      img.getAttribute("alt") ??
      img.getAttribute("title") ??
      "";

    let name = rawName.trim();
    if (!name || SKIP_NAME_FRAGMENTS.some((x) => name.toLowerCase().includes(x))) continue;

    // Normalize: strip extension, replace underscores
    name = name.replace(/\.[A-Za-z0-9]{2,5}$/, "").replace(/_/g, " ").trim();

    if (!(name in result)) {
      result[name] = url;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
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
    const data = await buildBranchData(branch.title);

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

  if (!outputPath) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
