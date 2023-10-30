/**
 * **Created on 24/10/23**
 *
 * <File Reference Aqui: agtm.mjs>
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { join, resolve } from 'node:path'
import { __dirname, loadJson } from '@agtm/util'
import { access, constants, readdir, stat } from 'node:fs/promises'
import { simpleGit } from 'simple-git'
import { spawn } from '@agtm/util/process'

const agtmModulesDirectoryPath = resolve(__dirname(import.meta.url), '..', '..', '..')

const agtmModules = []
const agtmModulesIndex = {}

await loadAgtmModulesInfo()

/**
 * Returns information about #@agtm modules
 *
 * @returns {Promise<*[]>}
 */
export async function getReport (projectPackageJson) {
  const modulesInfo = []

  const modulesInstalled = await getModulesInstalled(projectPackageJson)
  const linkedModules = await getLinkedModules()

  for (const agtModule of agtmModules) {
    let moduleInfo
    /// ///////////////////////////////////////
    // Carrega informações
    /// ///////////////////////////////////////
    const installed = isAgtmModulesInstalled(projectPackageJson, agtModule.name)
    try {
      moduleInfo = {
        name: agtModule.name,
        directory: agtModule.directory,
        lastVersion: agtModule.version,
        installed,
        installedVersion: installed ? modulesInstalled[agtModule.name]?.version : null,
        hasChanges: agtModule.hasChanges,
        linked: linkedModules.includes(agtModule.name),
        deep: await checkModuleDependencies(agtModule.name, modulesInstalled[agtModule.name])
      }
    } catch (error) {
      console.error(`Diretório inválido ${agtModule}: ${error}`)
      continue
    }
    //
    // // /// ///////////////////////////////////////
    // // // Verfica se é publicável
    // // /// ///////////////////////////////////////
    // // const {
    // //   publishable,
    // //   latestReleaseTag
    // // } = await isModulePublishable(modulePath)
    //
    // // moduleInfo.isPublishable = (publishable === PUBLISHABLE)
    // // moduleInfo.latestReleaseTag = latestReleaseTag
    // // moduleInfo.noTag = (publishable === NO_TAG)
    //
    modulesInfo.push(moduleInfo)
  }

  return modulesInfo
}

/**
 * Returns information about #@agtm modules
 *
 * @returns {Promise<*[]>}
 */
export async function loadAgtmModulesInfo () {
  for (const moduleName of await readdir(agtmModulesDirectoryPath)) {
    const modulePath = join(agtmModulesDirectoryPath, moduleName)
    if ((await stat(modulePath)).isDirectory()) {
      let moduleInfo

      let packageJson
      const packageJsonPath = join(modulePath, 'package.json')

      try {
        await access(packageJsonPath, constants.R_OK | constants.W_OK)
        packageJson = await loadJson(packageJsonPath)
      } catch {
        continue
      }

      /// ///////////////////////////////////////
      // Carrega informações
      /// ///////////////////////////////////////
      try {
        moduleInfo = {
          name: packageJson.name,
          directory: moduleName,
          version: packageJson.version,
          hasChanges: await checkAgtmHasGitChangesToCommit(modulePath)
        }
      } catch (error) {
        console.error(`Diretório inválido ${moduleName}: ${error}`)
        continue
      }

      agtmModulesIndex[packageJson.name] = moduleInfo
      agtmModules.push(moduleInfo)
    }
  }
}

/**
 * Check outdated version of nested dependencies
 *
 * @param moduleName
 * @param moduleInstalledInfo
 * @returns {Promise<*[]>}
 */
async function checkModuleDependencies (moduleName, moduleInstalledInfo) {
  const deepReport = []

  if (moduleInstalledInfo && moduleInstalledInfo.dependencies) {
    const dependencies = moduleInstalledInfo.dependencies

    if (moduleInstalledInfo.dependencies) {
      for (const dependenciesKey in dependencies) {
        if (Object.keys(agtmModulesIndex).includes(dependenciesKey)) {
          const installedVersion = dependencies[dependenciesKey].version
          const lastVersion = agtmModulesIndex[dependenciesKey].version

          if (lastVersion !== installedVersion) {
            deepReport.push(`${dependenciesKey} v${installedVersion}`)
          }

          // Check Next Level
          const nextLevelReport = await checkModuleDependencies(dependenciesKey, dependencies[dependenciesKey])
          for (const nextLevelReportElement of nextLevelReport) {
            deepReport.push(`${dependenciesKey} => ${nextLevelReportElement}`)
          }
        }
      }
    }
  }

  return deepReport
}

/**
 * Checks if the @agtm module is installed in the current project
 *
 * @param projectPackageJson
 * @param moduleName
 * @returns {boolean}
 */
function isAgtmModulesInstalled (projectPackageJson, moduleName) {
  try {
    // Verifica se o módulo está listado como uma dependência no package.json
    return (
      (projectPackageJson.dependencies && projectPackageJson.dependencies[moduleName] !== undefined) ||
      (projectPackageJson.devDependencies && projectPackageJson.devDependencies[moduleName] !== undefined)

    )
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Checks for changes to be committed in the module directory
 * @param modulePath
 * @returns {Promise<boolean>}
 */
async function checkAgtmHasGitChangesToCommit (modulePath) {
  const git = simpleGit(modulePath)
  const status = await git.status(['*'])

  for (const file of status.files) {
    // Se tem outros arquivos para commitar, já marca como has change diretamente
    if (!['package-lock.json', 'package.json'].includes(file.path)) return true

    const git = simpleGit(modulePath)
    const diff = await git.diff(['--unified=0', '--no-color', '--no-prefix', 'package.json'])

    const versionChangeRegex = /^(\+|)\s+"version":\s*"\d+\.\d+\.\d+",$/m

    // Verifica se tem outras alterações além da versão
    if (!versionChangeRegex.test(diff)) return true
  }
  return false
}

/**
 * Returns all modules installed in the current project
 *
 * @param projectPackageJson
 */
async function getModulesInstalled (projectPackageJson) {
  const command = 'npm list --depth 5  --json'

  const { stdout } = await spawn(command, undefined, true)

  const modulesList = JSON.parse(stdout)

  // When it is a workspace agtm, you need to select current module
  if (modulesList.name === 'agtm') {
    return modulesList.dependencies[projectPackageJson.name].dependencies
  }

  return modulesList.dependencies
}

async function getLinkedModules () {
  const command = 'npm list --depth 5 --json --link'

  const { stdout } = await spawn(command, undefined, true)

  const result = JSON.parse(stdout)

  return result.dependencies
    ? Object.keys(result.dependencies)
    : []
}
