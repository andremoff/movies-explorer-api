const router = require('express').Router();
const auth = require('../middlewares/auth');
const usersRouter = require('./users');
const movieRouter = require('./movie');

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', movieRouter);

module.exports = router;
