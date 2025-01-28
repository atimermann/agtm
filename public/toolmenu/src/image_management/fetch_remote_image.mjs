import fetch from 'node-fetch'
import { Agent } from 'https'
import { getEnvVars } from '../tools/index.mjs'

// Configuração do ambiente
// TODO: Trazer já pronto
const { BUILD_REGISTRY_ADDRESS } = getEnvVars()

const registryAddress = `https://${BUILD_REGISTRY_ADDRESS}`
const insecure = { agent: new Agent({ rejectUnauthorized: false }) }

// Cache interno
let cache = {
  repositories: null,
  images: {},
}

/**
 * Realiza uma requisição para o registro
 *
 * @param {string} url - URL da requisição
 * @returns {Promise<Object>} - Resposta JSON da API
 */
const fetchFromRegistry = async (url) => {

  // TODO: Verificar se o try é importante, quando não tem nada no registro deve retornar null
  try {
    const res = await fetch(url, insecure)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return await res.json()
  } catch (error) {
    console.error(`❌ Error fetching data from ${url}: ${error.message}`)
    return null
  }
}

/**
 * Monta a URL para as requisições
 *
 * TDDO: não precisa existir, criar uma variavel normal
 *
 * @param {string} path - Caminho adicional da URL
 * @returns {string} - URL completa
 */
const buildRegistryUrl = (path) => `${registryAddress}${path}`

/**
 * Busca os repositórios disponíveis no registry
 *
 * @returns {Promise<string[]>} - Lista de repositórios
 */
export const getAllRepositories = async () => {
  if (cache.repositories) {
    console.log('ℹ️ Using cached repositories')
    return cache.repositories
  }

  const url = buildRegistryUrl('/v2/_catalog')
  const data = await fetchFromRegistry(url)
  const repositories = data?.repositories || []
  cache.repositories = repositories // Armazena no cache
  return repositories
}

/**
 * Busca o manifesto de uma tag específica
 *
 * @param {string} image - Nome da imagem
 * @param {string} tag - Nome da tag
 * @returns {Promise<Object|null>} - Informações do manifesto ou null em caso de erro
 */
const fetchManifest = async (image, tag) => {
  const url = buildRegistryUrl(`/v2/${image}/manifests/${tag}`)
  return await fetchFromRegistry(url)
}

/**
 * Extrai informações de uma tag a partir de seu manifesto
 *
 * @param {string} image - Nome da imagem
 * @param {string} tag - Nome da tag
 * @param {Object} manifest - Dados do manifesto
 * @returns {Object} - Informações estruturadas da tag
 */
const extractTagInfo = (image, tag, manifest) => {
  const history = JSON.parse(manifest.history?.[0]?.v1Compatibility || '{}')
  const env = history.config?.Env || []

  return {
    repository: image,
    tag,
    created: history.created || null,
    arch: manifest.architecture || 'N/A',
    dockerVersion: history.docker_version || 'N/A',
    nodeVersion: env.find((e) => e.startsWith('NODE_VERSION='))?.split('=')[1] || 'N/A',
    source: 'remote',
  }
}

/**
 * Busca as tags de uma imagem e suas informações
 *
 * @param {string} image - Nome da imagem
 * @returns {Promise<Object[]>} - Lista de informações das tags
 */
const getImageTags = async (image) => {
  if (cache.images[image]) {
    return cache.images[image]
  }

  const url = buildRegistryUrl(`/v2/${image}/tags/list`)
  const data = await fetchFromRegistry(url)

  if (!data?.tags) {
    return []
  }

  const results = []
  for (const tag of data.tags) {
    try {
      const manifest = await fetchManifest(image, tag)
      if (manifest) {
        results.push(extractTagInfo(image, tag, manifest))
      }
    } catch (error) {
      console.error(`⚠️ Error processing tag ${tag} for image ${image}: ${error.message}`)
    }
  }

  cache.images[image] = results // Armazena no cache
  return results
}

/**
 * Obtém todas as imagens e suas tags
 *
 * @param {string|null} imageName - Nome da imagem específica ou null para todas
 * @returns {Promise<Object[]>} - Lista de informações das imagens
 */
export const getRemoteImages = async (imageName = null) => {
  if (imageName && cache.images[imageName]) {
    console.log(`ℹ️ Using cached data for image: ${imageName}`)
    return cache.images[imageName]
  }

  const repositories = imageName ? [imageName] : await getAllRepositories()
  const allImages = []

  for (const repo of repositories) {
    const tags = await getImageTags(repo)
    allImages.push(...tags)
  }

  return allImages
}

/**
 * Limpa o cache interno
 */
export const cleanCache = () => {
  cache = {
    repositories: null,
    images: {},
  }
}

/**
 * Retorna informações da última imagem remota mais recente de um repositório específico
 *
 * @param {string} repo - Nome do repositório
 * @returns {Promise<Object>} - Informações da imagem mais recente ou objeto com valores nulos
 */
export const getLatestImageFromRemote = async (repo) => {

  // TODO: Função repetida, já existe a mesma  lógica duplicando código no get localImagem, refatorar de forma q tenhamos apenas um código
  const images = await getRemoteImages(repo)

  // Filtra imagens que não possuem tag "latest"
  const validImages = images.filter(
    (image) => !image.tag.toLowerCase().includes('latest') && image.repository === repo
  )

  // Ordena pela data de criação e obtém a mais recente
  const latestImage = validImages.sort((a, b) => new Date(b.created) - new Date(a.created))[0]

  if (!latestImage) {
    return {
      version: null,
      created: null,
    }
  }

  const version = latestImage.tag
  const created = new Date(latestImage.created).toLocaleString()

  return {
    version,
    created,
  }
}
