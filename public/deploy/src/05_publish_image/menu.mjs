import { getLatestImageFromRemote } from '../image_management/fetch_remote_image.mjs'
import { getEnvVars } from '../tools/index.mjs'
import kleur from 'kleur'

export async function getLabel () {

  // TODO: importar já as variaveis de ambiente pronta, não tem pq carregar novamente todas as vezes
  const { BUILD_IMAGE_NAME } = getEnvVars()

  const lastPublishVersion = await getLatestImageFromRemote(BUILD_IMAGE_NAME)

  if (lastPublishVersion.version === null) {
    return `${kleur.bold('Publish Image')} ${kleur.gray(`No image`)}`
  }

  return `${kleur.bold('Publish Image')} ${kleur.gray(`${kleur.bold('Latest version:')} ${lastPublishVersion.version} (${lastPublishVersion.created})`)}`

}
