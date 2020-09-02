const usersRouter = require('express').Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  login,
  updateAvatarUser
} = require('../controllers/users');

usersRouter.get('/', getUsers);
usersRouter.get('/:userId', getUser);
usersRouter.patch('/me', updateUser);
usersRouter.patch('/me/avatar', updateAvatarUser);

module.exports = {
  usersRouter,
  login,
  createUser
};
