/**
 * **Created on 11/12/18**
 *
 * library/tool.js
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 *   Conjunto de funções auxiliares
 */
import { dirname, join } from 'node:path'
import fs from 'fs-extra'
import packageJsonFinder from 'find-package-json'
import { readFile, writeFile } from 'node:fs/promises'

process.env.SUPPRESS_NO_CONFIG_WARNING = true
process.env.LOGGER_CONSOLE_ENABLED = false

/**
 * Procura pela raiz do projeto, procurando pelo pacjage.json
 *
 * @return {Promise<string>}
 */
export async function findRootPath () {
  try {
    return dirname(await packageJsonFinder(process.cwd())
      .next().filename)
  } catch (err) {
    throw new Error('Invalid Project: Could not find project root directory (where package.json is).')
  }
}

/**
 * Valida se o projeto no diretório especificado é válido
 *
 * @param            srcPath  {string}  Diretório raiz do projeto (onde se encontra o package.json)
 *
 * @return {boolean}
 */
export async function validateProject (srcPath) {
  const { Application } = await import('@agtm/node-framework')

  const mainFilePathCommonJs = join(srcPath, 'main.js')
  const mainFilePathESM = join(srcPath, 'main.mjs')
  let mainFilePath

  if (await fs.pathExists(mainFilePathCommonJs)) {
    mainFilePath = mainFilePathCommonJs
  } else if (await fs.pathExists(mainFilePathESM)) {
    mainFilePath = mainFilePathESM
  } else {
    throw new Error('Invalid project: main.js file does not exist')
  }

  const applicationLoader = (await import(mainFilePath)).default
  const project = applicationLoader(Application)

  const { name, path, applications, uuid } = project

  if (name === undefined || path === undefined || applications === undefined || uuid === undefined) {
    throw new Error('Invalid project: Check if main.mjs is returning instance of @agtm/node-framework/instance')
  }
}

/**
 * Abre um arquivo template, altera variaveis e salva novamente
 *
 * @param                  file    {string}  Arquivo à ser editado
 * @param                  locals  {object}  Dicionario com a lista de bustituição
 *
 * @return {Promise<void>}
 */
export async function render (file, locals) {
  let content = (await fs.readFile(file)).toString()

  for (const [key, value] of Object.entries(locals)) {
    content = content.split(`{{${key}}}`).join(value)
  }

  await fs.writeFile(file, content)
}

/**
 *
 * @param packageJsonPath
 * @param scriptsToAdd
 */
export async function addScriptToPackageJson (packageJsonPath, scriptsToAdd) {
  try {
    const data = await readFile(packageJsonPath, 'utf8')
    const packageJson = JSON.parse(data)

    packageJson.scripts = packageJson.scripts || {}

    for (const [key, value] of Object.entries(scriptsToAdd)) {
      packageJson.scripts[key] = value
    }
    const updatedPackageJson = JSON.stringify(packageJson, null, 2)
    await writeFile(packageJsonPath, updatedPackageJson, 'utf8')
  } catch (err) {
    console.error('Erro ao modificar o package.json:', err)
  }
}
