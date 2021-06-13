const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('Users');

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const register = (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ "message": "All fields required" });
  }

  if (!emailRegex.test(req.body.email)) {
    res.status(400).json({
      message: 'Invalid email adress',
    });
  } else if (req.body.password.length < 6) {
    res.status(400).json({
      message: 'Password must be at least 6 characters',
    });
  } else {
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.save((err) => {
      if (err) {
        res
          .status(400)
          .json(err);
      } else {
        const token = user.generateJwt();
        res
          .status(200)
          .json({ token });
      }
    });
  }

};

const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ "message": "All fields required" });
  }
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res
        .status(404)
        .json(err);
    }
    if (user) {
      const token = user.generateJwt();
      res
        .status(200)
        .json({ token });
    } else {
      res
        .status(401)
        .json(info);
    }
  })(req, res);
};

const userInfo = (req, res) => {
  if (req.payload && req.payload._id) {
    User
      .findById(req.payload._id, { hash: 0, salt: 0 })
      .exec((err, user) => {
        if (!user) {
          return res
            .status(404)
            .json({ "message": "User not found" });
        }
        else if (err) {
          return res
            .status(404)
            .json(err);
        }
        else {
          res.json({name: user.name, email: user.email, avatarUrl: user.avatarUrl, bestScore: user.bestScore, isAdmin: user.isAdmin});
        }

      });
  } else {
    return res
      .status(404)
      .json({ "message": "User not found" });
  }
}

module.exports = {
  register,
  login,
  userInfo
};
