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
usersRouter.get('/:userId', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().hex()
  })
}), getUser);

usersRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2)
  })
}), updateUser);

usersRouter.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(/((http|https):\/\/)?(www.)?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-z0-9-]+\.[a-z]+[a-z]+?)(:[0-9]{2,5})?([a-z/]+)?#?/)
  })
}), updateAvatarUser);

module.exports = {
  usersRouter,
  login,
  createUser
};
