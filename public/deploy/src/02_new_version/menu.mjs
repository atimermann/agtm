import kleur from 'kleur';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {execSync} from 'child_process';

/**
 * Function to return a custom label for the menu.
 * Includes the current version and the date of the corresponding git tag.
 * @returns {string} The custom label for the menu item.
 */
export function getLabel() {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  let version = 'unknown';
  let tagDate = 'No tag created yet';

  // Retrieve the current version from package.json
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version || 'unknown';
  } catch (error) {
    console.error('Failed to read package.json:', error.message);
  }

  // Retrieve the date of the git tag matching the version
  try {
    const tagInfo = execSync(`git log -1 --format=%ci ${version}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();

    tagDate = new Date(tagInfo).toLocaleString();
  } catch (error) {
    if (error.status !== 128) {
      console.error(`Failed to retrieve git tag date for version ${version}:`, error);
    }
  }

  // Return the label with version and tag date
  return `${kleur.bold('New Version')} ${kleur.gray(`${kleur.bold('Current version:')} ${version} (${tagDate})`)}`;
}
