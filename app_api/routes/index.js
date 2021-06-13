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
  // fileFilter: (req,file,callback)=>{
  //   console.log(file);
  //   console.log(req.file);
  limits: {
    fileSize: 5000000
  }
});

const ctrlQuestion = require('../controllers/questions');
const ctrlAuth = require('../controllers/authentication');
const ctrlUser = require('../controllers/users');

router
  .route('/play')
  .put(auth, ctrlQuestion.play);

router
  .route('/answer')
  .put(auth, ctrlQuestion.answer);

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

router
  .route('/user/update')
  .put(auth, multerStorage.single('image'), ctrlUser.update);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;