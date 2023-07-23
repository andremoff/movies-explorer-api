require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const escapeHtml = require('escape-html');
const rateLimit = require('express-rate-limit');
const { celebrate } = require('celebrate');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { userSchema, loginSchema } = require('./middlewares/validationSchemas');
const { login, createUser } = require('./controllers/users');
const usersRouter = require('./routes/users');
const movieRouter = require('./routes/movie');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handleError');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

const app = express();
const PORT = 3000;

app.use(cors);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());

// Логгер запросов
app.use(requestLogger);

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

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

app.post('/signin', celebrate({ body: loginSchema }), (req, res, next) => {
  const { email, password } = req.body;

  const sanitizedData = {
    email: escapeHtml(email),
    password,
  };

  login(req, res, next, sanitizedData);
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

app.use(auth);

app.use('/users', usersRouter);
app.use('/movies', movieRouter);

// Обработка несовпадающих маршрутов (404 ошибка)
app.use((req, res, next) => {
  const err = new NotFoundError('Запрашиваемый ресурс не найден');
  next(err);
});

// Логгер ошибок
app.use(errorLogger);

// Обработка ошибок celebrate/Joi
app.use(errors());

// Обработчик ошибок
app.use(handleError);

mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT);
  });
