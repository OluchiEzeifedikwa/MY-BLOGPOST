import cloudinary from './cloudinary.ts'

export async function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'blogpost' },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve(result.secure_url)
      }
    ).end(buffer)
  })
}
