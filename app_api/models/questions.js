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
    var count = await this.count().exec();
    var random = Math.floor(Math.random() * count);
    var doc = await this.findOne().skip(random).exec();
    return doc._id;
  }
  catch (e) {
    throw e;
  }
}

QuestionSchema.methods.getAnswers = () => {

  function shuffle(array) {
    var currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }
  let result = [];
  result.push(this.correct_answer);
  for(let i of this.incorrect_answers){
    result.push(i);
  }

  shuffle(result);
  return result;
}

QuestionSchema.methods.checkAnswer = (answer)=>{
  return this.correct_answer == answer;
}

mongoose.model('Questions', QuestionSchema);