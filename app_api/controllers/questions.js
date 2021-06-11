const mongoose = require('mongoose');
const Question = mongoose.model('Questions');

const authenOwnerWordGroup = (req, res, callback) => {
  if (req.params.wordGroupId && req.payload && req.payload._id) {
    WordGroupModel
      .findById(req.params.wordGroupId)
      .exec((err, wordGroup) => {
        if (!wordGroup) {
          return res
            .status(404)
            .json({ "message": "Word Group not found" });
        } else if (err) {
          console.log(err);
          return res
            .status(404)
            .json(err);
        } else if (wordGroup.owner.toString() !== req.payload._id) {
          return res
            .status(404)
            .json({ "message": "Bad Request" });
        } else {
          callback(req, res, wordGroup);
        }

      });
  } else {
    return res
      .status(404)
      .json({ "message": "Bad Request" });
  }
}

const validateWordId = (req, res, callback) => {
  WordModel.findById(req.params.wordId).exec((err, wordRecord) => {
    if (err) {
      return res
        .status(404)
        .json(err);
    }
    else if (!wordRecord) {
      return res
        .status(404)
        .json({ message: "Invalid Word ID" });
    }
    else {
      callback(req, res, wordRecord)
    }
  })
}

const createWordGroup = (req, res) => {
  WordGroupModel.create({
    name: req.body.name,
    owner: req.payload._id,
    wordIds: [],
  },
    (err, wGroup) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json(err);
      }
      else {
        res
          .status(200)
          .json(wGroup);
      }
    });
}

const updateWordGroup = (req, res) => {
  authenOwnerWordGroup(req, res,
    (req, res, wordGroup) => {
      wordGroup.name = req.body.name;
      wordGroup.save((err, wGroup) => {
        if (err) {
          res
            .status(404)
            .json(err);
        } else {
          res
            .status(200)
            .json(wGroup);
        }
      })
    });
}

const deleteWordGroup = (req, res) => {
  authenOwnerWordGroup(req, res,
    (req, res, wordGroup) => {
      WordGroupModel
        .findByIdAndDelete(wordGroup._id)
        .exec((err, wGroup) => {
          if (err) {
            return res
              .status(404)
              .json(err);
          }
          else {
            return res
              .status(200)
              .json({success: true});
          }
        });
    });
}

const getAllWordGroups = (req, res) => {
  if (req.payload && req.payload._id) {
    WordGroupModel
      .find({ 'owner': req.payload._id })
      .select('name')
      .exec((err, records) => {
        if (err) {
          return res
            .status(404)
            .json(err);
        }
        else {
          return res
            .status(200)
            .json(records);
        }
      })
  }
  else {
    return res
      .status(404)
      .json({ "message": "Bad Request" });
  }
}

const getWordGroup = (req, res) => {
  authenOwnerWordGroup(req, res,
    (req, res, wordGroup) => {
      WordModel
        .find()
        .where('_id')
        .in(wordGroup.wordIds)
        .select({ "word": 1, "_id": 0 })
        .exec((err, wordRecords) => {
          if (err) {
            return res
              .status(404)
              .json(err);
          }
          else {
            return res
              .status(200)
              .json({
                wGroup: wordGroup,
                words: wordRecords
              });
          }
        })

    });
};

const getWordFromGroup = (req, res) => {
  authenOwnerWordGroup(req, res,
    (req, res, wordGroup) => {
      validateWordId(req, res,
        (req, res, wordRecord) => {
          return res
            .status(200)
            .json(wordRecord);
        })
    });
}

const addWordToGroup = (req, res) => {
  authenOwnerWordGroup(req, res,
    (req, res, wordGroup) => {
      validateWordId(req, res,
        (req, res, wordRecord) => {
          wordGroup.wordIds.addToSet(req.params.wordId);
          wordGroup.save((err, wGroup) => {
            if (err) {
              return res
                .status(404)
                .json(err);
            }
            else {
              return res
                .status(200)
                .json(wGroup);
            }
          })
        })

    }
  )
};

const deleteWordFromGroup = (req, res) => {
  authenOwnerWordGroup(req, res,
    (req, res, wordGroup) => {
      validateWordId(req, res,
        (req, res, wordRecord) => {

          if (!wordGroup.wordIds.includes(req.params.wordId)) {
            return res
              .status(404)
              .json({ message: 'Word not found in Group' });
          }
          else {
            wordGroup.wordIds.remove(req.params.wordId);
            wordGroup.save((err, wGroup) => {
              if (err) {
                return res
                  .status(404)
                  .json(err);
              }
              else {
                return res
                  .status(200)
                  .json(wGroup);
              }
            });
          }

        });
    });
}



module.exports = {
  createWordGroup,
  updateWordGroup,
  deleteWordGroup,
  getAllWordGroups,
  getWordGroup,
  getWordFromGroup,
  addWordToGroup,
  deleteWordFromGroup
}