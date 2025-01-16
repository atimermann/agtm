/* eslint-disable no-undef */

/**
 * A reusable library for creating CLI menus using @clack/prompts.
 *
 * Provides a modular way to generate menus and execute scripts dynamically.
 */

import fs from "fs";
import { spawnSync } from "child_process";
import { join, resolve } from "node:path";
import { spinner, select, isCancel, cancel, intro, outro, log } from "@clack/prompts";
import kleur from "kleur";

/**
 * Generates a CLI menu based on the provided configuration.
 * @param {string} basePath - The base directory to scan for menu items.
 * @param {Function} getLabel - Function to fetch custom labels for menu items.
 */
export async function generateMenu(basePath, getLabel) {
  intro("CLI Menu");
  log.message("---------------------------------- System Menu ----------------------------------");
  log.message("");
  displayProjectInfo();

  while (true) {
    const s = spinner();
    s.start("Fetching menu...");
    const allItems = await getMenuItems(basePath,  getLabel);
    const options = buildMenuOptions(allItems);
    s.stop("---------------------------------- Menu ----------------------------------");

    if (options.length === 1) {
      console.log("No matching directories found.");
      break;
    }

    const choice = await promptUserSelection(options);

    if (choice === "Q") {
      break;
    }

    runScript(join(basePath, choice), "init.mjs");
  }

  outro("Exiting...");
}

/**
 * Displays project information from package.json.
 */
function displayProjectInfo() {
  const packageJsonPath = resolve(process.cwd(), "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    log.info(kleur.yellow("Project Information:"));
    log.info(`Name: ${kleur.green(packageJson.name || "N/A")}`);
    log.info(`Description: ${kleur.blue(packageJson.description || "No description available.")}`);
    log.info(`Author: ${kleur.magenta(packageJson.author || "Unknown")}`);
    log.info(`License: ${kleur.gray(packageJson.license || "No license specified.")}`);
  } catch (error) {
    log.error("Failed to read package.json:", error.message);
  }
}

/**
 * Retrieves menu items from the directories in the specified path.
 * @param {string} basePath - The base directory to scan.
 * @param {Function} formatLabel - Function to format directory names into menu labels.
 * @param {Function} getLabel - Function to fetch custom labels for menu items.
 * @returns {Promise<Array<{ number: string, label: string, dirName: string }>>} Array of menu items.
 */
async function getMenuItems(basePath, getLabel) {
  const dirents = fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && /^[0-9]{2}_/.test(dirent.name));

  const items = await Promise.all(
    dirents.map(async (dirent) => {
      const dirName = dirent.name;
      const number = dirName.slice(0, 2);
      const label = (await getLabel(join(basePath, dirName))) || formatLabel(dirName);

      return {
        number,
        label,
        dirName,
      };
    })
  );

  return items.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
}

/**
 * Formats the directory name into a human-readable label.
 * @param {string} dirName - The directory name.
 * @returns {string} The formatted label.
 */
function formatLabel(dirName) {
  return dirName
    .slice(3)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Builds the menu options for the CLI prompt.
 * @param {Array<{ number: string, label: string, dirName: string }>} items - Menu items.
 * @returns {Array<{ label: string, value: string }>} Array of options for the prompt.
 */
function buildMenuOptions(items) {
  const options = items.map((item) => ({
    label: ` ${item.label}`,
    value: item.dirName,
  }));

  options.push({
    label: " Quit",
    value: "Q",
  });

  return options;
}

/**
 * Prompts the user to select an option from the menu.
 * @param {Array<{ label: string, value: string }>} options - The menu options.
 * @returns {Promise<string>} The user's choice.
 */
async function promptUserSelection(options) {
  const choice = await select({
    message: "Select an option:",
    options,
  });

  if (isCancel(choice)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return choice;
}

/**
 * Runs the specified script in the given directory.
 * @param {string} dirPath - The directory containing the script.
 * @param {string} scriptName - The script name to execute.
 */
function runScript(dirPath, scriptName) {
  const scriptPath = join(dirPath, scriptName);

  if (!fs.existsSync(scriptPath)) {
    console.log(`${scriptName} not found in ${scriptPath}`);
    return;
  }

  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Error executing ${scriptPath}:`, result.error.message);
  } else if (result.status !== 0) {
    console.error(`Script ${scriptPath} exited with code ${result.status}`);
  }
}
