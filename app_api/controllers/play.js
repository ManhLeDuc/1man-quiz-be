const mongoose = require('mongoose');
const QuestionModel = mongoose.model('Questions');
const UserModel = mongoose.model('Users');

const play = async (req, res) => {
  try {
    if (req.payload && req.payload._id) {
      let user = await UserModel.findById(req.payload._id).exec();

      let result = {};
      result.remains = user.remains;
      result.currentScore = user.currentScore;
      let question = await QuestionModel.findById(user.currentQuestion).exec();

      while (!question) {
        user.currentQuestion = await QuestionModel.getRandomQuestion();
        await user.save();
        question = await QuestionModel.findById(user.currentQuestion);
      }

      const shuffle = (array) => {
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
      };

      let answers = [];

      answers.push(question.correct_answer);
      for (let i of question.incorrect_answers) {
        answers.push(i);
      }

      shuffle(answers);
      result.answers = answers;
      result.question = question.question;

      return res
        .status(200)
        .json({ success: true, data: result });
    }
    else {
      return res
        .status(404)
        .json({ "message": "Bad Request" });
    }
  }
  catch (e) {
    console.log(e);
    return res
      .status(500)
      .json(e);
  }

}

const answer = async (req, res) => {
  try {
    if (req.payload && req.payload._id) {
      let user = await UserModel.findById(req.payload._id).exec();

      let result = {};
      let question = await QuestionModel.findById(user.currentQuestion).exec();

      if (!question) {
        user.currentQuestion = await QuestionModel.getRandomQuestion();
        await user.save();
        return res
          .status(200)
          .json({ success: false, message: "Can not find question" });
      }

      else {
        result.correct_answer = question.correct_answer;
        if(question.correct_answer == req.body.answer){
          user.currentScore += 5;
          result.correct = true;
        }
        else {
          result.correct = false;
          user.remains -= 1;
          if(user.remains == 0){
            if(user.currentScore>user.bestScore){
              user.bestScore = user.currentScore;
            }
            result.gameOverScore = user.currentScore;
            user.currentScore = 0;
            user.remains = 3;
          }
          
        }

        user.currentQuestion = await QuestionModel.getRandomQuestion();

        await user.save();

        return res
          .status(200)
          .json({ success: true, data: result });
      }

    }
    else {
      return res
        .status(404)
        .json({ "message": "Bad Request" });
    }
  }
  catch (e) {
    console.log(e);
    return res
      .status(500)
      .json(e);
  }
}

module.exports = { play, answer }