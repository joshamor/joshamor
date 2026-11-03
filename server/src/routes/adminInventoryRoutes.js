
import express from 'express'
import {
  getInventory,
  updateProductVariants,
  updateVariantStock,
  getInventoryHistory,
  bulkUpdateVariantStock,
  getInventorySettings,
   updateGlobalLowStockThreshold,
  updateProductLowStockThreshold,
   updateVariantSku,
} from '../controllers/adminInventoryController.js'


import { requireAdmin } from '../middleware/requireAdmin.js'
import { requireAdminOrigin } from '../middleware/requireAdminOrigin.js'

const router = express.Router()

router.use(requireAdminOrigin)
router.use(requireAdmin)

router.get('/', getInventory)
router.get('/settings', getInventorySettings)
router.patch('/settings/low-stock-threshold', updateGlobalLowStockThreshold)

router.patch('/bulk-stock', bulkUpdateVariantStock)

router.get('/:id/history', getInventoryHistory)
router.put('/:id/variants', updateProductVariants)
router.patch('/:id/variants/:variantId/stock', updateVariantStock)
router.patch('/:id/variants/:variantId/sku', updateVariantSku)
router.patch('/:id/low-stock-threshold', updateProductLowStockThreshold)


export default router
