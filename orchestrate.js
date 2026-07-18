const { execSync } = require("child_process");
require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq();
const MODEL = "llama-3.1-8b-instant";

const COMPANIES = ["airbnb", "stripe", "figma", "discord", "webflow"];
const LEVER_COMPANIES = ["palantir", "spotify"];

const SIGNAL_KEYWORDS = [
  "RevOps",
  "Sales Ops",
  "Marketing Automation",
  "Growth",
  "GTM",
];

function getRoles(companySlug) {
  try {
    const raw = execSync(`npx webcmd greenhouse jobs --company ${companySlug} -f json`, {
      encoding: "utf-8",
      timeout: 30000,
    });
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[warn] ${companySlug} failed:`, err.message.split("\n")[0]);
    return null;
  }
}

function getBrowserRoles(companySlug) {
  try {
    const raw = execSync(`npx webcmd lever jobs --company ${companySlug} --window foreground -f json`, {
      encoding: "utf-8",
      timeout: 60000,
    });
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[warn] ${companySlug} failed:`, err.message.split("\n")[0]);
    return null;
  }
}

function parseScoreResponse(text, companySlug) {
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (Array.isArray(parsed.matching_roles)) {
      parsed.matching_roles = parsed.matching_roles.map(r =>
        typeof r === "string" ? r : (r.title || JSON.stringify(r))
      );
    }
    return parsed;
  } catch {
    return { company: companySlug, score: 0, matching_roles: [], reasoning: "parse failed" };
  }
}

function filterRelevantRoles(roles) {
    if (!roles) return [];
    return roles.filter(r => 
        /sales|marketing|growth|ops|gtm|revenue|revops/i.test(r.title) || 
        /sales|marketing|growth|ops|gtm|revenue|revops/i.test(r.department)
    ).slice(0, 50);
}

async function scoreCompany(companySlug, roles) {
  const prompt = `Company: ${companySlug}
Open roles: ${JSON.stringify(roles.map(r => ({ title: r.title, department: r.department })))}

Score 0-10 how strongly these open roles signal that this company needs a
RevOps / GTM / Marketing Automation / Sales tool right now.
Base the score on matches against: ${SIGNAL_KEYWORDS.join(", ")}.
List at most 5 matching_roles even if more match. Keep reasoning under 40 words.

Respond ONLY with JSON, no markdown fences:
{"company": "...", "score": 0, "matching_roles": ["..."], "reasoning": "..."}`;

  const resp = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 350,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.choices[0]?.message?.content || "{}";
  return parseScoreResponse(text, companySlug);
}

async function main() {
  const results = [];
  const totalCompanies = COMPANIES.length + LEVER_COMPANIES.length;
  let i = 0;

  for (const company of COMPANIES) {
    console.log(`\x1b[36m[${i + 1}/${totalCompanies}]\x1b[0m Checking \x1b[1m${company}\x1b[0m...`);
    const roles = getRoles(company);
    if (!roles || roles.length === 0) {
      console.log(`\x1b[90m      → no roles found for ${company}\x1b[0m`);
      i++;
      continue;
    }

    const relevantRoles = filterRelevantRoles(roles);

    const scored = await scoreCompany(company, relevantRoles.length > 0 ? relevantRoles : roles.slice(0, 10));
    scored.source = "greenhouse-api";
    results.push(scored);
    i++;
  }

  for (const company of LEVER_COMPANIES) {
    console.log(`\x1b[36m[${i + 1}/${totalCompanies}]\x1b[0m Checking \x1b[1m${company}\x1b[0m...`);
    const roles = getBrowserRoles(company);
    if (!roles || roles.length === 0) {
      console.log(`\x1b[90m      → no roles found for ${company}\x1b[0m`);
      i++;
      continue;
    }

    const relevantRoles = filterRelevantRoles(roles);

    const scored = await scoreCompany(company, relevantRoles.length > 0 ? relevantRoles : roles.slice(0, 10));
    scored.source = "lever-browser";
    results.push(scored);
    i++;
  }

  results.sort((a, b) => b.score - a.score);

  console.log("\n\x1b[1m\x1b[36m=== RANKED BUYING SIGNALS ===\x1b[0m\n");
  for (const r of results) {
    const scoreColor = r.score >= 8 ? "\x1b[32m" : r.score >= 5 ? "\x1b[33m" : "\x1b[90m";
    console.log(`${scoreColor}\x1b[1m${r.score.toString().padStart(2)}/10\x1b[0m  \x1b[1m${r.company}\x1b[0m \x1b[90m[${r.source}]\x1b[0m`);
    console.log(`      \x1b[90mmatches:\x1b[0m ${r.matching_roles.join(", ") || "none"}`);
    console.log(`      \x1b[90mwhy:\x1b[0m ${r.reasoning}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseScoreResponse, filterRelevantRoles, scoreCompany, getRoles, getBrowserRoles, main };