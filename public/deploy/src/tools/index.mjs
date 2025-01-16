/* eslint-disable no-undef */
// tools.js
import { exec } from 'child_process'
import { resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'url'
import { accessSync, constants, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Executes a fetch script and returns its JSON output.
 * @param {string} scriptName - The script name relative to the current file.
 * @returns {Promise<Object>} The JSON output of the script.
 */
export function runFetchScript (scriptName) {
  const scriptPath = resolve(__dirname, scriptName)

  return new Promise((resolve, reject) => {
    exec(`node ${scriptPath}`, (error, stdout) => {
      if (error) {
        return reject(error)
      }
      try {
        const json = JSON.parse(stdout)
        resolve(json)
      } catch (err) {
        reject(err)
      }
    })
  })
}

/**
 * Reads environment variables from a .env file.
 * @returns {Object} Promise that resolves to an object containing all environment variables.
 */
export function loadEnv() {
  const dotenvPath = resolve(process.cwd(), '.env');

  try {
    // Check if the .env file exists
    accessSync(dotenvPath, constants.F_OK);

    // Read the .env file
    const envData = readFileSync(dotenvPath, 'utf8');

    const envVars = {};
    envData.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });

    return envVars;
  } catch (error) {
    console.error(`Não foi possível carregar o arquivo .env. (Obrigatório)`, error.message);
    process.exit(1); // Exit with an error code
  }
}


/**
 * Validates required environment variables and throws an error if missing.
 * @param {Object} envVars - The loaded environment variables.
 */
function validateEnv (envVars) {

  if (!envVars.BUILD_REGISTRY_ADDRESS) {
    throw new Error('Environment variable BUILD_REGISTRY_ADDRESS is required.')
  }
  if (!envVars.BUILD_IMAGE_NAME) {
    throw new Error('Environment variable BUILD_IMAGE_NAME is required.')
  }
}

/**
 * Reads the current version from the package.json file.
 * @returns {string} The current version.
 */
export function getCurrentVersion () {
  const packageJsonPath = resolve(process.cwd(), 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  return packageJson.version
}

/**
 * Get and validate essential environment variables for building/pushing images.
 *
 * @returns {{BUILD_REGISTRY_ADDRESS: string, BUILD_IMAGE_NAME: string}}
 */
export function getEnvVars () {
  const envVars = loadEnv()
  validateEnv(envVars)

  return envVars
}
