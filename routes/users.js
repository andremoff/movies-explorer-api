const usersRouter = require('express').Router();
const { celebrate } = require('celebrate');
const { getCurrentUser, updateUser } = require('../controllers/users');
const { userUpdateSchema } = require('../middlewares/validationSchemas');

usersRouter.get('/me', getCurrentUser);
usersRouter.patch('/me', celebrate({ body: userUpdateSchema }), updateUser);

module.exports = usersRouter;
