
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:8080'
].filter(Boolean)

export function requireAdminOrigin(req, res, next) {
  const origin = req.get('origin')

  const isStateChangingRequest = [
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ].includes(req.method)

  if (!isStateChangingRequest) {
    return next()
  }

  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Request origin not allowed.',
    })
  }

  next()
}
