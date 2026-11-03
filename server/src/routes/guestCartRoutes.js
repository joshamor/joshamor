import express from 'express'
import {
  syncGuestCart,
  captureGuestCartContact,
} from '../controllers/guestCartController.js'

const router = express.Router()

router.put('/:guestCartId', syncGuestCart)
router.patch('/:guestCartId/contact', captureGuestCartContact)

export default router
