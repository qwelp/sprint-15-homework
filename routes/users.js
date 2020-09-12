const usersRouter = require('express').Router();
// eslint-disable-next-line no-unused-vars
const { celebrate, Joi } = require('celebrate');
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

usersRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2)
  })
}), updateUser);

usersRouter.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().uri()
  })
}), updateAvatarUser);

module.exports = {
  usersRouter,
  login,
  createUser
};
