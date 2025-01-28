/* eslint-disable no-undef */

import { spawnSync } from 'child_process';
import { confirm, log, isCancel, cancel, spinner } from '@clack/prompts'
import kleur from 'kleur';
import { getLatestImageInfo } from '../../../src/image_management/get_latest_image_info.mjs';
import { getCurrentVersion, getEnvVars } from '../../../src/tools/index.mjs'



/**
 * Main function to build a new Docker image.
 */
async function buildDockerImage() {
  log.message(`---------------------------------- Building Docker Image  ----------------------------------`)

  const { BUILD_REGISTRY_ADDRESS, BUILD_IMAGE_NAME } = getEnvVars()

  const fullImageName = `${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}`;

  const spin = spinner()
  spin.start('Fetching image info...')
  const currentVersion = getCurrentVersion();
  const latestImage = await getLatestImageInfo(fullImageName);
  spin.stop('Image info fetched!')

  log.message(`${kleur.bold('Project Version:')} ${kleur.green(currentVersion)}`);
  log.message(`${kleur.bold('Current Docker Image:')} ${kleur.green(`${latestImage.version}`)}`);

  if (currentVersion === latestImage.version) {
    log.warn(kleur.yellow('The current version already exists.'));

    const regenerate = await confirm({
      message: `Do you want to rebuild the existing image for version ${currentVersion}?`,
    });

    if (isCancel(regenerate) || !regenerate) {
      cancel('Build cancelled.');
      process.exit(0);
    }

    log.info(`Rebuilding Docker image for version: ${currentVersion}`);
    buildImage(fullImageName, currentVersion);
    log.success(`Docker image ${currentVersion} rebuilt successfully.`);
    return;
  }

  const confirmBuild = await confirm({
    message: `Do you want to create a new image with version ${currentVersion}?`,
  });

  if (isCancel(confirmBuild) || !confirmBuild) {
    cancel('Build cancelled.');
    process.exit(0);
  }

  log.info(`Building Docker image for version: ${currentVersion}`);
  buildImage(fullImageName, currentVersion);
  log.success(kleur.bold().green(`Docker image ${currentVersion} built successfully.`));
}

/**
 * Builds the Docker image using the specified version.
 * @param {string} fullImageName - The full name of the Docker image (registry and name).
 * @param {string} version - The version for the new image.
 */
function buildImage(fullImageName, version) {
  console.log('\n-------------------------------------------------------- BUILD IMAGE START --------------------------------------------------------\n ')
  const buildCommand = `docker build -t ${fullImageName}:${version} -t ${fullImageName}:latest .`;

  const result = spawnSync(buildCommand, {
    shell: true,
    stdio: 'inherit',
  });

  console.log('\n----------------------------------------------------- BUILD IMAGE END --------------------------------------------------------\n')

  if (result.error) {
    log.error(`Error building Docker image: ${result.error.message}`);
    process.exit(1);
  }
}

// Execute the script
await buildDockerImage();
