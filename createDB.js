require('./app_api/models/db');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const QuestionModel = mongoose.model('Questions');

for (let i = 0; i < 20; i++) {
  fetch('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple')
    .then(res => res.json())
    .then(json => {
      for (let result of json.results) {
        QuestionModel.create(
          {
            'question': result.question,
            'correct_answer': result.correct_answer,
            'incorrect_answers': result.incorrect_answers,
            'isActive': true,
          }, (err, doc) => {
            if (err) {
              console.log(err);
            }
            else {
              console.log(doc);
            }
          })
      }

    });
}

