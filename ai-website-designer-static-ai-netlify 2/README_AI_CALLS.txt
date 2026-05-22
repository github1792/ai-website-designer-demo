# AI Website Designer Static Demo + Real AI Calls

This version adds a Netlify Function so the frontend can call Gemini without exposing your API key in browser code.

## Important

This cannot be deployed with simple Netlify Drop if you want real AI calls.

For real API calls, deploy through GitHub or Netlify CLI so Netlify can build and deploy the serverless function.

## Files added

```text
netlify/functions/generate-ai.js
netlify.toml
```

## Environment variable needed

Add this in Netlify:

```text
GEMINI_API_KEY=your_gemini_api_key
```

## How the request flows

```text
Browser
→ /api/generate-ai
→ Netlify Function
→ Gemini API
→ JSON blueprint
→ Frontend renders website/game
```

## Local testing with Netlify CLI

Install Netlify CLI:

```bash
npm install -g netlify-cli
```

Run locally:

```bash
netlify dev
```

Then open the local URL Netlify gives you.

## Deploy through GitHub

1. Upload this folder to GitHub.
2. In Netlify, choose Add new site → Import from Git.
3. Select the repo.
4. Add environment variable `GEMINI_API_KEY`.
5. Deploy.

## What still remains frontend-only

This version does not save data to a database. It only adds real AI generation.
For database, image storage, login and payments, use the full backend version.
