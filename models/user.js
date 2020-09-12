const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const NotAuthorizationError = require('../middlewares/errors/not-authorization-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  avatar: {
    type: String,
    validate: validator.isURL,
    required: [true, 'Ссылка не валидна!']
  },
  email: {
    type: String,
    unique: true,
    validate: validator.isEmail,
    required: [true, 'Email не валиден!']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  }
});

userSchema.statics.findUserByCredentials = function (email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        if (!user) {
          throw new NotAuthorizationError('Неправильные почта или пароль');
        }
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new NotAuthorizationError('Неправильные почта или пароль');
          }

          return user;
        });
    })
    .catch(next);
};

module.exports = mongoose.model('user', userSchema);
