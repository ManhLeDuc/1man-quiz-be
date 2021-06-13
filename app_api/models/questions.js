const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    require: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  correct_answer: { type: String, required: true },
  incorrect_answers: {
    type: [{
      type: String,
    }],
    validate: [arrayLimit, 'Answers exceeds the limit of 4']
  },
  isActive: {
    type: Boolean,
    default: false,
  }
});

function arrayLimit(val) {
  return val.length <= 3;
}

QuestionSchema.statics.getRandomQuestion = async () => {
  try {
    var count = await mongoose.model('Questions').countDocuments({isActive: true}).exec();
    var random = Math.floor(Math.random() * count);
    var doc = await mongoose.model('Questions').findOne({isActive: true}).skip(random).exec();
    return doc._id;
  }
  catch (e) {
    throw e;
  }
}

mongoose.model('Questions', QuestionSchema);