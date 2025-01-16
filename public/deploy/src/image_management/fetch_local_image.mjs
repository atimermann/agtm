#!/usr/bin/env node

// TODO: Transformar em módulo

import { execSync } from 'child_process';

/**
 * Retrieves the manifest of a Docker image using `docker inspect`.
 * @param {string} imageId - The ID of the Docker image.
 * @returns {Object} An object containing architecture, Docker version, and Node.js version.
 */
const getLocalManifest = (imageId) => {
  try {
    const output = execSync(`docker inspect ${imageId}`, { encoding: 'utf8' });
    const inspectData = JSON.parse(output)[0];

    const arch = inspectData.Architecture || 'N/A';
    const dockerVersion = inspectData.DockerVersion || 'N/A';
    const env = inspectData.Config?.Env || [];
    const nodeVersion =
      env.find((e) => e.startsWith('NODE_VERSION='))?.split('=')[1] || 'N/A';

    return { arch, dockerVersion, nodeVersion };
  } catch (error) {
    console.error(`❌ Error fetching manifest for ${imageId}:`, error.message);
    return {
      arch: 'N/A',
      dockerVersion: 'N/A',
      nodeVersion: 'N/A'
    };
  }
};

/**
 * Fetches the list of local Docker images and their details.
 * @returns {Array<Object>} An array of objects representing Docker images and their metadata.
 */
const getLocalImages = () => {
  const results = [];

  try {
    const output = execSync(
      'docker images --format "{{.Repository}};{{.Tag}};{{.ID}};{{.CreatedAt}};{{.Size}}"',
      { encoding: 'utf8' }
    );

    output
      .trim()
      .split('\n')
      .forEach((line) => {
        const [repo, tag, id, createdAt, size] = line.split(';');
        const manifest = getLocalManifest(id);

        results.push({
          repo,
          tag,
          created: new Date(createdAt).toISOString(),
          size,
          ...manifest,
        });
      });
  } catch (error) {
    console.error('❌ Error fetching local images:', error.message);
  }

  return results;
};

/**
 * The main function that retrieves and prints local Docker images in JSON format.
 */
const main = () => {
  const localImages = getLocalImages();
  console.log(JSON.stringify(localImages, null, 2));
};

main();
