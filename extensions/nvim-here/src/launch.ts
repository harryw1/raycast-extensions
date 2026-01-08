import { showHUD, showToast, Toast } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { homedir } from "os";

const execAsync = promisify(exec);

export default async function main() {
  try {
    // AppleScript to get the current Finder directory
    const appleScript = `
      tell application "Finder"
        if (count of windows) is 0 then
          return POSIX path of (path to desktop folder)
        end if
        try
          set targetPath to (target of front window) as alias
          return POSIX path of targetPath
        on error
          return POSIX path of (path to desktop folder)
        end try
      end tell
    `;

    const { stdout: finderPath } = await execAsync(`osascript -e '${appleScript}'`);
    const trimmedPath = finderPath.trim();

    if (!trimmedPath) {
      await showHUD("Could not determine Finder path");
      return;
    }

    const possiblePaths = [
      "/Applications/kitty.app/Contents/MacOS/kitty",
      `${homedir()}/Applications/kitty.app/Contents/MacOS/kitty`,
      "/opt/homebrew/bin/kitty",
      "/usr/local/bin/kitty",
    ];

    const kittyPath = possiblePaths.find((path) => existsSync(path));

    if (kittyPath) {
      // Launch Kitty via binary directly to allow window grouping
      await execAsync(`"${kittyPath}" --single-instance --directory "${trimmedPath}" nvim . > /dev/null 2>&1 &`);
    } else {
      // Fallback: Launch Kitty with nvim in that directory
      // open -n forces a new instance which ensures arguments are processed
      // --args passes the following arguments to the kitty executable
      await execAsync(`open -n -a kitty --args --directory "${trimmedPath}" nvim .`);
    }

    await showHUD(`Opened nvim in ${trimmedPath.split("/").pop()}`);
  } catch (error) {
    console.error(error);
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to launch nvim",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
