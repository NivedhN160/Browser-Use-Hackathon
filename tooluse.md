1. Install
bashnpm install -g @agentrhq/webcmd
Requires Node 20+ (per the event's own instructions).
2. Check it's working
bashwebcmd --help
webcmd list -f json
list shows any adapters already registered (built-in, plugin, or ones you've authored) — worth checking before building your own, since the docs explicitly say reuse an existing command before crawling again.
3. The key mental model: webcmd doesn't run itself — an AI agent drives it
You don't hand-write selectors or scripts. You give an agent (Claude, running in a terminal where it has shell access — Claude Code is the natural fit here) a plain-language goal, and the agent uses webcmd to explore the target site and author a CLI command. So step 3 is really: open Claude Code in your project folder, with webcmd installed, and give it an authoring prompt like:
Create a Webcmd CLI for Greenhouse-hosted job boards.
Command: webcmd greenhouse jobs --company <slug>
It should open boards.greenhouse.io/<slug>, list all open roles,
and return stable JSON: [{title, department, location, url}].
Verify against 2-3 different companies before finishing.
The agent will actually go browse the site, figure out the navigation, and register a new command — that's the "recording" phase. Expect it to take a few minutes and possibly a couple of retries; that's normal and part of the demo story.
4. Once authored, call the new command directly — no agent needed anymore
bashwebcmd greenhouse jobs --company airbnb
webcmd greenhouse jobs --company stripe
webcmd greenhouse jobs --company notion
Each call returns clean JSON, fast, because it's replaying the compiled adapter instead of re-reasoning through the DOM. This is the part you actually demo live.
5. If a site changes and the adapter breaks
Heal `webcmd greenhouse jobs`. It's returning empty results.
Preserve the command name and output schema, repair the adapter,
and report what changed.
Same pattern — you ask the agent to fix it, not yourself.
6. Feed the JSON output into a separate Claude call for the scoring/ranking step — that part is just a normal API call, no webcmd involved.