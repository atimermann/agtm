#!/usr/bin/env node
/**
 * **Created on 06/12/18**
 *
 * bin/sindri-create.js
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 *  Cria novo projeto Sindri Framework basado em um template
 *  Importante Manter atualizado sempre que realizar alteração no sindri framework
 *  Manter controle sobre a versão compatível com Sindri Framework, validando.
 *
 *  TODO: Melhorar template README.md
 */

import program from 'commander'
import fs from 'fs-extra'
import { appendFile, copyFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import inquirer from 'inquirer'
import moment from 'moment'
import { render, addScriptToPackageJson } from './library/tool.mjs'
import { __dirname } from '@agtm/util'
import { spawn } from '@agtm/util/process'
import semver from 'semver'
import { paramCase } from 'change-case'

// TODO: centralizar no Node-framework
const CONTROLLER_TYPES = ['http', 'jobs', 'core', 'socket']

program
  .description('Cria um novo projeto pré configurado com o @agtm/node-framework')
  .parse(process.argv);

(async () => {
  try {
    moment.locale('pt-br')

    const DIRNAME = __dirname(import.meta.url)
    // const INSTALL_DEPENDENCIES_SCRIPT = join(DIRNAME, '../scripts/install_dependencies.sh')

    // Atualizar sempre que mudar a versão do node no PKG
    // Atualizar versão no pkg no script
    // const NPM_BUILD_COMMAND = 'npx pkg -t node14-linux-x64 --out-path build . && (cd build && mkdir -p config) && cp config/default.yaml build/config'

    /// /////////////////////////////////////////////////////////
    // Valida NODEJS Version
    // Sempre atualizar com a ultima versão do node disponível no PKG e configurado no @agtm/node-framework
    /// /////////////////////////////////////////////////////////

    if (semver.lt(process.version, '20.0.0')) {
      console.error('Required version of nodejs greater than 20')
      process.exit(2)
    }

    // TODO: verificar ao atualizar o node-pkg
    //  Verifique ultima versão disponível em ~/.pkg-cache. Teste novas versões
    // if (semver.gtr(process.version, '20')) {
    //   console.warn('WARN: If you wanted to compile a project using "node-pkg", remember that it will be compiled with the latest version available for "node-pkg", which is currently 18.5.0 LTS')
    // }

    const templatePath = join(DIRNAME, './template/project')
    const templatePrismaPath = join(DIRNAME, './template/prisma')

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Questionários
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// //////////////////////////////////////////////
    // Project
    /// //////////////////////////////////////////////
    const answers = await inquirer.prompt([
      {
        name: 'name',
        message: 'Nome do projeto?',
        validate: input => input.match(/^[a-zA-Z0-9-]+$/) ? true : 'Nome deve contar apenas caracteres simples (a-Z 0-9)'
      },
      {
        name: 'description', message: 'Descrição do projeto:', validate: input => input !== ''
      },
      {
        name: 'author', message: 'Seu nome:', validate: input => input !== ''
      },
      {
        name: 'mail',
        message: 'Informe um e-mail válido',
        validate: input => input.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/) ? true : 'Informe um e-mail válido'
      },
      {
        name: 'app',
        message: 'Você precisa criar pelo menos um app para este projeto, selecione um nome:',
        default: 'main',
        validate: input => input.match(/^[a-zA-Z0-9-]+$/) ? true : 'Nome deve contar apenas caracteres simples (a-Z 0-9)'
      },
      {
        name: 'registry',
        message: 'Endereço do registro docker.',
        default: 'registry.crontech.com.br:5000'
      }
    ])

    /// //////////////////////////////////////////////
    // PRISMA
    /// //////////////////////////////////////////////
    const { addPrisma } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addPrisma',
        message: 'Do you want to add Prisma support to your project?'
      }
    ])

    let prismaAnswers
    if (addPrisma) {
      prismaAnswers = await inquirer.prompt([
        // https://www.prisma.io/docs/orm/reference/prisma-schema-reference#datasource
        {
          type: 'list',
          name: 'PRISMA_PROVIDER',
          message: 'Database provider:',
          choices: [
            'postgresql',
            'mysql',
            'sqlite',
            'sqlserver',
            'mongodb',
            'cockroachdb'
          ]
        },
        { type: 'input', name: 'PRISMA_HOST', message: 'Database host (e.g., localhost):' },
        {
          type: 'input',
          name: 'PRISMA_PORT',
          message: 'Database port:',
          validate: input => {
            const port = parseInt(input, 10)
            if (isNaN(port)) {
              return 'Please enter a numeric value for the database port.'
            }
            return true
          }
        },
        { type: 'input', name: 'PRISMA_DATABASE', message: 'Database name:' },
        { type: 'input', name: 'PRISMA_USERNAME', message: 'Database username:' },
        { type: 'input', name: 'PRISMA_PASSWORD', message: 'Database password:', mask: '*' },
        { type: 'input', name: 'PRISMA_OPTIONS', message: 'Database options (leave blank if none, ex: schema=public):' }
      ])
    }

    console.log('Check the answers entered:\n')
    for (const [key, value] of Object.entries(answers)) {
      console.log(`  ${key}:  ${value}`)
    }

    console.log('\nPRISMA:')
    for (const [key, value] of Object.entries(prismaAnswers)) {
      if (key === 'PRISMA_PASSWORD') {
        console.log(`  ${key}:  ********`)
        continue
      }
      console.log(`  ${key}:  ${value}`)
    }

    if (!(await inquirer.prompt({
      name: 'confirm', type: 'confirm', default: true, message: 'Continuar?'
    })).confirm) {
      process.exit()
    }

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Cria diretório
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const projectFolderName = paramCase(answers.name)
    const rootPath = join(process.cwd(), projectFolderName)
    const srcPath = join(rootPath, 'src')

    if (fs.existsSync(rootPath)) {
      console.error(`Diretório "${rootPath}" já existe.`)
      process.exit()
    }

    fs.mkdirSync(rootPath)

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Copia Template
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log('--------------------------------------------------------------------------------------------------------')
    console.log(`Creating project in ${rootPath}`)
    console.log('--------------------------------------------------------------------------------------------------------')
    await fs.copy(templatePath, rootPath)
    // TODO: NÃO ESTÁ COPIANDO ARQUIVOS ocultos .env e .gitignore)
    // Utilizar outra lib ex https://www.npmjs.com/package/ncp

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Altera Arquivos
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// /// package.json //////
    await render(join(rootPath, 'package.json'), {
      PACKAGE_NAME: answers.name,
      PACKAGE_DESCRIPTION: answers.description,
      PACKAGE_AUTHOR: `${answers.author} <${answers.mail}>`,
      PACKAGE_VERSION: answers.version,
      PACKAGE_MAIN: 'src/run.mjs'
      // PACKAGE_BUILD: NPM_BUILD_COMMAND
    })

    /// /// main.mjs //////
    await render(join(srcPath, 'main.mjs'), {
      CREATED_DATE: moment().format('L'),
      NAME: answers.name.replace(/-/g, '_'),
      DESCRIPTION: answers.description,
      AUTHOR: `${answers.author} <${answers.mail}>`,
      MAIN: 'main.mjs'
    })

    /// /// run.mjs //////
    await render(join(srcPath, 'run.mjs'), {
      CREATED_DATE: moment().format('L'),
      NAME: answers.name.replace(/-/g, '_'),
      DESCRIPTION: answers.description,
      AUTHOR: `${answers.author} <${answers.mail}>`,
      MAIN: 'run.mjs'
    })

    /// /// helloWorld.mjs //////
    for (const controllerType of CONTROLLER_TYPES) {
      await render(join(srcPath, 'apps', '__app_template', controllerType, 'hello-world.mjs'), {
        CREATED_DATE: moment().format('L'), APP: answers.app, AUTHOR: `${answers.author} <${answers.mail}>`
      })
    }

    // Configure .env
    console.log('Editing .env ...')
    await appendFile(join(rootPath, '.env'), '\n')
    await appendFile(join(rootPath, '.env'), '# Docker build\n')
    await appendFile(join(rootPath, '.env'), `BUILD_IMAGE_NAME="${answers.name}"\n`)
    await appendFile(join(rootPath, '.env'), `BUILD_REGISTRY_ADDRESS="${answers.registry}"\n`)

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Renomeia Diretório app
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log('--------------------------------------------------------------------------------------------------------')
    console.log(`Creating app "${answers.app}"...`)
    console.log('--------------------------------------------------------------------------------------------------------')
    await fs.move(join(srcPath, 'apps', '__app_template'), join(srcPath, 'apps', answers.app))

    console.log('Installing modules...')
    await spawn(`cd "${projectFolderName}" && npm i`)
    console.log('Installing Node Framework...')
    await spawn(`cd "${projectFolderName}" && npm i @agtm/node-framework @agtm/util`)
    console.log('Installing Node NCLI...')
    await spawn(`cd "${projectFolderName}" && npm i -d @agtm/ncli`)

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ADICIONA SUPORTE AO PRISMA
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (addPrisma) {
      console.log('--------------------------------------------------------------------------------------------------------')
      console.log(`Setting project "${answers.name}" with prisma...`)
      console.log('--------------------------------------------------------------------------------------------------------')

      /// /////////////////////////////////////////////////////
      // Configure .env
      /// /////////////////////////////////////////////////////
      console.log('Editing .env ...')
      await appendFile(join(rootPath, '.env'), '\n# Prisma\n')
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_PROVIDER="${prismaAnswers.PRISMA_PROVIDER}"\n`)
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_HOST="${prismaAnswers.PRISMA_HOST}"\n`)
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_PORT="${prismaAnswers.PRISMA_PORT}"\n`)
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_DATABASE="${prismaAnswers.PRISMA_DATABASE}"\n`)
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_USERNAME="${prismaAnswers.PRISMA_USERNAME}"\n`)
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_PASSWORD="${prismaAnswers.PRISMA_PASSWORD}"\n`)
      await appendFile(join(rootPath, '.env'), `NF_PRISMA_OPTIONS="${prismaAnswers.PRISMA_OPTIONS}"\n`)

      /// /////////////////////////////////////////////////////
      // Copy new files
      /// /////////////////////////////////////////////////////
      const entries = await readdir(templatePrismaPath, { withFileTypes: true })
      for (const entry of entries) {
        const srcPath = join(templatePrismaPath, entry.name)
        const destPath = join(rootPath, entry.name)

        if (entry.isDirectory()) {
          console.log(`Copyng directory ${entry.name} ...`)
          await fs.copy(srcPath, destPath)
        } else {
          console.log(`Copyng file ${entry.name} ...`)
          await copyFile(srcPath, destPath)
        }
      }
      /// /////////////////////////////////////////////////////
      // Edit package.json
      /// /////////////////////////////////////////////////////
      console.log('Editing .package.json ...')
      const prismaScripts = {
        'prisma:migrate': 'DATABASE_URL=$(./scripts/generate-prisma-url.mjs) prisma migrate dev --name',
        'prisma:generate': 'DATABASE_URL=$(./scripts/generate-prisma-url.mjs) prisma generate'
      }
      await addScriptToPackageJson(join(rootPath, 'package.json'), prismaScripts)

      console.log('Installing Prisma and dotenv...')
      await spawn(`cd "${projectFolderName}" && npm i -D prisma dotenv`)
    }

    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FINALIZANDO
    /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    console.log('\n------------------------------------')
    console.log('Project created successfully!')
    console.log(`\tcd ${projectFolderName}`)
    console.log('\nLoad the assets with: \n\tnpm run install-assets')
    console.log('\nThen:\n\tnpm run dev\n')
    // console.log('\nPara gerar binário:\n\tnpm run build')
    console.log(`
To run a job directly from the terminal, run:
\tnpm run job "${projectFolderName}" main hello-world "My Job"
`)
    console.log('------------------------------------\n\n')
  } catch (e) {
    console.error(e.message)
    console.error(e.stack)
    process.exit()
  }
})()
