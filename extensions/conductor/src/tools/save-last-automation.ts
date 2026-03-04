import { Tool } from "@raycast/api";
import {
  extractTemplateVariables,
  saveLastRunAsAutomation,
} from "@/lib/automations";

type Input = {
  /**
   * Human-friendly automation name, e.g. "Open my morning dashboard".
   */
  name: string;
};

export const confirmation: Tool.Confirmation<Input> = async ({ name }) => {
  return {
    message: `Save the latest successful script as "${name.trim()}"?`,
  };
};

export default async function saveLastAutomationTool(
  input: Input,
): Promise<string> {
  try {
    const automation = await saveLastRunAsAutomation(input.name);
    const variables = extractTemplateVariables(
      `${automation.explanation}\n${automation.script}`,
    );
    const varSummary =
      variables.length > 0
        ? ` Detected template variables: ${variables.join(", ")}.`
        : "";

    return `Saved automation "${automation.name}".${varSummary} You can run it from the Saved Automations command.`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save automation.";
    return `SAVE_ERROR: ${message} Run an automation first, then save it.`;
  }
}
