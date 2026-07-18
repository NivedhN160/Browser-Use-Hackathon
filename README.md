# Buying-Signal Scanner

## What this is
This project is a Buying-Signal Scanner that automates the process of identifying target prospects based on their hiring behavior. Instead of manually checking careers pages, this tool scrapes job boards via `webcmd` (focusing on Greenhouse-hosted boards), scores companies by their GTM (Go-To-Market), RevOps, and Sales Ops hiring signals using a Groq-powered LLM, and outputs a ranked list of qualified leads. It's a clear demonstration of `webcmd`'s "record once, execute forever" capability applied to real-world sales intelligence.

## How it works
The architecture consists of three layers:
1. **webcmd adapters (Dual-Path)**: 
   - **API-backed**: `webcmd greenhouse jobs` programmatically visits Greenhouse job boards and returns stable JSON by directly querying the public API for speed.
   - **Browser-automation**: `webcmd lever jobs` launches a real headed Chrome browser to navigate Lever job boards, evaluate the DOM, and scrape `.posting` elements because Lever lacks a clean public JSON API.
2. **orchestrator loop**: A Node.js script (`orchestrate.js`) that runs the adapters across a batch of target companies (e.g., Airbnb, Stripe for Greenhouse; Palantir, Spotify for Lever).
3. **LLM scoring**: A scoring step where the extracted roles are sent to Groq (`llama-3.1-8b-instant`), which scores each company 0-10 on their need for a GTM/Sales tool based on the presence of relevant open roles.

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
   Copy the example environment file and add your Groq API key (get a free key at [console.groq.com/keys](https://console.groq.com/keys)):
   ```bash
   cp .env.example .env
   ```
   Add your key to `.env`: `GROQ_API_KEY=your_key_here`

## Usage
Run the orchestration script to execute the scanner across the configured companies:
```bash
npm start
```
*Note: You can edit the `COMPANIES` array in `orchestrate.js` to target different companies.*

## Demo
<!-- Placeholder for demo GIF/screen recording -->

## Known limitations
- Currently supports **Greenhouse** and **Lever** job boards only. (Support for Ashby, Workday, etc., can be added by authoring new `webcmd` adapters).
- Free-tier rate limits on Groq might throttle requests if the company list is very large. The script pre-filters roles to minimize token burn.
