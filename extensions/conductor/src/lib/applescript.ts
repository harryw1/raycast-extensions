import { execFile } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import { unlink, writeFile } from "fs/promises";

const execFileAsync = promisify(execFile);

export type ScriptRunResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

/**
 * Executes AppleScript through a temporary file to support multiline scripts.
 */
export async function runAppleScript(script: string): Promise<ScriptRunResult> {
  const randomId = Math.random().toString(36).substring(2, 10);
  const tmpFile = join(
    tmpdir(),
    `raycast_as_${Date.now()}_${randomId}.applescript`,
  );

  try {
    await writeFile(tmpFile, script, "utf8");
    const { stdout } = await execFileAsync("osascript", [tmpFile], {
      encoding: "utf8",
      timeout: 30_000,
    });

    return {
      ok: true,
      output:
        stdout.trim() || "(Script executed successfully — no output returned)",
    };
  } catch (err: unknown) {
    const error = err as {
      stderr?: string | Buffer;
      message?: string;
    };

    const stderr =
      typeof error.stderr === "string"
        ? error.stderr
        : error.stderr?.toString("utf8");
    return {
      ok: false,
      error: stderr?.trim() || error.message || "Unknown error",
    };
  } finally {
    try {
      await unlink(tmpFile);
    } catch {
      // Ignore cleanup failures.
    }
  }
}
