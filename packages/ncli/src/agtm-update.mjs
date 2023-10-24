#!/usr/bin/env node

import { spawn } from '@agtm/util/process'
import { getAgtmModulesInfo } from './library/agtm.mjs'

const installedModules = (await getAgtmModulesInfo())
  .filter(module => module.installed === true && module.lastVersion !== module.installedVersion)
  .map(module => `"${module.name}@${module.lastVersion}"`)
  .join(' ')

if (installedModules) {
  console.log('Updating the following packages: ', installedModules)
  spawn(`npm install ${installedModules}`)
} else {
  console.log('Packages are already in the latest version.')
}
