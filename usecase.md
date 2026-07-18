Build this: Buying-Signal Scanner via Job Boards
The use case: Companies that are hiring for RevOps/Sales Ops/Marketing Automation/Growth roles are telegraphing that they're about to invest in GTM tooling. Instead of a rep manually checking careers pages one by one, your agent checks dozens of companies' job boards automatically and ranks them by how strong that "buying signal" is.
Why this one: Most companies' job boards run on the same underlying platform (Greenhouse, Lever, Ashby) — so when your agent learns to navigate one company's board via webcmd, that same compiled adapter works instantly on hundreds of other companies you've never touched. That's the single clearest, most demo-able proof of webcmd's "record once, execute forever" pitch in the whole hackathon.
What you actually build (in order):

A webcmd adapter — have your agent (Claude Code + webcmd installed) author webcmd greenhouse jobs --company <slug> that returns JSON: [{title, department, location, url}]. This is your one authoring/learning phase.
A batch loop — run that same command across 5-10 real companies (Airbnb, Stripe, Notion, Figma, Linear, etc. — all on Greenhouse). This is your reliability payoff: same adapter, zero re-learning, instant results.
A scoring step — one Claude API call per company: feed it the roles JSON, ask it to score 0-10 how strongly the open roles signal need for a RevOps/GTM/sales tool, with reasoning.
Output — a ranked table/sheet: company, score, matching roles, why. This is what you show judges as the "product."
