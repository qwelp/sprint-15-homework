const jwt = require('jsonwebtoken');
require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const { JWT_SECRET = '5c83b16ed44f5ceaf36bb33e9a13b3d0' } = process.env;

function handleAuthError(res) {
  return res
    .status(401)
    .send({ message: 'Необходима авторизация' });
}

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    handleAuthError(res);
  }

  req.user = payload;

  next();
};
