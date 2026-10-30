
import express from 'express'

import {
  loginAdmin,
  getAdminSession,
  logoutAdmin,
} from '../controllers/adminAuthController.js'

import { requireAdmin } from '../middleware/requireAdmin.js'
import { requireAdminOrigin } from '../middleware/requireAdminOrigin.js'
import { adminLoginLimiter } from '../middleware/adminLoginLimiter.js'

const router = express.Router()

router.use(requireAdminOrigin)

router.post('/login', adminLoginLimiter, loginAdmin)
router.get('/me', requireAdmin, getAdminSession)
router.post('/logout', logoutAdmin)

export default router
