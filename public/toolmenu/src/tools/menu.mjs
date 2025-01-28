/* eslint-disable no-undef */

/**
 * A reusable library for creating CLI menus using @clack/prompts.
 * Provides a modular way to generate menus and execute scripts dynamically.
 */

import fs from "fs"
import { spawnSync } from "child_process"
import { join, resolve } from "node:path"
import { spinner, select, isCancel, cancel, intro, outro, log } from "@clack/prompts"
import kleur from "kleur"
import { pathToFileURL } from "url"

export async function mainMenu(menuPath) {
  intro("CLI Menu System")

  log.message("")
  displayProjectInfo()

  log.message("---------------------------------- Main Menu ----------------------------------")

  const options = []

  options.push({
    label: " NPM Scripts",
    value: "N",
  })

  for (const menuItem of await getMenuData(menuPath)) {
    options.push({
      label: ` ${menuItem.label}`,
      value: menuItem,
    })
  }
  options.push({
    label: " Quit",
    value: "Q",
  })

  const choice = await renderMenu(options)

  if (choice === "N") {
    await npmScriptsMenu()
    return
  }

  await generateMenu(menuPath, choice)
}

/**
 * Generates a CLI menu based on the provided configuration.
 * @param {string} basePath - The base directory to scan for menu items.
 */
export async function generateMenu(menuPath, choice) {
  const basePath = join(menuPath, choice.dirName)

  let exit = false
  while (!exit) {
    const s = spinner()
    s.start("Fetching menu...")
    const menuData = await getMenuData(basePath)
    const menuItens = buildMenuItens(menuData)
    s.stop(
      `---------------------------------- ${choice.label} Menu ----------------------------------`,
    )

    if (menuItens.length === 1) {
      log.info("No matching directories found.")
      break
    }

    let success = false
    while (!success) {
      const choice = await renderMenu(menuItens)

      if (choice === "Q") {
        exit = true
        break
      }

      success = runScript(join(basePath, choice), "init.mjs")
    }
  }

  outro("Exiting...")
}

/**
 * Displays project information from package.json.
 */
function displayProjectInfo() {
  const packageJsonPath = resolve(process.cwd(), "package.json")

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

    log.info(kleur.yellow("Project Information:"))
    log.info(`Name: ${kleur.green(packageJson.name || "N/A")}`)
    log.info(`Description: ${kleur.blue(packageJson.description || "No description available.")}`)
    log.info(`Author: ${kleur.magenta(packageJson.author || "Unknown")}`)
    log.info(`License: ${kleur.gray(packageJson.license || "No license specified.")}`)
  } catch (error) {
    log.error("Failed to read package.json:", error.message)
  }
}

/**
 * Retrieves menu items from the directories in the specified path.
 *
 * @param {string} basePath - The base directory to scan.
 *
 * @returns {Promise<Array<{ number: string, label: string, dirName: string }>>} Array of menu items.
 */
async function getMenuData(basePath) {
  const dirents = fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && /^[0-9]{2}_/.test(dirent.name))

  const items = await Promise.all(
    dirents.map(async (dirent) => {
      const dirName = dirent.name
      const number = dirName.slice(0, 2)
      const label = await getMenuLabel(basePath, dirName)

      return {
        number,
        label,
        dirName,
      }
    }),
  )

  return items.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10))
}

/**
 * Retorna menu label, gerado dinamicamento ou apartir do diretório
 *
 * @param basePath
 * @param dirName
 *
 * @returns {Promise<*|string>}
 */
async function getMenuLabel(basePath, dirName) {
  const menuScriptPath = join(basePath, dirName, "menu.mjs")

  if (fs.existsSync(menuScriptPath)) {
    const menuScriptURL = pathToFileURL(menuScriptPath).href
    const { getLabel } = await import(menuScriptURL)
    if (typeof getLabel === "function") {
      return await getLabel()
    }
  }

  return formatLabel(dirName)
}

/**
 * Formats the directory name into a human-readable label.
 *
 * @param {string} dirName - The directory name.
 * @returns {string} The formatted label.
 */
function formatLabel(dirName) {
  return dirName
    .slice(3)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Builds the menu itens for the CLI prompt.
 *
 * @param {Array<{ number: string, label: string, dirName: string }>} items - Menu items.
 * @returns {Array<{ label: string, value: string }>} Array of options for the prompt.
 */
function buildMenuItens(items) {
  const options = items.map((item) => ({
    label: ` ${item.label}`,
    value: item.dirName,
  }))

  options.push({
    label: " Quit",
    value: "Q",
  })

  return options
}

/**
 * Prompts the user to select an option from the menu.
 *
 * @param {Array<{ label: string, value: string }>} options - The menu options.
 *
 * @returns {Promise<string>} The user's choice.
 */
async function renderMenu(options) {
  const choice = await select({
    message: "",
    options,
  })

  if (isCancel(choice)) {
    cancel("Operation cancelled.")
    process.exit(0)
  }

  return choice
}

/**
 * Runs the specified script in the given directory.
 *
 * @param {string} dirPath - The directory containing the script.
 * @param {string} scriptName - The script name to execute.
 *
 * @returns {boolean}
 */
function runScript(dirPath, scriptName) {
  const scriptPath = join(dirPath, scriptName)

  if (!fs.existsSync(scriptPath)) {
    log.error(`${scriptName} not found in ${scriptPath}`)
    return false
  }

  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
  })

  if (result.error) {
    log.error(`Error executing ${scriptPath}:`, result.error.message)
    return false
  }

  if (result.status !== 0) {
    log.error(`Script ${scriptPath} exited with code ${result.status}`)
    return false
  }

  return true
}


/**
 * Generates a menu based on the scripts in package.json.
 */
export async function npmScriptsMenu() {
  const packageJsonPath = "./package.json";

  log.info(`---------------------------------- NPM Scripts Menu ----------------------------------`)

  try {
    // Read and parse package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
      log.error("No scripts found in package.json.");
      return;
    }

    // Build menu options from scripts
    const scriptOptions = Object.keys(packageJson.scripts).map((script) => ({
      label: `${kleur.green(script)}`,
      value: script,
    }));

    scriptOptions.push({
      label: kleur.red("Quit"),
      value: "quit",
    });

    // Prompt user to select a script
    const choice = await select({
      message: "Select a script to run:",
      options: scriptOptions,
    });

    if (isCancel(choice)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    if (choice === "quit") {
      log.message("Exiting...");
      return;
    }

    // Execute the selected script using npm run
    runNpmScript(choice);
  } catch (error) {
    log.error(`Failed to read package.json: ${error.message}`);
  }
}



/**
 * Executes an npm script.
 *
 * @param {string} script - The script to execute.
 */
function runNpmScript(script) {
  log.message(`Running ${kleur.green(script)}...`);

  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
  });

  if (result.error) {
    log.error(`Failed to execute script: ${result.error.message}`);
    return;
  }

  if (result.status !== 0) {
    log.error(`Script exited with code ${result.status}`);
  } else {
    log.message(kleur.green(`Script ${script} executed successfully.`));
  }
}
