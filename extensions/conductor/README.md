# Conductor

Conductor is an AI-powered AppleScript assistant for Raycast. It allows you to automate your Mac by describing what you want in plain English.

## Features

- **Automate Anything:** From opening URLs to complex system settings.
- **AI-Powered:** Uses Raycast AI to generate and execute AppleScript.
- **Secure:** Every script is shown to you for confirmation before it runs.
- **Extensible:** Works with any app that supports AppleScript.
- **Reusable Recipes:** Save successful runs as named automations and run them later with one click.

## How to Use

1.  Open Raycast AI Chat (default shortcut `Cmd + Space` then type "AI Chat").
2.  Enable the **Conductor** tool by clicking the tool icon or typing `@Conductor`.
3.  Ask something like:
    - *"Open Safari and go to raycast.com"*
    - *"Turn on Do Not Disturb for 1 hour"*
    - *"Create a new folder named 'Project' on my desktop"*
    - *"Empty the Trash"*
    - *"Get the currently playing track in Spotify"*
4.  Review the generated script in the confirmation dialog.
5.  Click **Run** to execute.
6.  Ask Conductor to save it, e.g. *"Save that as Morning Setup"*.
7.  Open the **Saved Automations** command to rerun, copy, or delete saved recipes.

### Parameterized Automations

You can add template variables in your scripts or explanations using `{{variable_name}}`.
When a saved automation contains variables, the **Saved Automations** command prompts for those values before execution.

## Safety & Security

Conductor is designed with a "Safety First" approach. It will **never** execute a script without your explicit confirmation. You can always see exactly what code will be run and a short explanation of its purpose.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
