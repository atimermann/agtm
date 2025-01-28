import { runFetchScript } from '../tools/index.mjs'

/**
 *
 * Extracts the version and creation date from the latest valid image.
 * @returns {Object} JSON object containing version and date of the latest image.
 */
export async function getLatestImageInfo (repo) {

  const localImages = await runFetchScript('../image_management/fetch_local_image.mjs')

  const validImages = localImages.filter(
    (image) => image.tag !== 'latest' && image.repo === repo
  )

  const latestImage = validImages.sort((a, b) => new Date(b.created) - new Date(a.created))[0]

  if (!latestImage) {
    return {
      version: null,
      created: null
    }
  }

  const version = latestImage.tag.replace('v', '')
  const created = new Date(latestImage.created).toLocaleString()

  return {
    version,
    created
  }
}