const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload',
  algorithms: ['sha1', 'RS256', 'HS256']
})

const ctrlQuestion = require('../controllers/questions');
const ctrlAuth = require('../controllers/authentication');

// router
//   .route('/questions')
//   .get(auth, ctrlWords.wordsByRegex);

// router
//   .route('/questions/:wordGroupId')
//   .get(auth, ctrWordGroups.getWordGroup)
//   .put(auth, ctrWordGroups.updateWordGroup)
//   .delete(auth, ctrWordGroups.deleteWordGroup);

// router
//   .route('/wordGroups/:wordGroupId/words/:wordId')
//   .get(auth, ctrWordGroups.getWordFromGroup)
//   .put(auth, ctrWordGroups.addWordToGroup)
//   .delete(auth, ctrWordGroups.deleteWordFromGroup);

router
  .route('/me')
  .get(auth, ctrlAuth.userInfo);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;