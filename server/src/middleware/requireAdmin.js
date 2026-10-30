
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.josh_amor_admin_token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const admin = await Admin.findById(decoded.sub).select(
      'email role isActive'
    )

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin session is no longer valid.',
      })
    }

    req.admin = admin

    next()
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
      })
    }

    next(error)
  }
}
