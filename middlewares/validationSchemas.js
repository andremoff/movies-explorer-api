const Joi = require('joi');

const urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

const loginSchema = Joi.object().keys({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const userSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const userUpdateSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().required().email(),
});

const movieSchema = Joi.object().keys({
  country: Joi.string().required(),
  director: Joi.string().required(),
  duration: Joi.number().required(),
  year: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required().pattern(urlRegex),
  trailerLink: Joi.string().required().pattern(urlRegex),
  thumbnail: Joi.string().required().pattern(urlRegex),
  movieId: Joi.number().required(),
  nameRU: Joi.string().required(),
  nameEN: Joi.string().required(),
});

const movieIdSchema = Joi.object().keys({
  movieId: Joi.string().length(24).hex().required(),
});

module.exports = {
  loginSchema,
  userSchema,
  userUpdateSchema,
  movieSchema,
  movieIdSchema,
};
