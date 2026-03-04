import { LocalStorage } from "@raycast/api";

const SAVED_AUTOMATIONS_KEY = "saved-automations-v1";
const LAST_RUN_KEY = "last-successful-run-v1";
const MAX_AUTOMATIONS = 100;

export type LastSuccessfulRun = {
  script: string;
  explanation: string;
  output: string;
  runAt: string;
};

export type SavedAutomation = {
  id: string;
  name: string;
  script: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
};

export function interpolateTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /{{\s*([a-zA-Z0-9_-]+)\s*}}/g,
    (_, key: string) => values[key] ?? "",
  );
}

export function extractTemplateVariables(template: string): string[] {
  const matches = template.matchAll(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g);
  const vars = new Set<string>();

  for (const match of matches) {
    vars.add(match[1]);
  }

  return Array.from(vars);
}

export async function getSavedAutomations(): Promise<SavedAutomation[]> {
  const raw = await LocalStorage.getItem<string>(SAVED_AUTOMATIONS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SavedAutomation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setSavedAutomations(
  automations: SavedAutomation[],
): Promise<void> {
  await LocalStorage.setItem(
    SAVED_AUTOMATIONS_KEY,
    JSON.stringify(automations.slice(0, MAX_AUTOMATIONS)),
  );
}

export async function upsertSavedAutomation(
  automation: SavedAutomation,
): Promise<void> {
  const existing = await getSavedAutomations();
  const next = [
    automation,
    ...existing.filter((item) => item.id !== automation.id),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  await setSavedAutomations(next);
}

export async function deleteSavedAutomation(id: string): Promise<void> {
  const existing = await getSavedAutomations();
  await setSavedAutomations(existing.filter((item) => item.id !== id));
}

export async function getLastSuccessfulRun(): Promise<LastSuccessfulRun | null> {
  const raw = await LocalStorage.getItem<string>(LAST_RUN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as LastSuccessfulRun;
    if (!parsed.script || !parsed.explanation) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setLastSuccessfulRun(
  lastRun: LastSuccessfulRun,
): Promise<void> {
  await LocalStorage.setItem(LAST_RUN_KEY, JSON.stringify(lastRun));
}

export async function touchAutomationRun(id: string): Promise<void> {
  const existing = await getSavedAutomations();
  const now = new Date().toISOString();

  const next = existing
    .map((item) =>
      item.id === id ? { ...item, lastRunAt: now, updatedAt: now } : item,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  await setSavedAutomations(next);
}

export function createAutomationId(): string {
  return `auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveLastRunAsAutomation(
  name: string,
): Promise<SavedAutomation> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Name cannot be empty.");
  }

  const lastRun = await getLastSuccessfulRun();
  if (!lastRun) {
    throw new Error("No successful script run found yet.");
  }

  const existing = await getSavedAutomations();
  const now = new Date().toISOString();
  const existingByName = existing.find(
    (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  const automation: SavedAutomation = {
    id: existingByName?.id ?? createAutomationId(),
    name: trimmedName,
    script: lastRun.script,
    explanation: lastRun.explanation,
    createdAt: existingByName?.createdAt ?? now,
    updatedAt: now,
    lastRunAt: lastRun.runAt,
  };

  await upsertSavedAutomation(automation);
  return automation;
}
