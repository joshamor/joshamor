import express from 'express'
import { createGuestOrder } from '../controllers/guestOrderController.js'
import {
  simulateGuestPayment,
  initializeFlutterwaveCheckout,
} from '../controllers/guestPaymentController.js'
import {
  verifyGuestFlutterwavePayment,
} from '../controllers/flutterwaveVerificationController.js'

const router = express.Router()

router.post(
  '/:guestCartId/:orderId/flutterwave/initialize',
  initializeFlutterwaveCheckout
)

router.post(
  '/:guestCartId/:orderId/flutterwave/verify',
  verifyGuestFlutterwavePayment
)


router.post(
  '/:guestCartId/:orderId/simulate-payment',
  simulateGuestPayment
)

router.post('/:guestCartId', createGuestOrder)


export default router
