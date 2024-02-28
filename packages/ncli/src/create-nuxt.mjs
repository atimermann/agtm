#!/usr/bin/env node
import inquirer from 'inquirer'
import semver from 'semver'
import { spawn, iSpawn } from '@agtm/util/process'
import {unlink, readdir, copyFile, appendFile} from 'node:fs/promises'
import fsExtra from 'fs-extra'
import { join } from 'node:path'
import { __dirname } from '@agtm/util'
import { paramCase } from 'change-case'
import { render } from './library/tool.mjs'
/**
 * **Created on 17/02/24**
 *
 * @file packages/ncli/src/create-nuxt.mjs *
 *  Cria novo projeto Nuxt instalando o layer NuxtLayerAdminlitePrimeface
 * @author André Timermann <andre@timermann.com.br>
 */

export default {}

try {
  const DIRNAME = __dirname(import.meta.url)
  const templateNuxtPath = join(DIRNAME, './template/nuxt')

  /// //////////////////// /////////// VERIFICAÇÂO DE INCOMPATIBILIDADE ////////////////////////////////////////////////
  const npmVersion = (await spawn('npm --version', undefined, true)).stdout.split('\n')[0]

  console.log(`Versão do NUXT: ${npmVersion}`)
  if (semver.gte(npmVersion, '10.4.0')) {
    console.log('Nuxt incompátivel com npm versão 10.4.0. Faça downgrade para versão 10.3.0: \n\n\tnpm install -g npm@10.3\n')
    console.log('Se estiver utilizando uma versão superior a "1.4.0", tente instalar o nuxt diretamente ' +
      'com "npx nuxi@latest initl". Se o npm install funcionar, altere aqui para bloquear apenas a versão 1.4 e ' +
      'liberar versões superiores,')
    console.log('REF: https://github.com/parcel-bundler/watcher/issues/156')
    process.exit(1)
  }
  /// //////////////////// /////////// VERIFICAÇÂO DE INCOMPATIBILIDADE ////////////////////////////////////////////////


  console.log(`Script testado com Nuxt versão nuxi@3.10.2. Se der problema e estiver com pressa utilize essa versão!`)


  const questions = [
    {
      name: 'name',
      message: 'Project name?',
      validate: input => input.match(/^[a-zA-Z0-9-]+$/) ? true : 'Nome deve contar apenas caracteres simples (a-Z 0-9)'
    }, {
      name: 'description', message: 'Descrição do projeto:', validate: input => input !== ''
    }, {
      name: 'author', message: 'Seu nome:', validate: input => input !== ''
    }, {
      name: 'mail',
      message: 'Please provide a valid email',
      validate: input => input.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/) ? true : 'Informe um e-mail válido'
    },
    {
      name: 'registry',
      message: 'Endereço do registro docker.',
      default: 'registry.crontech.com.br:5000'
    }
  ]

  const answers = await inquirer.prompt(questions)

  const projectFolderName = paramCase(answers.name)
  const rootPath = join(process.cwd(), projectFolderName)
  // const srcPath = join(rootPath, 'src')

  console.log('--------------------------------------------------------------------------------------------------------')
  console.log(`Creating project "${answers.name}"...`)
  console.log('--------------------------------------------------------------------------------------------------------')
  await iSpawn(`npx nuxi@latest init "${answers.name}"`)

  const packageJSON = (
    await import(
      join(rootPath, 'package.json'),
      { assert: { type: 'json' } }
    )
  ).default

  console.log('--------------------------------------------------------------------------------------------------------')
  console.log('Configuring project...')
  console.log('--------------------------------------------------------------------------------------------------------')
  await unlink(join(rootPath, 'app.vue'))
  await unlink(join(rootPath, 'public'))

  const entries = await readdir(templateNuxtPath, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(templateNuxtPath, entry.name)
    const destPath = join(rootPath, entry.name)

    if (entry.isDirectory()) {
      console.log(`Copyng directory ${entry.name} ...`)
      await fsExtra.copy(srcPath, destPath)
    } else {
      console.log(`Copyng file ${entry.name} ...`)
      await copyFile(srcPath, destPath)
    }
  }

  await render(join(rootPath, 'package.json'), {
    PACKAGE_NAME: answers.name,
    PACKAGE_DESCRIPTION: answers.description,
    PACKAGE_AUTHOR: `${answers.author} <${answers.mail}>`,
    PACKAGE_NUXT_VERSION: packageJSON.dependencies.nuxt,
    PACKAGE_VUE_VERSION: packageJSON.dependencies.vue,
    PACKAGE_VUE_ROUTER_VERSION: packageJSON.dependencies['vue-router']
  })

  // Configure .env
  console.log('Editing .env ...')
  await appendFile(join(rootPath, '.env'), '\n')
  await appendFile(join(rootPath, '.env'), '# Docker build\n')
  await appendFile(join(rootPath, '.env'), `BUILD_IMAGE_NAME=${answers.name}\n`)
  await appendFile(join(rootPath, '.env'), `BUILD_REGISTRY_ADDRESS=${answers.registry}\n`)

  console.log('--------------------------------------------------------------------------------------------------------')
  console.log('Installing Nuxt Layer AdminLTE Primefaces...')
  console.log('--------------------------------------------------------------------------------------------------------')
  await iSpawn(`cd "${answers.name}" && npm i -f pinia @pinia/nuxt`)
  await iSpawn(`cd "${answers.name}" && npm i @pinia-plugin-persistedstate/nuxt`)
  await iSpawn(`cd "${answers.name}" && npm i primevue`)
  await iSpawn(`cd "${answers.name}" && npm i @agtm/nuxt-layer-adminlte-primeface`)

  console.log('--------------------------------------------------------------------------------------------------------')
  console.log('Installing development dependencies...')
  console.log('--------------------------------------------------------------------------------------------------------')
  await iSpawn(`cd "${answers.name}" && npm i -D @babel/preset-env @nuxtjs/eslint-config babel-jest babel-plugin-module-resolver eslint eslint-config-standard eslint-config-tjw-jsdoc eslint-plugin-jest jest dotenv-cli`)
} catch (e) {
  console.error(e.message)
  console.error(e.stack)
  process.exit()
}
