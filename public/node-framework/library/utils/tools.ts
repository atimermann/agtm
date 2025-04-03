/**
 * **Created on 02/04/2025**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Conjunto de ferramentas uteis genéricas sem uma classificação para agrupar
 *
 */


export function isDev(): boolean {
  return process.env.NODE_ENV === "development"
}

export function isHomol(): boolean {
  return process.env.NODE_ENV === "homologation"
}

export function isProd(): boolean {
  return process.env.NODE_ENV === "production"
}
