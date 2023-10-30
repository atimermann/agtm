#!/usr/bin/env node

import { spawn } from '@agtm/util/process'
import { getReport } from './library/agtm.mjs'
import { loadJson } from '@agtm/util'

const projectPackageJson = await loadJson('package.json')
const installedModules = (await getReport(projectPackageJson))
  .filter(module => module.installed === true)
  .map(module => `"${module.name}"`)
  .join(' ')

console.log('Creating links...')
await spawn(`npm link ${installedModules}`)
await spawn('ls -l node_modules/@agtm')
