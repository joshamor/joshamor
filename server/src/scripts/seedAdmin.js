
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

import Admin from '../models/Admin.js'

async function seedAdmin() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD are required.'
    )
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('Admin password must be at least 12 characters.')
  }

  await mongoose.connect(MONGODB_URI)

  const email = ADMIN_EMAIL.toLowerCase().trim()

  const existingAdmin = await Admin.findOne({ email })

  if (existingAdmin) {
    console.log(`Admin account already exists: ${email}`)
    await mongoose.disconnect()
    return
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  await Admin.create({
    email,
    passwordHash,
    role: 'superadmin',
    isActive: true,
  })

  console.log(`Superadmin created successfully: ${email}`)

  await mongoose.disconnect()
}

seedAdmin().catch(async (error) => {
  console.error('Admin setup failed:', error.message)

  await mongoose.disconnect()
  process.exit(1)
})
