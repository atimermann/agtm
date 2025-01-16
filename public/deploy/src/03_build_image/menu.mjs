import kleur from 'kleur';

import { getLatestImageInfo } from '../image_management/get_latest_image_info.mjs'
import { getEnvVars } from '../tools/index.mjs'

/**
 * Function to fetch the latest image version and return a custom label for the menu.
 * @returns {string} The custom label for the menu item.
 */
export async function getLabel() {
  const { BUILD_REGISTRY_ADDRESS, BUILD_IMAGE_NAME } = getEnvVars()

  const imageFullName = `${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}`;

  const { version, created } = await getLatestImageInfo(imageFullName);

  if (!version) {
    return `${kleur.bold('Build Image')} ${kleur.gray('No image')} `;
  }

  return `${kleur.bold('Build Image')} ${kleur.gray(
    `${kleur.bold('Current version:')} ${version} (${created})`
  )}`;
}
