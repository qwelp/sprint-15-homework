const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const NotFoundError = require('../middlewares/errors/not-found-err');
// eslint-disable-next-line no-unused-vars
const ServerError = require('../middlewares/errors/server-err');
// eslint-disable-next-line no-unused-vars
const ErrorOnTheClientSide = require('../middlewares/errors/on-the-client-side-err');
// eslint-disable-next-line no-unused-vars
const NotRights = require('../middlewares/errors/not-rights');
// eslint-disable-next-line no-unused-vars
const Conflict409 = require('../middlewares/errors/conflict-409');

const { JWT_SECRET } = process.env;

// GET Получить пользователя по id
module.exports.getUser = (req, res, next) => User
  .findOne({ _id: req.params.userId })
  .then((user) => {
    if (!user) {
      throw new NotFoundError('Нет пользователя с таким id');
    }

    res.send(user);
  })
  .catch(next);

// GET Получить всех пользователей
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => {
      if (!user) {
        throw new ServerError('Сервер не может получить список пользователей');
      }

      res.send({ data: user });
    })
    .catch(next);
};

// POST Добавить пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name: namePost,
    about: aboutPost,
    avatar: avatarPost,
    email: emailPost,
    password
  } = req.body;
  const passwordArray = password.split('').every((sym) => sym === ' ');

  if (password === ' ' || passwordArray) {
    next(new ErrorOnTheClientSide('Пароль не может быть пустым'));
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name: namePost,
        about: aboutPost,
        avatar: avatarPost,
        email: emailPost,
        password: hash
      }))
      .then((user) => {
        res.status(201).send({ _id: user._id });
      })
      .catch((err) => {
        if (err.name === 'MongoError' && err.code === 11000) {
          next(new Conflict409('Conflict409'));
        } else {
          next(new ErrorOnTheClientSide(err.message));
        }
      });
  }
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 3600000, httpOnly: true });

      res.send({
        token: req.cookies.jwt
      });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

// PATCH обновляет профиль
module.exports.updateUser = (req, res, next) => {
  const {
    name: namePatch,
    about: aboutPatch
  } = req.body;
  const owner = req.user._id;

  User
    .findOne({ _id: owner })
    .then((user) => {
      if (!user) {
        throw new ErrorOnTheClientSide('Нет пользователя с таким id');
      } else if (String(user._id) === owner) {
        User.updateOne({ _id: owner }, { name: namePatch, about: aboutPatch },
          { runValidators: true })
          .then(() => {
            User.findById(owner, (errUpdate, userUpdate) => {
              if (!userUpdate) {
                throw new NotFoundError('Пользователь не существует');
              } else {
                res.send({ data: userUpdate });
              }
            });
          })
          .catch(next);
      } else {
        throw new NotRights('Можно редактировать, только свою карточку');
      }
    })
    .catch(next);
};

// PATCH обновляет аватар
module.exports.updateAvatarUser = (req, res, next) => {
  const {
    avatar: avatarPost
  } = req.body;
  const owner = req.user._id;

  User
    .findOne({ _id: owner })
    .then((user) => {
      if (!user) {
        throw new ErrorOnTheClientSide('Нет пользователя с таким id');
      } else if (String(user._id) === owner) {
        User.updateOne({ _id: owner }, { avatar: avatarPost },
          { runValidators: true })
          .then(() => {
            User.findById(owner, (errUpdate, userUpdate) => {
              if (!userUpdate) {
                throw new NotFoundError('Пользователь не существует');
              } else {
                res.send({ data: userUpdate.avatar });
              }
            });
          })
          .catch(next);
      } else {
        throw new NotRights('Можно редактировать, только свою карточку');
      }
    })
    .catch(next);
};
