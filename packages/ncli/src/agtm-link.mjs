#!/usr/bin/env node

import { spawn } from '@agtm/util/process'
import { getAgtmModulesInfo } from './library/agtm.mjs'

const installedModules = (await getAgtmModulesInfo())
  .filter(module => module.installed === true)
  .map(module => `"${module.name}"`)
  .join(' ')

console.log('Creating links...')
await spawn(`npm link ${installedModules}`)
await spawn('ls -l node_modules/@agtm')
