# Buying-Signal Scanner

**Hiring signals = buying signals.** When a company posts multiple roles for "RevOps", "GTM Strategy", or "Sales Engineering," they aren't just looking for talent—they are actively feeling operational pain and evaluating new tools. This project automates the discovery of these high-intent prospects at scale by orchestrating LLMs and browser automation, turning public job boards into a highly qualified, automated lead pipeline.

[**📺 Watch the Demo Video**](https://drive.google.com/file/d/1lq-gdH4Z256BeVbPO2oCu8PKhNogrsVS/view?usp=drive_link)

---

## Sample Output

Skimming for prospects? Here is exactly what the orchestrator outputs after scraping and scoring:

```text
=== RANKED BUYING SIGNALS ===

 7/10  Webflow [greenhouse-api]
      matches: Sales Development Representative (SDR), Senior GTM Engineer, Marketing Operations, Senior Solutions Engineer, EMEA
      why: Multiple roles indicate a need for sales and technical optimization, GTM strategies and efficient marketing operations.

 6/10  Spotify [lever-browser]
      matches: Paid Revenue Manager, Marketing Technology Manager, Lead Growth Manager- UK/IE/NL
      why: Roles related to growth, revenue, and marketing tech indicate a need for sales and marketing automation tools, signaling a need for RevOps/GTM integration.
```

## Why Two Data Sources?

This project utilizes two different `webcmd` adapters to prove out the core thesis of **"record once, execute forever"**:

1. **API-Backed (Greenhouse):** Where companies expose clean JSON endpoints, we use a lightweight, fast adapter to pull data programmatically without overhead. 
2. **Real Browser Automation (Lever):** For job boards that lack clean JSON APIs or heavily rely on client-side rendering, we authored a `lever` adapter that launches a **real, headed Chrome browser**. It navigates to the company page and uses `page.evaluate()` to extract elements directly from the live DOM. 

By having both, the architecture is resilient. You can point the orchestrator at any company, and regardless of how their careers page is built under the hood, `webcmd` abstracts the complexity into a unified, predictable JSON stream for the LLM to score.

## How it works
The architecture consists of three layers:
1. **webcmd adapters (Dual-Path)**: `webcmd greenhouse jobs` for speed, and `webcmd lever jobs` for raw DOM extraction via browser automation.
2. **Orchestrator loop**: A Node.js script (`orchestrate.js`) that runs the adapters across a batch of target companies.
3. **LLM scoring**: A scoring step where the extracted roles are piped to Groq (`llama-3.1-8b-instant`), which scores each company 0-10 on their need for a GTM/Sales tool based on the presence of relevant open roles.

## Rubric Alignment

- **Innovation / Creativity:** Rather than using generic web scraping, this flips the script on "lead generation" by treating hiring data as a direct proxy for software buying intent, powered by real-time LLM reasoning.
- **Technical Execution:** Implements a dual-path pipeline (fast JSON APIs + real browser automation) that gracefully handles failures, normalizes disparate data sources, and manages strict token limits.
- **Business Impact:** Directly solves the "empty pipeline" problem for B2B sales teams. It's a pragmatic, high-ROI tool that can be deployed by a RevOps team immediately.
- **Platform Usage (`webcmd`):** Proves the "record once, execute forever" concept by abstracting messy job board DOMs into a single CLI command that feeds perfectly into an AI agent.
- **Completeness:** A fully functioning, end-to-end pipeline with error handling, UX-friendly CLI output, colored terminal ranking, and a working demo.

## Setup
1. **Prerequisites**: Ensure you have Node 20+ installed.
2. **Install webcmd globally**:
   ```bash
   npm install -g @agentrhq/webcmd
   ```
3. **Install project dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**:
   Copy the example environment file and add your Groq API key:
   ```bash
   cp .env.example .env
   ```
   Add your key to `.env`: `GROQ_API_KEY=your_key_here`

## Usage
Run the orchestration script to execute the scanner across the configured companies:
```bash
npm start
```

## Known limitations
- Currently supports **Greenhouse** and **Lever** job boards only. (Support for Ashby, Workday, etc., can be easily added by authoring new `webcmd` adapters).
- **Note on the Lever adapter:** The Lever adapter (`~/.webcmd/clis/lever/jobs.js`) was authored completely from scratch *during* this hackathon to demonstrate exactly how quickly a new, browser-driven data source can be recorded and integrated into the pipeline.
- Free-tier rate limits on Groq might throttle requests if the company list is very large. The script pre-filters roles to minimize token burn.
