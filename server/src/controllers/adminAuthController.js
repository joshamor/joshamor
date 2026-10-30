
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import Admin from '../models/Admin.js'

const COOKIE_NAME = 'josh_amor_admin_token'
const SESSION_DURATION = 15 * 60 * 1000

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/admin',
  maxAge: SESSION_DURATION,
})

const clearCookieOptions = () => {
  const { maxAge, ...options } = cookieOptions()
  return options
}

// POST /api/admin/auth/login
export async function loginAdmin(req, res, next) {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const admin = await Admin.findOne({ email }).select(
      '+passwordHash email role isActive'
    )

    // Use the same response for an unknown email and incorrect password.
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const token = jwt.sign(
      {
        sub: admin._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }
    )

    admin.lastLoginAt = new Date()
    await admin.save()

    res.cookie(COOKIE_NAME, token, cookieOptions())

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/auth/me
export async function getAdminSession(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        role: req.admin.role,
      },
    },
  })
}

// POST /api/admin/auth/logout
export function logoutAdmin(req, res) {
  res.clearCookie(COOKIE_NAME, clearCookieOptions())

  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  })
}
