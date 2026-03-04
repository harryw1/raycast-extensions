# Conductor

A Raycast AI Extension that gives Raycast's built-in AI chat the ability to run AppleScript on your Mac.

## Prerequisites

- **Raycast** with an **AI Pro** subscription
- **Node.js 18+**

## Setup

```bash
cd raycast-ai-applescript
npm install
npm run dev
```

Raycast will load the extension automatically. No further configuration needed.

> **Author field:** `package.json` has `"author": "your-raycast-username"`. You only need to change this if you plan to publish to the Raycast Store.

## How it works

This is a **Raycast AI Tool** — not a standalone command. Once loaded, Raycast's native AI chat gains a new `run-applescript` tool it can call automatically.

Open Raycast AI chat and ask anything that involves your Mac:

- *"What apps are currently open?"*
- *"Set my volume to 50%"*
- *"Open a new Safari window and go to raycast.com"*
- *"How much free disk space do I have?"*
- *"Create a folder called Projects on my Desktop"*
- *"Get the title of the frontmost window"*

When the AI decides to run a script, a **native confirmation sheet** appears showing what the script will do and a preview of the code. You approve or cancel before anything executes.

## macOS Permissions

The first time a script touches an app (Finder, Safari, System Events, etc.), macOS will prompt for **Automation** permission. Approve it in:

**System Settings → Privacy & Security → Automation**

## Project structure

```
raycast-ai-applescript/
├── src/
│   ├── about.tsx               # Required command (shows usage info)
│   └── tools/
│       └── run-applescript.ts  # The AI tool — AppleScript execution + confirmation
├── assets/
│   └── extension-icon.png
├── package.json
└── tsconfig.json
```

## Building for production

```bash
npm run build
```
