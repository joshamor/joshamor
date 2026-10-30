
import express from 'express'
import {
  createProduct,
  updateProduct,
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

export default router
