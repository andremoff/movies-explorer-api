const router = require('express').Router();
const usersRouter = require('./users');
const movieRouter = require('./movie');

router.use('/users', usersRouter);
router.use('/movies', movieRouter);

module.exports = router;
