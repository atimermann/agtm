/* eslint-disable no-undef */

import { spawnSync } from 'child_process'
import { select, confirm, intro,  log, isCancel, cancel } from '@clack/prompts'
import kleur from 'kleur'
import { getCurrentVersion } from '../../../src/tools/index.mjs'

log.message(`---------------------------------- Generating New Version ----------------------------------`)

/**
 * Main function to orchestrate the version update process.
 */
async function generateNewVersion () {
  const currentVersion = getCurrentVersion()

  intro(kleur.cyan('Generate New Version'))
  log.message(`Current version: ${kleur.bold().blue(currentVersion)}`)

  const options = generateVersionOptions()

  const versionType = await selectVersionType(options)
  await confirmVersionUpdate(versionType)
  executeVersionUpdate(versionType)
  const newVersion = getCurrentVersion()
  createGitTag(newVersion)

  log.success(kleur.bold().green(`Version updated successfully.`))
}

/**
 * Generates version update options.
 * @returns {Array<{ label: string, value: string }>} Array of version update options.
 */
function generateVersionOptions () {
  return [
    {
      label: `${kleur.green('Patch')} ${kleur.gray('(Fixes, small updates)')}`,
      value: 'patch',
    },
    {
      label: `${kleur.blue('Minor')} ${kleur.gray('(Features, non-breaking changes)')}`,
      value: 'minor',
    },
    {
      label: `${kleur.red('Major')} ${kleur.gray('(Breaking changes)')}`,
      value: 'major',
    },
  ]
}

/**
 * Prompts the user to select a version type.
 * @param {Array<{ label: string, value: string }>} options - Version options to select from.
 * @returns {Promise<string>} The selected version type.
 */
async function selectVersionType (options) {
  const versionType = await select({
    message: 'Select the type of version update:',
    options,
  })

  if (isCancel(versionType)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return versionType
}

/**
 * Confirms the user's choice before proceeding.
 * @param {string} versionType - The selected version type.
 * @returns {Promise<void>} Resolves if confirmed, exits otherwise.
 */
async function confirmVersionUpdate (versionType) {
  const confirmed = await confirm({
    message: `Are you sure you want to generate a new version of type ${versionType}?`
  })

  if (isCancel(confirmed) || !confirmed) {
    cancel('Version update cancelled.')
    process.exit(0)
  }
}

/**
 * Executes the npm version command to update the version.
 * @param {string} versionType - The selected version type.
 */
function executeVersionUpdate (versionType) {
  log.info(`Running: npm version ${versionType}`)

  const result = spawnSync('npm', ['version', versionType], {
    stdio: 'inherit',
  })

  if (result.error) {
    log.error(`Error executing npm version: ${result.error.message}`)
    process.exit(1)
  }

  log.success(`npm version ${versionType} executed successfully.`)
}

/**
 * Creates a new git tag for the updated version.
 * @param {string} version - The new version.
 */
function createGitTag (version) {
  log.info(`Creating git tag for version: ${version}`)

  const result = spawnSync('git', ['tag', version], {
    stdio: 'inherit',
  })

  if (result.error) {
    log.error(`Error creating git tag: ${result.error.message}`)
    process.exit(1)
  }

  const pushResult = spawnSync('git', ['push', 'origin', version], {
    stdio: 'inherit',
  })

  if (pushResult.error) {
    log.error(`Error pushing git tag: ${pushResult.error.message}`)
    process.exit(1)
  }

  log.success(`Git tag ${version} created and pushed successfully.`)
}

// Execute the script
await generateNewVersion()
