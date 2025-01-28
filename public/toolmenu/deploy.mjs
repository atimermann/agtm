#!/usr/bin/env node
/* eslint-disable no-undef */

import { fileURLToPath } from "url"
import {  mainMenu } from "./src/tools/menu.mjs"
import { join, dirname } from "node:path"

const MENU_PATH = join(dirname(fileURLToPath(import.meta.url)), "menus")

await mainMenu(MENU_PATH)
