const movieRouter = require('express').Router();
const { celebrate } = require('celebrate');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movie');
const { movieSchema, movieIdSchema } = require('../middlewares/validationSchemas');

movieRouter.get('/', getMovies);
movieRouter.post('/', celebrate({ body: movieSchema }), createMovie);
movieRouter.delete('/:movieId', celebrate({ params: movieIdSchema }), deleteMovie);

module.exports = movieRouter;
