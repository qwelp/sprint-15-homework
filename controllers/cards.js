const Card = require('../models/card');

// eslint-disable-next-line no-unused-vars
const ServerError = require('../middlewares/errors/server-err');
// eslint-disable-next-line no-unused-vars
const NotFoundError = require('../middlewares/errors/not-found-err');
// eslint-disable-next-line no-unused-vars
const NotRights = require('../middlewares/errors/not-rights');
// eslint-disable-next-line no-unused-vars
const ErrorOnTheClientSide = require('../middlewares/errors/on-the-client-side-err');

// GET Все карточки
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((user) => {
      if (!user) {
        throw new ServerError('Пользователи не найдены');
      }

      res.send({ data: user });
    })
    .catch(next);
};

// POST добавить карточку
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Не удалось создать карточку');
      }

      res.send({ data: card });
    })
    .catch(next);
};

// DELETE Удалить карточку
module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card
    .findOne({ _id: cardId })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточки не существует');
      } else if (String(card.owner) === req.user._id) {
        Card.deleteOne({ _id: cardId })
          .then(() => {
            res.send({ data: card });
          });
      } else {
        throw new NotRights('Можно удалить, только свою карточку');
      }
    })
    .catch(next);
};

// PUT поставить лайк карточке
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (card === null) {
        throw new ErrorOnTheClientSide('Не правильный _id карточки');
      } else {
        res.status(200).send({ data: card });
      }
    })
    .catch(next);
};

// DELETE убрать лайк с карточки
module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, { new: true }
  )
    .then((card) => {
      if (card === null) {
        throw new ErrorOnTheClientSide('Не правильный _id карточки');
      } else {
        res.status(200).send({ data: card });
      }
    })
    .catch(next);
};
