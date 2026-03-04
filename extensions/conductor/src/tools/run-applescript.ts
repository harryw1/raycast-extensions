import { Tool } from "@raycast/api";
import { runAppleScript } from "@/lib/applescript";
import { setLastSuccessfulRun } from "@/lib/automations";

/**
 * Input for the run-applescript tool.
 */
type Input = {
  /**
   * The complete AppleScript code to execute on the user's Mac.
   * Write clean, idiomatic AppleScript using "tell application" blocks.
   * Wrap risky operations in try...on error errMsg...end try blocks.
   */
  script: string;

  /**
   * A short, plain-English description of what the script will do.
   * This is shown to the user in the confirmation dialog before the script runs.
   * Be specific — e.g. "Open Safari and navigate to raycast.com" not "Run a script".
   */
  explanation: string;
};

function formatScriptForConfirmation(
  script: string,
): { name: string; value: string }[] {
  const maxChunkLength = 100;
  const lines = script.split("\n");
  const entries: { name: string; value: string }[] = [];
  const width = Math.max(2, String(lines.length).length);

  lines.forEach((line, index) => {
    if (line.length === 0) {
      entries.push({
        name: `L${String(index + 1).padStart(width, "0")}`,
        value: " ",
      });
      return;
    }

    for (let i = 0; i < line.length; i += maxChunkLength) {
      const chunk = line.slice(i, i + maxChunkLength);
      entries.push({
        name:
          i === 0
            ? `L${String(index + 1).padStart(width, "0")}`
            : `${" ".repeat(width + 1)}->`,
        value: chunk,
      });
    }
  });

  return entries;
}

/**
 * Confirmation step — shown to the user before the script runs.
 * Returns a description of what will happen so the user can approve or cancel.
 */
export const confirmation: Tool.Confirmation<Input> = async ({
  script,
  explanation,
}) => {
  const trimmedScript = script.trim();

  return {
    message: explanation,
    info: formatScriptForConfirmation(trimmedScript),
  };
};

/**
 * Executes AppleScript on the user's Mac and returns the result.
 * Writes the script to a temp file to handle multi-line scripts correctly
 * and avoid shell-escaping issues.
 */
export default async function runAppleScriptTool(
  input: Input,
): Promise<string> {
  const script = input.script.trim();
  const explanation = input.explanation.trim();

  if (script.length === 0) {
    return "SCRIPT_ERROR: The script cannot be empty.";
  }

  const result = await runAppleScript(script);
  if (!result.ok) {
    return `SCRIPT_ERROR: ${result.error}`;
  }

  await setLastSuccessfulRun({
    script,
    explanation,
    output: result.output,
    runAt: new Date().toISOString(),
  });

  return result.output;
}
