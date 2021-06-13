const mongoose = require('mongoose');
const UserModel = mongoose.model('Users');
const fs = require('fs');

const update = async (req, res) => {
  try {
    if (req.payload && req.payload._id) {
      let user = await UserModel.findById(req.payload._id).exec();

      if (!req.body.name && !req.file) {
        return res
          .status(404)
          .json({ "message": "Nothing to upload" });
      }

      if (req.body.name) {
        user.name = req.body.name;
      }

      if (req.file) {
        const fileExt = req.file.originalname.split('.');
        const ext = fileExt[fileExt.length - 1];
        fs.renameSync(req.file.path, `public/${req.file.filename}.${ext}`);
        user.avatarUrl = `/${req.file.filename}.${ext}`;
      }

      await user.save();

      return res
        .status(200)
        .json({ success: true, data: {name: user.name, avatarUrl: user.avatarUrl} });
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

const getBestScore = async (req, res) => {
  try {
    if (req.payload && req.payload._id) {
      let user = await UserModel.findById(req.payload._id).exec();
      return res
        .status(200)
        .json({ success: true, data: user.bestScore });
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

module.exports = { update, getBestScore }