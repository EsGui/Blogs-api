const db = require('../database/models');
const { User, Category, BlogPost } = require('../database/models');
const authService = require('../services/authServices');
const postService = require('../services/postServices');
const { findById } = require('../services/postServices');

const validateTokenRegistration = (req, _res, next) => {
  const { authorization } = req.headers;

  authService.authToken(authorization);

  next();
};

const listAll = async (_req, res) => {
  const allList = await db.User.findAll({ attributes: { exclude: ['password'] } });

  return res.status(200).json(allList);
};

const listOne = async (req, res, next) => {
  const { authorization } = req.headers;

  const user = await db.User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

  if (!user) {
    return res.status(404).json({ message: 'User does not exist' });
  } if (!authorization) {
    return res.status(401).json({ message: 'Token not found' });
  }

  next();
};

const listOneFinally = async (req, res) => {
  const user = await db.User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

  res.status(200).json(user);
};

const registrationCategories = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: '"name" is required' });
  }

  await db.Category.create({ name });

  const idCategory = await db.Category.findAll();

  return res.status(201).json({ id: idCategory.length, name });
};

const listCategories = async (req, res) => {
  const list = await Category.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] } });

  console.log(list);

  return res.status(200).json(list);
};

const listPost = async (req, res) => {
  const { authorization } = req.headers;
  const { title, content, categoryIds } = req.body;

  const { data: email } = authService.authToken(authorization);

  const listCategory = await Category
    .findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] } });

  const v = postService.fieldsfilled(title, content, categoryIds);

  if (v) return res.status(400).json({ message: 'Some required fields are missing' });

  const ExistCategory = postService.categoryExist(categoryIds, listCategory);

  if (!ExistCategory) return res.status(400).json({ message: '"categoryIds" not found' });

  const allPost = await BlogPost.findAll();

  const idUser = await User.findAll({ where: { email: email.email } });

  await postService.createBlogPost(allPost.length + 1, idUser[0].id, title, content);

  const idPost = await BlogPost.findOne({ where: { id: allPost.length + 1 } });

  const createPost = categoryIds
    .reduce((inicio, fim) => inicio.concat({ categoriesId: fim, postId: idPost.id }), []);

  await postService.createPostCategory(createPost);

  const listPostCategory = await findById(allPost.length + 1);

  return res.status(201).json(listPostCategory[0]);
};

module.exports = {
  listOne,
  validateTokenRegistration,
  listOneFinally,
  listCategories,
  registrationCategories,
  listAll,
  listPost,
};