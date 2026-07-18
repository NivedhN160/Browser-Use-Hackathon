/**
 * Buying-Signal Scanner — orchestration script
 *
 * PREREQUISITE: you must have already had your agent author the adapter:
 *   webcmd greenhouse jobs --company <slug>
 * and confirmed it returns JSON like:
 *   [{ "title": "...", "department": "...", "location": "...", "url": "..." }]
 *
 * This script just does the boring part: loop it across companies,
 * score each with Claude, print a ranked table.
 *
 * Setup:
 *   npm install groq-sdk
 *   Get a free key at https://console.groq.com/keys
 *   export GROQ_API_KEY=your_key
 *   node orchestrate.js
 */

const { execSync } = require("child_process");
require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq(); // reads GROQ_API_KEY from env
const MODEL = "llama-3.1-8b-instant"; // free tier, fast, plenty for this classification task

// Edit this list live during the demo — start with 4-5 known Greenhouse companies
const COMPANIES = ["airbnb", "stripe", "notion", "figma", "linear"];

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

async function scoreCompany(companySlug, roles) {
  const prompt = `Company: ${companySlug}
Open roles: ${JSON.stringify(roles.map(r => ({ title: r.title, department: r.department })))}

Score 0-10 how strongly these open roles signal that this company needs a
RevOps / GTM / Marketing Automation / Sales tool right now.
Base the score on matches against: ${SIGNAL_KEYWORDS.join(", ")}.

Respond ONLY with JSON, no markdown fences:
{"company": "...", "score": 0, "matching_roles": ["..."], "reasoning": "..."}`;

  const resp = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 200, // keep it tight — output is just short JSON
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { company: companySlug, score: 0, matching_roles: [], reasoning: "parse failed" };
  }
}

async function main() {
  const results = [];

  for (const company of COMPANIES) {
    console.log(`Checking ${company}...`);
    const roles = getRoles(company);
    if (!roles || roles.length === 0) continue;

    const relevantRoles = roles.filter(r => 
        /sales|marketing|growth|ops|gtm|revenue|revops/i.test(r.title) || 
        /sales|marketing|growth|ops|gtm|revenue|revops/i.test(r.department)
    ).slice(0, 50);

    const scored = await scoreCompany(company, relevantRoles.length > 0 ? relevantRoles : roles.slice(0, 10));
    results.push(scored);
  }

  results.sort((a, b) => b.score - a.score);

  console.log("\n=== RANKED BUYING SIGNALS ===\n");
  for (const r of results) {
    console.log(`${r.score.toString().padStart(2)}/10  ${r.company}`);
    console.log(`      matches: ${r.matching_roles.join(", ") || "none"}`);
    console.log(`      why: ${r.reasoning}\n`);
  }
}

main();