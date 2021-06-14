require('./app_api/models/db');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const QuestionModel = mongoose.model('Questions');
const UserModel = mongoose.model('Users');

function decodeHTMLEntities(text) {
  var entities = [
    ['amp', '&'],
    ['apos', '\''],
    ['#x27', '\''],
    ['#x2F', '/'],
    ['#39', '\''],
    ['#47', '/'],
    ['lt', '<'],
    ['gt', '>'],
    ['nbsp', ' '],
    ['quot', '"']
  ];

  for (var i = 0, max = entities.length; i < max; ++i)
    text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);

  return text;
}

for (let i = 0; i < 40; i++) {
  fetch('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple')
    .then(res => res.json())
    .then(json => {
      for (let result of json.results) {
        QuestionModel.create(
          {
            'question': decodeHTMLEntities(unescape(result.question)),
            'correct_answer': decodeHTMLEntities(unescape(result.correct_answer)),
            'incorrect_answers': result.incorrect_answers.map(answer => decodeHTMLEntities(unescape(answer))),
            'isActive': true,
            'postedBy': "60c77afdfedabc3a38705c67",
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

// let admin = new UserModel();
// admin.isAdmin = true;
// admin.email = 'kun_duc123@yahoo.com.vn';
// admin.name = 'admin';
// admin.setPassword('Vr*8;Kx9,s.+mW)N');
// UserModel.create(admin, (err, doc) => {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(doc);
//   }
// })

