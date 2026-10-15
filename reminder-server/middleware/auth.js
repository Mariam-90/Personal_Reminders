const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');
const { apiError } = require('../lib/errors');

function signToken(user) {
  return jwt.sign({ sub: String(user._id), username: user.username }, jwtSecret, { expiresIn: jwtExpiresIn });
}

// Requires "Authorization: Bearer <token>" and puts the user id on req.userId.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json(apiError('authRequired'));
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json(apiError('sessionExpired'));
  }
}

module.exports = { signToken, requireAuth };
