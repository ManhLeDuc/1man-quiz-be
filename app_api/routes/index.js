const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const multer = require('multer');

const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload',
  algorithms: ['sha1', 'RS256', 'HS256']
});

const multerStorage = multer({
  dest: 'public/',
  limits: {
    fileSize: 5000000
  }
});

const ctrlQuestion = require('../controllers/questions');
const ctrlAuth = require('../controllers/authentication');
const ctrlUser = require('../controllers/users');
const ctrlPlay = require('../controllers/play');

router
  .route('/play')
  .put(auth, ctrlPlay.play);

router
  .route('/answer')
  .put(auth, ctrlPlay.answer);

router
  .route('/questions')
  .put(auth, ctrlQuestion.getQuestions)
  .post(auth, ctrlQuestion.postQuestion);

router
  .route('/questions/:questionId')
  .get(auth, ctrlQuestion.getQuestionById)
  .put(auth, ctrlQuestion.putQuestionById)
  .delete(auth, ctrlQuestion.deleteQuestionById);

router
  .route('/me')
  .get(auth, ctrlAuth.userInfo);

router
  .route('/user/update')
  .put(auth, multerStorage.single('image'), ctrlUser.update);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;