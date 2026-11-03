
import express from 'express'
import {
  createProduct,
  updateProduct,
  publishProduct,
  unpublishProduct,
  archiveProduct,
  restoreProduct,
  getAdminProducts,
  getAdminProduct
} from '../controllers/adminProductController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { requireAdminOrigin } from '../middleware/requireAdminOrigin.js'
import {
  uploadProductImages as uploadProductImagesToCloudinary,
  deleteProductImages,
} from '../controllers/adminProductImageController.js'

import {
  uploadProductImages as receiveProductImages,
  handleProductImageUploadError,
} from '../middleware/productImageUpload.js'

const router = express.Router()

// Protect every route against cross-origin state-changing requests
// and require an authenticated admin session.
router.use(requireAdminOrigin)
router.use(requireAdmin)

router.get('/', getAdminProducts)
router.get('/:id', getAdminProduct)

router.post('/', createProduct)
router.patch('/:id', updateProduct)

router.patch('/:id/publish', publishProduct)
router.patch('/:id/unpublish', unpublishProduct)
router.patch('/:id/archive', archiveProduct)
router.patch('/:id/restore', restoreProduct)

router.post(
  '/:id/images',
  receiveProductImages,
  handleProductImageUploadError,
  uploadProductImagesToCloudinary
)

router.delete('/:id/images', deleteProductImages)

export default router
