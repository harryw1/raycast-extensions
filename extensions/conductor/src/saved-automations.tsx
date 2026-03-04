import {
  Action,
  ActionPanel,
  Alert,
  Form,
  Icon,
  List,
  Toast,
  confirmAlert,
  popToRoot,
  showToast,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { runAppleScript } from "@/lib/applescript";
import {
  SavedAutomation,
  deleteSavedAutomation,
  extractTemplateVariables,
  getLastSuccessfulRun,
  getSavedAutomations,
  interpolateTemplate,
  saveLastRunAsAutomation,
  setLastSuccessfulRun,
  touchAutomationRun,
} from "@/lib/automations";

function formatDate(iso?: string): string {
  if (!iso) {
    return "Never";
  }

  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? "Unknown" : date.toLocaleString();
}

async function runAutomation(
  automation: SavedAutomation,
  values: Record<string, string>,
) {
  const finalScript = interpolateTemplate(automation.script, values);
  const finalExplanation = interpolateTemplate(automation.explanation, values);

  const approved = await confirmAlert({
    title: "Run saved automation?",
    message: finalExplanation,
    primaryAction: {
      title: "Run",
      style: Alert.ActionStyle.Default,
    },
    dismissAction: {
      title: "Cancel",
      style: Alert.ActionStyle.Cancel,
    },
  });

  if (!approved) {
    return;
  }

  await showToast({
    style: Toast.Style.Animated,
    title: "Running automation...",
  });

  const result = await runAppleScript(finalScript);
  if (!result.ok) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Automation failed",
      message: result.error,
    });
    return;
  }

  const now = new Date().toISOString();
  await setLastSuccessfulRun({
    script: finalScript,
    explanation: finalExplanation,
    output: result.output,
    runAt: now,
  });
  await touchAutomationRun(automation.id);

  await showToast({
    style: Toast.Style.Success,
    title: "Automation completed",
    message: result.output,
  });
}

function SaveLastRunForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const automation = await saveLastRunAsAutomation(name);
      await showToast({
        style: Toast.Style.Success,
        title: `Saved "${automation.name}"`,
      });
      await onSaved();
      await popToRoot();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save automation.";
      await showToast({
        style: Toast.Style.Failure,
        title: "Save failed",
        message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form
      navigationTitle="Save Last Run"
      isLoading={isSaving}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Automation" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Automation Name"
        placeholder="Morning startup"
        value={name}
        onChange={setName}
      />
    </Form>
  );
}

function RunAutomationForm({
  automation,
  onRan,
}: {
  automation: SavedAutomation;
  onRan: () => Promise<void>;
}) {
  const variableKeys = useMemo(
    () =>
      extractTemplateVariables(
        `${automation.explanation}\n${automation.script}`,
      ),
    [automation],
  );

  const handleSubmit = async (values: Record<string, string>) => {
    const ran = await runAutomation(automation, values);
    if (ran) {
      await onRan();
      await popToRoot();
    }
  };

  return (
    <Form
      navigationTitle={`Run ${automation.name}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Run Automation" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {variableKeys.map((key) => (
        <Form.TextField
          key={key}
          id={key}
          title={key}
          placeholder={`Value for ${key}`}
        />
      ))}
    </Form>
  );
}

export default function SavedAutomationsCommand() {
  const [automations, setAutomations] = useState<SavedAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLastRun, setHasLastRun] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    const [saved, last] = await Promise.all([
      getSavedAutomations(),
      getLastSuccessfulRun(),
    ]);
    setAutomations(saved);
    setHasLastRun(Boolean(last));
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search saved automations..."
    >
      <List.Section
        title="Saved Automations"
        subtitle={String(automations.length)}
      >
        {automations.map((automation) => {
          const variableKeys = extractTemplateVariables(
            `${automation.explanation}\n${automation.script}`,
          );

          return (
            <List.Item
              key={automation.id}
              icon={Icon.Gear}
              title={automation.name}
              subtitle={
                variableKeys.length > 0
                  ? `Variables: ${variableKeys.join(", ")}`
                  : "No variables"
              }
              accessories={[
                { tag: `Updated ${formatDate(automation.updatedAt)}` },
                { text: `Last run: ${formatDate(automation.lastRunAt)}` },
              ]}
              actions={
                <ActionPanel>
                  {variableKeys.length > 0 ? (
                    <Action.Push
                      title="Run Automation"
                      icon={Icon.Play}
                      target={
                        <RunAutomationForm
                          automation={automation}
                          onRan={refresh}
                        />
                      }
                    />
                  ) : (
                    <Action
                      title="Run Automation"
                      icon={Icon.Play}
                      onAction={async () => {
                        await runAutomation(automation, {});
                        await refresh();
                      }}
                    />
                  )}
                  <Action.CopyToClipboard
                    title="Copy Script"
                    content={automation.script}
                  />
                  <Action
                    title="Delete Automation"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={async () => {
                      const approved = await confirmAlert({
                        title: "Delete saved automation?",
                        message: `This will remove "${automation.name}" from Saved Automations.`,
                        primaryAction: {
                          title: "Delete",
                          style: Alert.ActionStyle.Destructive,
                        },
                      });

                      if (!approved) {
                        return;
                      }

                      await deleteSavedAutomation(automation.id);
                      await showToast({
                        style: Toast.Style.Success,
                        title: "Automation deleted",
                      });
                      await refresh();
                    }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      {automations.length === 0 ? (
        <List.EmptyView
          icon={Icon.Stars}
          title="No saved automations"
          description="Run an automation in AI Chat, then save it for one-click reuse."
          actions={
            <ActionPanel>
              <Action.Push
                title="Save Last Run"
                target={<SaveLastRunForm onSaved={refresh} />}
                icon={Icon.Plus}
              />
            </ActionPanel>
          }
        />
      ) : null}

      {automations.length > 0 ? (
        <List.Section title="Actions">
          <List.Item
            title="Save Last Successful Run"
            icon={Icon.Plus}
            subtitle={
              hasLastRun
                ? "Create or update a reusable automation"
                : "Run an automation first"
            }
            actions={
              <ActionPanel>
                {hasLastRun ? (
                  <Action.Push
                    title="Save Last Run"
                    target={<SaveLastRunForm onSaved={refresh} />}
                    icon={Icon.Plus}
                  />
                ) : (
                  <Action
                    title="No Last Run Available"
                    onAction={async () => {
                      await showToast({
                        style: Toast.Style.Failure,
                        title: "Run an automation first",
                      });
                    }}
                  />
                )}
              </ActionPanel>
            }
          />
        </List.Section>
      ) : null}
    </List>
  );
}
