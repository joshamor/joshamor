
import express from 'express'
import {
  createProduct,
  updateProduct,
  publishProduct,
  unpublishProduct,
  archiveProduct,
  restoreProduct,
} from '../controllers/adminProductController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { requireAdminOrigin } from '../middleware/requireAdminOrigin.js'

const router = express.Router()

// Protect every route against cross-origin state-changing requests
// and require an authenticated admin session.
router.use(requireAdminOrigin)
router.use(requireAdmin)

router.post('/', createProduct)
router.patch('/:id', updateProduct)

router.patch('/:id/publish', publishProduct)
router.patch('/:id/unpublish', unpublishProduct)
router.patch('/:id/archive', archiveProduct)
router.patch('/:id/restore', restoreProduct)

export default router
