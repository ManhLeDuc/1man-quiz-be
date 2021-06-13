const mongoose = require('mongoose');
const QuestionModel = mongoose.model('Questions');
const UserModel = mongoose.model('Users');

const authenOwnerQuestion = (req, res, callback) => {
  if (req.params.questionId && req.payload && req.payload._id) {
    QuestionModel
      .findById(req.params.questionId)
      .exec((err, question) => {
        if (!question) {
          return res
            .status(404)
            .json({ "message": "Question not found" });
        } else if (err) {
          console.log(err);
          return res
            .status(404)
            .json(err);
        } else if ((question.postedBy.toString() !== req.payload._id) && !req.playload.isAdmin) {
          return res
            .status(404)
            .json({ "message": "Bad Request" });
        } else {
          callback(req, res, question);
        }

      });
  } else {
    return res
      .status(404)
      .json({ "message": "Bad Request" });
  }
}

// const getQuestions = (req, res) => {

//   if (req.payload && req.payload._id && req.body.pageSize && req.body.pageNumber) {
//     let condition = {};
//     if (!req.payload.isAdmin) {
//       condition = { postedBy: req.playload._id };
//     }

//     let options = {
//       select: 'question isActive createAt',
//       sort: { createAt: -1, correct_answer: 1 },
//       lean: true,
//       page: req.body.pageNumber,
//       limit: req.body.pageSize,
//     }

//     QuestionModel.paginate(condition, options, (e, docs) => {
//       if (e) {
//         return res
//           .status(404)
//           .json(e);
//       }
//       else {
//         console.log(docs);
//         return res
//           .status(200)
//           .json({ success: true, data: docs });
//       }
//     });
//   }
//   else {
//     return res
//       .status(404)
//       .json({ "message": "Bad Request" });
//   }
// }

const getQuestions = async (req, res) => {
  try {
    if (req.payload && req.payload._id && req.body.pageSize && req.body.pageNumber) {
      let condition = {};
      if (!req.payload.isAdmin) {
        condition = { postedBy: req.playload._id };
      }

      let pageSize = parseInt(req.body.pageSize);
      let pageNumber = parseInt(req.body.pageNumber);

      let result = {};

      let docs = await QuestionModel.find(condition).select({ createAt: 1, _id: 1, question: 1, isActive: 1 }).sort({ createAt: -1, _id: 1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).lean();
      let totalDocs = await QuestionModel.countDocuments(condition);

      let totalPages = Math.ceil(totalDocs/pageSize);

      result.totalPages = totalPages;
      result.docs = docs;

      console.log(result);
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

const postQuestion = async (req, res) => {
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

const putQuestionById = async (req, res) => {
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
        if (question.correct_answer == req.body.answer) {
          user.currentScore += 5;
          result.correct = true;
        }
        else {
          result.correct = false;
          user.remains -= 1;
          if (user.remains == 0) {
            if (user.currentScore > user.bestScore) {
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

const getQuestionById = (req, res) => {

}

const deleteQuestionById = async (req, res) => {
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
        if (question.correct_answer == req.body.answer) {
          user.currentScore += 5;
          result.correct = true;
        }
        else {
          result.correct = false;
          user.remains -= 1;
          if (user.remains == 0) {
            if (user.currentScore > user.bestScore) {
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

module.exports = {
  getQuestionById,
  getQuestions,
  postQuestion,
  putQuestionById,
  deleteQuestionById,
}