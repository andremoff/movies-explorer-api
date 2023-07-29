const jwt = require('jsonwebtoken');
const UnauthenticatedError = require('../errors/UnauthenticatedError');

module.exports = (req, res, next) => {
  const { jwt: token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError('Необходима авторизация');
  }

  let payload;

  const { NODE_ENV, JWT_SECRET } = process.env;
  const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';

  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    throw new UnauthenticatedError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
