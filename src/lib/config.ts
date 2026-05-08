// App-wide configuration derived from environment variables.
// Import from here rather than reading process.env directly in route handlers.

// Full https:// URL. Handles both "startingmonday.app" and "https://startingmonday.app" env formats.
export const APP_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
  return raw.startsWith('http') ? raw : `https://${raw}`
})()

// Maximum file upload size: 5 MB. Used in profile/upload-resume and linkedin-import/extract.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

// Dashboard pipeline page size.
export const PIPELINE_PAGE_SIZE = 50
