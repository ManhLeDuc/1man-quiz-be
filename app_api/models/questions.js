const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    require: true,
    default: ["","",""],
    validate: [arrayLimit, 'Answers must be 4']
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: new Date(),
  }
});

function arrayLimit(val) {
  return val.length == 3;
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

QuestionSchema.plugin(mongoosePaginate);

mongoose.model('Questions', QuestionSchema);