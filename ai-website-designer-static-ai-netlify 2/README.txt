# AI Website Designer — Full Static AI Netlify Version

This fixes the simplified static demo issue.

## What this version restores

- Full tabbed builder interface
- Preview tab
- Brief tab
- Website type selector
- Template gallery
- Special Request tab
- Specially Made tab
- Media upload tab
- 2D Game Generator tab
- Code tab
- Deploy tab
- Netlify Function for real AI calls
- Local fallback if AI is not configured

## Important

This does NOT force a Happy Birthday Mama page. That was only a test/special example and has been removed as the default.

## Deploy settings on Netlify

If this folder is nested in GitHub:

```text
Base directory: ai-website-designer-full-static-ai-netlify
Build command: leave empty
Publish directory: .
```

If `index.html` is in the repo root:

```text
Base directory: leave empty
Build command: leave empty
Publish directory: .
```

## AI setup

Add this environment variable in Netlify:

```text
GEMINI_API_KEY
```

Then redeploy.

## Function path

```text
/api/generate-ai
```
