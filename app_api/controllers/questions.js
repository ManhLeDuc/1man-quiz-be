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
        } else if ((question.postedBy.toString() !== req.payload._id) && !req.payload.isAdmin) {
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

const getQuestions = async (req, res) => {
  try {
    if (req.payload && req.payload._id && req.body.pageSize && req.body.pageNumber) {
      let condition = {};
      if (!req.payload.isAdmin) {
        condition = { postedBy: req.payload._id };
      }

      let pageSize = parseInt(req.body.pageSize);
      let pageNumber = parseInt(req.body.pageNumber);

      let result = {};

      let docs = await QuestionModel.find(condition).select({ createAt: 1, _id: 1, question: 1, isActive: 1 }).sort({ createAt: -1, _id: 1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).lean();
      let totalDocs = await QuestionModel.countDocuments(condition);

      let totalPages = Math.ceil(totalDocs / pageSize);

      result.totalPages = totalPages;
      result.docs = docs;

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

const postQuestion = (req, res) => {
  if (req.payload && req.payload._id) {
    if (req.body.incorrect_answers && Array.isArray(req.body.incorrect_answers) && req.body.incorrect_answers.length == 3) {
      const question = new QuestionModel();
      question.question = req.body.question;
      question.correct_answer = req.body.correct_answer;
      question.incorrect_answers = req.body.incorrect_answers;
      question.postedBy = req.payload._id;
      question.save((err, doc) => {
        if (err) {
          return res.status(404).json(err);
        }
        else {
          return res.status(200).json({ success: true, data: doc });
        }
      })
    }
    else {
      return res
        .status(404)
        .json({ "message": "Bad Request" });
    }
  }
  else {
    return res
      .status(404)
      .json({ "message": "Bad Request" });
  }
}

const putQuestionById = (req, res) => {
  authenOwnerQuestion(req, res,
    (req, res, question) => {
      if (question.isActive && !req.payload.isAdmin) {
        res.status(404).json({ "message": "Bad Request" });
      }
      else {
        if (req.body.question) {
          question.question = req.body.question;
        }

        if (req.body.correct_answer) {
          question.correct_answer = req.body.correct_answer;
        }

        if (req.body.incorrect_answers) {
          question.incorrect_answers = req.body.incorrect_answers;
        }

        question.save((err, doc) => {
          if (err) {
            return res.status(500).json(err);
          }
          else {
            return res.status(200).json({ success: true });
          }
        })
      }

    })
}

const getQuestionById = (req, res) => {
  authenOwnerQuestion(req, res,
    (req, res, question) => {
      return res.status(200).json(question);
    })
}

const deleteQuestionById = (req, res) => {
  authenOwnerQuestion(req, res,
    (req, res, question) => {
      if (question.isActive && !req.payload.isAdmin) {
        return res.status(404).json({ "message": "Bad Request" });
      }
      else {
        QuestionModel.findByIdAndDelete(question._id).exec((err, doc) => {
          if (err) {
            return res.status(500).json(err);
          }
          else {
            return res.status(200).json({ success: true });
          }
        })
      }

    })
}

const activeQuestion = (req, res) => {
  if (req.payload && req.payload._id && req.payload.isAdmin) {
    let isActive = Boolean(req.body.isActive);
    QuestionModel.findById(req.params.questionId).exec((err, question) => {
      if (err) {
        return res.status(404).json(err);
      }
      else {
        question.isActive = isActive;
        question.save((e, doc) => {
          if (e) {
            return res.status(500).json(e);
          }
          else {
            return res.status(200).json({ success: true });
          }
        })
      }
    })
  }
  else {
    return res.status(404).json({ "message": "Bad Request" });
  }
}

module.exports = {
  getQuestionById,
  getQuestions,
  postQuestion,
  putQuestionById,
  deleteQuestionById,
  activeQuestion,
}