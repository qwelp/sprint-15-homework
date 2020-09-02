const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const { JWT_SECRET } = process.env;

// GET Получить пользователя по id
module.exports.getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId, (err, user) => {
    if (!user) {
      res.status(404).send({ data: 'Пользователь не существует' });
    } else {
      res.status(200).send({ data: user });
    }
  });
};

// GET Получить всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// POST Добавить пользователя
module.exports.createUser = (req, res) => {
  const {
    name: namePost,
    about: aboutPost,
    avatar: avatarPost,
    email: emailPost,
    password
  } = req.body;
  const passwordArray = password.split('').every((sym) => sym === ' ');

  if (password === ' ' || passwordArray || password.length < 9) {
    res.status(400).send({ message: 'Пароль не может быть пустым и быть меньше 8 символов!' });
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
          res.status(409).send({ message: err.message });
        } else {
          res.status(400).send({ message: err.message });
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
module.exports.updateUser = (req, res) => {
  const {
    name: namePatch,
    about: aboutPatch
  } = req.body;
  const owner = req.user._id;

  User.findById(owner, (err, userValid) => {
    if (!userValid) {
      res.status(400).send({ data: 'Пользователя не существует' });
    } else if (String(userValid._id) === req.user._id) {
      User.updateOne({ _id: owner }, { name: namePatch, about: aboutPatch },
        { runValidators: true })
        .then(() => {
          User.findById(owner, (errUpdate, userUpdate) => {
            if (!userUpdate) {
              res.status(404).send({ data: 'Пользователь не существует' });
            } else {
              res.send({ data: userUpdate });
            }
          });
        })
        .catch((error) => res.status(400).send({ message: error.message }));
    } else {
      res.status(403).send({ data: 'Можно редактировать, только свою карточку' });
    }
  });
};

// PATCH обновляет аватар
module.exports.updateAvatarUser = (req, res) => {
  const {
    avatar: avatarPost
  } = req.body;
  const owner = req.user._id;

  User.findById(owner, (err, userValid) => {
    if (!userValid) {
      res.status(400).send({ data: 'Пользователя не существует' });
    } else if (String(userValid._id) === req.user._id) {
      User.updateOne({ _id: owner }, { $set: { avatar: avatarPost } }, { runValidators: true })
        .then(() => {
          User.findById(owner, (errUpdate, userUpdate) => {
            if (!userUpdate) {
              res.status(404).send({ data: 'Пользователь не существует' });
            } else {
              res.send({ data: userUpdate.avatar });
            }
          });
        })
        .catch((error) => res.status(400).send({ message: error.message }));
    } else {
      res.status(403).send({ data: 'Можно редактировать, только свой аватар' });
    }
  });
};
