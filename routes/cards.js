const router = require('express').Router();
// eslint-disable-next-line no-unused-vars
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
} = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/((http|https):\/\/)?(www.)?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-z0-9-]+\.[a-z]+[a-z]+?)(:[0-9]{2,5})?([a-z/]+)?#?/)
  })
}), createCard);

router.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().hex()
  })
}), deleteCard);

router.put('/:cardId/likes', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().hex()
  })
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().hex()
  })
}), dislikeCard);

module.exports = router;
