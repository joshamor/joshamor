
import multer from 'multer'

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10,
  },

  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error('Only JPEG, PNG, WebP and AVIF images are allowed.')
      )
    }

    callback(null, true)
  },
})

export const uploadProductImages = upload.array('images', 10)


export function handleProductImageUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400

    return res.status(status).json({
      success: false,
      message:
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Each image must be 8 MB or smaller.'
          : 'Invalid image upload. You can upload up to 10 images per request.',
    })
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to receive image upload.',
    })
  }

  next()
}
