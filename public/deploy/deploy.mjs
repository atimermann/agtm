#!/usr/bin/env node
/* eslint-disable no-undef */

import { fileURLToPath, pathToFileURL } from 'url';
import { generateMenu } from "./src/tools/menu.mjs"
import { join, dirname } from "node:path"
import fs from "fs"

const DEPLOY_PATH = join(dirname(fileURLToPath(import.meta.url)), 'src')

await generateMenu(DEPLOY_PATH, async (dirPath) => {

  const menuScriptPath = join(dirPath, "menu.mjs")

  if (fs.existsSync(menuScriptPath)) {
    const menuScriptURL = pathToFileURL(menuScriptPath).href
    const { getLabel } = await import(menuScriptURL)
    if (typeof getLabel === "function") {
      return await getLabel()
    }
  }

  return null
})
