import express from 'express'

import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  addAdminOrderNote,
} from '../controllers/adminOrderController.js'


import { requireAdmin } from '../middleware/requireAdmin.js'
import { requireAdminOrigin } from '../middleware/requireAdminOrigin.js'

const router = express.Router()

router.use(requireAdminOrigin)
router.use(requireAdmin)

router.get('/', getAdminOrders)
router.get('/:id', getAdminOrderById)
router.patch('/:id/status', updateAdminOrderStatus)
router.post('/:id/notes', addAdminOrderNote)

export default router
