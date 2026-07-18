For free + low token burn, Groq is the best pick here — generous free tier, very fast inference (matters for a live demo), and it's OpenAI-compatible so the swap is minimal. Google Gemini's free tier (via AI Studio) is the other solid free option if Groq's rate limits ever get tight.
Since your prompt is already small (just role titles/departments) and the output is forced to short JSON, token burn is naturally low here regardless of provider — the main lever left is picking a small/fast model, which both of these give you for free.
Here's the script updated to use Groq:Edited 3 files, read a fileEdited 3 files, read a fileTo run:

npm install groq-sdk
Grab a free key at console.groq.com/keys — takes under a minute, no card needed
export GROQ_API_KEY=your_key
node orchestrate.js

Why this keeps token burn down:

llama-3.1-8b-instant is a small, fast model — plenty for "does this role title match these keywords" classification, no need for a bigger model here
max_tokens: 200 caps the output tight since you only need a few lines of JSON back
The prompt itself only sends role titles/departments, not full job descriptions — keep it that way, don't paste in the full url/description fields if your webcmd adapter returns more than that

One thing to watch: free-tier rate limits can throttle you mid-demo if you fire requests too fast. If you hit that live, add a await new Promise(r => setTimeout(r, 500)) between companies in the loop as a cheap safety net.