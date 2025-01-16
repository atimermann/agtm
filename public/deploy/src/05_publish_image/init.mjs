/* eslint-disable no-undef */
import { spinner, confirm, isCancel, log } from '@clack/prompts'
import { execSync } from 'child_process'
import kleur from 'kleur'
import { getEnvVars } from '../tools/index.mjs'
import { getLatestImageInfo } from '../image_management/get_latest_image_info.mjs'
import { cleanCache, getLatestImageFromRemote } from '../image_management/fetch_remote_image.mjs'

log.message(`---------------------------------- Publishing Image ----------------------------------`)

const {
  BUILD_REGISTRY_ADDRESS,
  BUILD_IMAGE_NAME
} = getEnvVars()
const localImageFullName = `${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}`

const spin = spinner()
spin.start('Fetching image info...')

// Buscando a versão local
const {
  version: localVersion,
  created: localCreated
} = await getLatestImageInfo(localImageFullName)

// Buscando a versão remota
const {
  version: remoteVersion,
  created: remoteCreated
} = await getLatestImageFromRemote(BUILD_IMAGE_NAME)
spin.stop('Image info fetched!')

// Montando textos de exibição
const localText = localVersion
  ? `${localVersion} (${localCreated || 'unknown date'})`
  : 'No local image'

const remoteText = remoteVersion
  ? `${remoteVersion} (${remoteCreated || 'unknown date'})`
  : 'No remote image'

log.info(kleur.blue(`Local version: ${kleur.bold(localText)}`))
log.info(kleur.blue(`Remote version: ${kleur.bold(remoteText)}`))

// Se não existe imagem local, não há o que enviar
if (!localVersion) {
  log.info(kleur.red('No local version found. Nothing to push.'))
  await confirm({
    message: `Continue.`,
    defaultValue: true
  })
  process.exit(0)
}

// Se a versão remota for idêntica à local, não precisamos subir
if (localVersion === remoteVersion) {
  log.info(kleur.yellow('Remote version is identical to local version. No push needed.'))
  await confirm({
    message: `Continue.`,
    defaultValue: true
  })
  process.exit(0)
}

// Pergunta se deseja subir a versão local — padrão: não
const pushConfirmation = await confirm({
  message: `Push the local image ${kleur.bold(localVersion)} to the registry?`,
  defaultValue: false
})

if (isCancel(pushConfirmation) || !pushConfirmation) {
  log.info(kleur.red('Push operation cancelled.'))
  process.exit(0)
}

// Efetua o push da imagem local
log.info(kleur.blue(`Pushing Docker image ${localVersion}...`))
console.log('\n-------------------------------------------------------- PUBLISH IMAGE START --------------------------------------------------------\n ')
execSync(`docker push ${localImageFullName}:${localVersion}`, { stdio: 'inherit' })
console.log('\n-------------------------------------------------------- PUBLISH IMAGE END --------------------------------------------------------\n ')
log.success(kleur.green(`Docker image pushed successfully: ${localImageFullName}:${localVersion}`))
cleanCache()