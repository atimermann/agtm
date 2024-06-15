#!/usr/bin/env node

import { spawn } from '@agtm/util/process'
import { getReport } from './library/agtm.mjs'
import { loadJson } from '@agtm/util'

const projectPackageJson = await loadJson('package.json')
const installedModules = (await getReport(projectPackageJson))
  .filter(module => (module.installed === true && module.lastVersion !== module.installedVersion) || module.linked)
  .map(module => `"${module.name}@${module.lastVersion}"`)
  .join(' ')

if (installedModules) {
  console.log('Updating the following packages: ', installedModules)
  spawn(`npm install ${installedModules}`)
} else {
  console.log('Packages are already in the latest version.')
}
