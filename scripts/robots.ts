/**
 * Minimal robots.txt support: parse the `User-agent: *` group and decide
 * whether a path may be fetched. Longest matching rule wins; on a tie Allow
 * wins (the same semantics Google documents).
 */
export interface RobotsRules {
  allow: string[];
  disallow: string[];
}

export function parseRobots(text: string, agent = "*"): RobotsRules {
  const rules: RobotsRules = { allow: [], disallow: [] };
  let inGroup = false;
  let sawAgentLine = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      // Consecutive user-agent lines form one group; a rule line closes the header.
      if (!sawAgentLine) inGroup = false;
      sawAgentLine = true;
      if (value.toLowerCase() === agent.toLowerCase()) inGroup = true;
      continue;
    }
    sawAgentLine = false;
    if (!inGroup || !value) continue;
    if (key === "allow") rules.allow.push(value);
    if (key === "disallow") rules.disallow.push(value);
  }
  return rules;
}

function ruleToRegExp(rule: string): RegExp {
  const anchored = rule.endsWith("$");
  const body = (anchored ? rule.slice(0, -1) : rule)
    .split("*")
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

function longestMatch(rules: string[], path: string): number {
  let best = -1;
  for (const rule of rules) {
    if (ruleToRegExp(rule).test(path)) best = Math.max(best, rule.length);
  }
  return best;
}

/** `path` is the URL path plus query string, e.g. "/w/api.php?action=parse". */
export function isAllowed(rules: RobotsRules, path: string): boolean {
  const allow = longestMatch(rules.allow, path);
  const disallow = longestMatch(rules.disallow, path);
  if (disallow < 0) return true;
  return allow >= disallow;
}

const cache = new Map<string, Promise<RobotsRules>>();

/** Fetch and cache the robots.txt for a URL's origin. A missing file allows everything. */
export function robotsFor(url: string): Promise<RobotsRules> {
  const origin = new URL(url).origin;
  let pending = cache.get(origin);
  if (!pending) {
    pending = fetch(`${origin}/robots.txt`).then(async (res) => {
      if (res.status === 404) return { allow: [], disallow: [] };
      if (!res.ok) throw new Error(`Could not read ${origin}/robots.txt: ${res.status}`);
      return parseRobots(await res.text());
    });
    cache.set(origin, pending);
  }
  return pending;
}

/** Throw before fetching a URL the host's robots.txt disallows for everyone. */
export async function assertAllowed(url: string): Promise<void> {
  const u = new URL(url);
  const rules = await robotsFor(url);
  if (!isAllowed(rules, u.pathname + u.search)) {
    throw new Error(`robots.txt at ${u.origin} disallows ${u.pathname}${u.search}`);
  }
}
