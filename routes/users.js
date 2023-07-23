const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCurrentUser, updateUser } = require('../controllers/users');

usersRouter.get('/me', getCurrentUser);

usersRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email(),
  }),
}), updateUser);

module.exports = usersRouter;
