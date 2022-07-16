const db = require('../database/models');
const generateToken = require('./jwtController');
const { User } = require('../database/models');
const vToken = require('./jwtController');

const ValidateToken = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.User.findOne({ where: { email } });

  if (!email || !password) {
    return res.status(400).json({ message: 'Some required fields are missing' });
  } if (!user) {
    return res.status(400).json({ message: 'Invalid fields' });
  }

  const create = generateToken.createToken({ email, password });
  
  return res.status(200).json({ token: create });
};

const validRegistration = async (req, res, next) => {
  const { displayName, email, password } = req.body;

  if (displayName && displayName.length < 8) {
    return res.status(400)
      .json({ message: '"displayName" length must be at least 8 characters long' });
  } if (!email.includes('@')) {
    return res.status(400).json({ message: '"email" must be a valid email' });
  } if (password.length < 6) {
    return res.status(400)
      .json({ message: '"password" length must be at least 6 characters long' });
  }

  next();
};

const validRegistrationEmail = async (req, res, next) => {
  const { email } = req.body;

  const pegaAll = await User.findAll();

  pegaAll.forEach((obj) => {
    if (obj.email === email) {
      res.status(409).json({ message: 'User already registered' });
    }
  });

  next();
};

const validRegistrationFinally = async (req, res) => {
  const { email, password } = req.body;

  await User.create(req.body);

  const create = generateToken.createToken({ email, password });

  return res.status(201).json({ token: create });
};

const validateTokenRegistration = (req, _res, next) => {
  const { authorization } = req.headers;

  vToken.validateToken(authorization);

/*   const allList = db.User.findAll({ attributes: { exclude: ['password'] } });

  return res.status(200).json(allList); */

  next();
};

const listAll = async (_req, res) => {
  const allList = await db.User.findAll({ attributes: { exclude: ['password'] } });

  return res.status(200).json(allList);
};

module.exports = {
  ValidateToken,
  validRegistration,
  validRegistrationFinally,
  validRegistrationEmail,
  validateTokenRegistration,
  listAll,
};