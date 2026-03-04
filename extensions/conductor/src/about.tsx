import { Detail, ActionPanel, Action } from "@raycast/api";

export default function About() {
  const markdown = `
# 🪄 Conductor

### AI-powered Mac Automation

Conductor is a **Raycast AI Tool** that lets you automate your Mac using natural language. 

## 🚀 How to use

1.  Open **Raycast AI Chat** (Cmd + Space, then type "AI Chat").
2.  Enable the **Conductor** tool (click the tool icon or type \`@Conductor\`).
3.  Ask anything!

### Try these examples:
- "Open Safari and go to raycast.com"
- "Set my volume to 50%"
- "Hide all apps except for VS Code"
- "List the files in my Downloads folder"
- "Empty the Trash"

## 🛡️ Security

Every script is shown to you for confirmation before it runs. You can see the code and exactly what it will do. No surprises.

## 🔁 Saved Automations

After a successful run, ask Conductor to save it with a name. Then open the **Saved Automations** command to rerun it in one click.

---
*Created by harrison_weiss*
  `;

  return (
    <Detail
      navigationTitle="About Conductor"
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="View Documentation"
            url="https://github.com/harrison_weiss/raycast-ai-applescript"
          />
        </ActionPanel>
      }
    />
  );
}
