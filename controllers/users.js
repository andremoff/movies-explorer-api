const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthenticatedError = require('../errors/UnauthenticatedError');
const ConflictError = require('../errors/ConflictError');

// Получение информации о текущем пользователе
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

// Обновление данных пользователя
const updateUser = async (req, res, next) => {
  const { email, name } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { email, name },
      { new: true, runValidators: true },
    ).select('-password');
    if (!updatedUser) {
      throw new NotFoundError('Пользователь не найден');
    }
    res.json({ data: updatedUser });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    } else if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
    } else {
      next(err);
    }
  }
};

// Создание нового пользователя
const createUser = async (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  return User.create({
    email,
    password: hashedPassword,
    name,
  })
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';
      const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });

      res.status(201).send({
        _id: user._id,
        email: user.email,
        name: user.name,
        token,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};

// Авторизация пользователя
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthenticatedError('Неправильные почта или пароль'));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(new UnauthenticatedError('Неправильные почта или пароль'));
    }

    const { NODE_ENV, JWT_SECRET } = process.env;
    const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';

    const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });

    return res
      .cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 3600000 * 24 * 7,
      })
      .json({ message: 'Авторизация успешна', token });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getCurrentUser,
  updateUser,
  createUser,
  login,
};
