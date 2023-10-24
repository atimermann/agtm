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

const projectPackageJson = await loadJson('package.json')

/**
 * Returns information about #@agtm modules
 *
 * @returns {Promise<*[]>}
 */
export async function getAgtmModulesInfo () {
  const modulesInfo = []

  const agtmModulesDirectoryPath = resolve(__dirname(import.meta.url), '..', '..', '..')

  const modulesInstalledVersion = await getModulesInstalledVersion()
  const linkedModules = await getLinkedModules()

  for (const moduleName of await readdir(agtmModulesDirectoryPath)) {
    const modulePath = join(agtmModulesDirectoryPath, moduleName)
    if ((await stat(modulePath)).isDirectory()) {
      let moduleInfo

      let packageJson

      try {
        const packageJsonPath = join(modulePath, 'package.json')
        await access(packageJsonPath, constants.R_OK | constants.W_OK)
        packageJson = await loadJson(packageJsonPath)
      } catch {
        continue
      }

      /// ///////////////////////////////////////
      // Carrega informações
      /// ///////////////////////////////////////
      const installed = isAgtmModulesInstalled(packageJson.name)
      try {
        moduleInfo = {
          name: packageJson.name,
          directory: moduleName,
          lastVersion: packageJson.version,
          installed,
          installedVersion: installed ? modulesInstalledVersion[packageJson.name].version : null,
          hasChanges: await checkAgtmHasGitChangesToCommit(modulePath),
          linked: linkedModules.includes(packageJson.name)
        }
      } catch (error) {
        console.error(`Diretório inválido ${moduleName}: ${error}`)
        continue
      }

      // /// ///////////////////////////////////////
      // // Verfica se é publicável
      // /// ///////////////////////////////////////
      // const {
      //   publishable,
      //   latestReleaseTag
      // } = await isModulePublishable(modulePath)

      // moduleInfo.isPublishable = (publishable === PUBLISHABLE)
      // moduleInfo.latestReleaseTag = latestReleaseTag
      // moduleInfo.noTag = (publishable === NO_TAG)

      modulesInfo.push(moduleInfo)
    }
  }

  return modulesInfo
}

/**
 * Checks if the @agtm module is installed in the current project
 *
 * @param moduleName
 * @returns {boolean}
 */
function isAgtmModulesInstalled (moduleName) {
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
 * @returns {Promise<*>}
 */
async function getModulesInstalledVersion () {
  const command = 'npm list --depth 0  --json'

  const { stdout } = await spawn(command, undefined, true)
  return JSON.parse(stdout).dependencies
}

async function getLinkedModules () {
  const command = 'npm list --depth 0 --json --link'

  const { stdout } = await spawn(command, undefined, true)

  const result = JSON.parse(stdout)

  return result.dependencies
    ? Object.keys(result.dependencies)
    : []
}
