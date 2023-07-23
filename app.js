require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const escapeHtml = require('escape-html');
const { celebrate } = require('celebrate');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { userSchema, loginSchema } = require('./middlewares/validationSchemas');
const { login, createUser } = require('./controllers/users');
const routes = require('./routes');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const { NOT_FOUND_ERROR, INTERNAL_SERVER_ERROR } = require('./utils/constants');
const { MONGO_DB_ADDRESS } = require('./utils/config');
const limiter = require('./middlewares/rateLimiter');

// Создание express-приложения
const app = express();
const PORT = 3000;

// Использование middleware
app.use(cors);
app.use(limiter);
app.use(helmet());

// Логгер запросов
app.use(requestLogger);

app.use(express.json());
app.use(cookieParser());

// Регистрация пользователя
app.post('/signup', celebrate({ body: userSchema }), (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  const sanitizedData = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    password,
  };

  createUser(req, res, next, sanitizedData);
});

// Авторизация пользователя
app.post('/signin', celebrate({ body: loginSchema }), (req, res, next) => {
  const { email, password } = req.body;

  const sanitizedData = {
    email: escapeHtml(email),
    password,
  };

  login(req, res, next, sanitizedData);
});

// Выход из системы
app.get('/signout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

// Проверка авторизации
app.use(auth);

// Подключение роутов
app.use(routes);

// Обработка несовпадающих маршрутов (404 ошибка)
app.use((req, res, next) => {
  const err = new NotFoundError(NOT_FOUND_ERROR);
  next(err);
});

// Логгер ошибок
app.use(errorLogger);

// Обработка ошибок celebrate/Joi
app.use(errors());

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({ message });
  next();
});

// Подключение к MongoDB и запуск приложения
mongoose.connect(MONGO_DB_ADDRESS, { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT);
  });
