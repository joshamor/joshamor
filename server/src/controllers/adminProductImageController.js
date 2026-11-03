
import mongoose from 'mongoose'
import { fileTypeFromBuffer } from 'file-type'
import Product from '../models/Product.js'
import cloudinary from '../config/cloudinary.js'

const allowedExtensions = new Set([
  'jpg',
  'png',
  'webp',
  'avif',
])

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    stream.end(buffer)
  })
}

async function deleteCloudinaryAssets(publicIds) {
  return Promise.allSettled(
    publicIds.map(publicId =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      })
    )
  )
}

export async function uploadProductImages(req, res, next) {
  const uploadedAssets = []

  try {
    const { id } = req.params
    const files = req.files || []

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one image.',
      })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    const target = req.body.target || 'gallery'
    const colorName = req.body.colorName?.trim()

    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Please specify an upload target: gallery or color.',
      })
    }


    if (!['gallery', 'color'].includes(target)) {
      return res.status(400).json({
        success: false,
        message: 'Target must be gallery or color.',
      })
    }

    let selectedColor = null

    if (target === 'color') {
      if (!colorName) {
        return res.status(400).json({
          success: false,
          message: 'A colour name is required for colour images.',
        })
      }

      selectedColor = product.colors.find(
        color => color.name.toLowerCase() === colorName.toLowerCase()
      )

      if (!selectedColor) {
        return res.status(400).json({
          success: false,
          message: 'That colour is not configured for this product.',
        })
      }
    }

    // Validate actual file contents before sending anything to Cloudinary.
    for (const file of files) {
      const detectedType = await fileTypeFromBuffer(file.buffer)

      if (
        !detectedType ||
        !allowedExtensions.has(detectedType.ext)
      ) {
        return res.status(400).json({
          success: false,
          message: `The file "${file.originalname}" is not a supported image.`,
        })
      }
    }

    const folder = `josh-amor/products/${product.slug}`

    for (const file of files) {
      const result = await uploadBuffer(file.buffer, {
        folder,
        resource_type: 'image',
        overwrite: false,
        unique_filename: true,
      })

      uploadedAssets.push(result)
    }

    const images = uploadedAssets.map((asset, index) => ({
      url: asset.secure_url,
      publicId: asset.public_id,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      alt: files[index].originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim(),
    }))

    if (target === 'gallery') {
      product.images.push(...images)
    } else {
      selectedColor.images.push(...images)
    }

    await product.save()

    return res.status(201).json({
      success: true,
      message: 'Product images uploaded successfully.',
      data: {
        target,
        colorName: selectedColor?.name || null,
        images,
      },
    })
  } catch (error) {
    // Remove successfully uploaded files if the database update fails.
    if (uploadedAssets.length) {
      await deleteCloudinaryAssets(
        uploadedAssets.map(asset => asset.public_id)
      )
    }

    next(error)
  }
}

export async function deleteProductImages(req, res, next) {
  try {
    const { id } = req.params
    const { publicIds } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    if (
      !Array.isArray(publicIds) ||
      !publicIds.length ||
      publicIds.length > 10 ||
      publicIds.some(item => typeof item !== 'string' || !item.trim()) ||
      new Set(publicIds).size !== publicIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide between 1 and 10 unique valid image public IDs.',
      })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    // Only allow deletion of images actually attached to this product.
    const attachedImages = [
      ...product.images,
      ...product.colors.flatMap(color => color.images),
    ]

    const attachedPublicIds = new Set(
      attachedImages
        .map(image => image.publicId)
        .filter(Boolean)
    )

    const notOwned = publicIds.filter(
      publicId => !attachedPublicIds.has(publicId)
    )

    if (notOwned.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more images do not belong to this product.',
      })
    }

    product.images = product.images.filter(
      image => !publicIds.includes(image.publicId)
    )

    product.colors.forEach(color => {
      color.images = color.images.filter(
        image => !publicIds.includes(image.publicId)
      )
    })

    await product.save()

    const deletionResults = await deleteCloudinaryAssets(publicIds)

    const failedDeletions = deletionResults
      .map((result, index) => ({
        result,
        publicId: publicIds[index],
      }))
      .filter(item => item.result.status === 'rejected')

    return res.status(200).json({
      success: true,
      message: failedDeletions.length
        ? 'Images removed from the product. Some Cloudinary assets could not be deleted.'
        : 'Product images deleted successfully.',
      data: {
        deletedPublicIds: publicIds.filter(
          publicId => !failedDeletions.some(item => item.publicId === publicId)
        ),
        failedPublicIds: failedDeletions.map(item => item.publicId),
      },
    })
  } catch (error) {
    next(error)
  }
}
