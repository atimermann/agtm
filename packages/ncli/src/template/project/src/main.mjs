/**
 * **Created on {{CREATED_DATE}}**
 *
 * {{MAIN}}
 *
 * @author {{AUTHOR}}
 *
 * @file
 * {{DESCRIPTION}}
 *
 * @typedef {typeof import('@agtm/node-framework').Application} ApplicationClass
 * @typedef {import('@agtm/node-framework').Application} Application
 */
import { __dirname } from '@agtm/util'
import { checkExecution } from '@agtm/node-framework'

checkExecution(import.meta.url)

/**
 * Loads and returns an instance of the Application.
 *
 * @param  {ApplicationClass} Application  - The Application class to be instantiated.
 *
 * @return {Application}                   Returns instance of the Application class.
 */
export default function applicationLoader (Application) {
  return new Application(__dirname(import.meta.url), '{{NAME}}')
}
