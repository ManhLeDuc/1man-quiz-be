const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Questions = mongoose.model('Questions');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    default: "",
  },
  isAdmin:{
    type: Boolean,
    default: false,
  },
  bestScore: { type: Number, default: 0 },
  currentScore: { type: Number, default: 0 },
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Questions',
  },
  remains: { type: Number, default: 3 },
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    isAdmin: this.isAdmin,
    exp: parseInt(expiry.getTime() / 1000, 10),
  }, process.env.JWT_SECRET);
};

userSchema.methods.answer = async function (answer) {
  try {
    let question = mongoose.model('Questions').findById(this.currentQuestion).exec();
    if (!question) {
      this.currentQuestion = await Questions.getRandomQuestion();
    }
    else {
      if (question.checkAnswer(answer)) {
        this.currentScore += 3;
      }
      else {
        this.remains -= 1;
        if (this.remains == 0) {
          if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
          }
          this.currentScore = 0;
          this.remains = 3;
        }
      }
      this.currentQuestion = await Questions.getRandomQuestion();
    }
  }
  catch (e) {
    throw e;
  }
}

mongoose.model('Users', userSchema);