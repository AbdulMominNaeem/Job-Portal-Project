const { verify } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/httpError');
const prisma = require('../config/prisma');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw unauthorized('Missing token');
    const token = header.slice(7);
    const payload = verify(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { candidate: true, employer: true },
    });
    if (!user || !user.isActive || user.deletedAt) throw unauthorized('Invalid token');
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(unauthorized('Invalid or expired token'));
    }
    next(e);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient role'));
    next();
  };
}

module.exports = { authenticate, requireRole };
