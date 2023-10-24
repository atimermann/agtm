#!/usr/bin/env node

import { getAgtmModulesInfo } from './library/agtm.mjs'
import chalk from 'chalk'
import { table } from 'table'

const installedModules = (await getAgtmModulesInfo())
  .filter(module => module.installed === true)

const tableData = []

tableData.push([
  chalk.bold('Module'),
  chalk.bold('Linked'),
  chalk.bold('Need commit'),
  chalk.bold('Last Version'),
  chalk.bold('Installed Version'),
  chalk.bold('Status')
])

let statusOk = true
for (const module of installedModules) {
  const oldVersion = module.version !== module.instaledVersion

  const warn = module.linked || module.hasChanges || oldVersion

  tableData.push([
    warn ? chalk.red.bold(module.name) : module.name,
    module.linked ? chalk.red.bold('Linked') : 'No',
    module.hasChanges ? chalk.red.bold('YES') : 'No',
    module.lastVersion,
    oldVersion ? chalk.red.bold(module.installedVersion) : module.installedVersion,
    warn ? chalk.red.bold('Check Module!!!') : chalk.green.bold('OK')
  ])

  if (warn) statusOk = false
}

console.log(table(tableData))
console.log(`\nReady for deployment: ${statusOk ? chalk.green.bold('Yes') : chalk.red.bold('NOT!!!')}\n`)
