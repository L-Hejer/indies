// Require express
const express = require('express');

// Require bcrypt
const bcrypt = require('bcrypt');

// Require the json web token
const jwt = require('jsonwebtoken');

// Require Gravatar
const gravatar = require('gravatar');

const Router = express.Router();

// Require User Model
const User = require('../../models/User');

const isAuth = require('../../middleWares/isAuth');
const authAdmin = require('../../middleWares/authAdmin');

//@route    POST api/user/register
//@desc     Register a new user
///@access  Public
Router.post('/register', async (req, res) => {
  const { name, lastName, email, password, role } = req.body;
  try {
    // Simple Validation
    if (!name || !lastName || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields!' });
    }

    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ msg: 'User already exists!' });
    }
    // Gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm',
    });

    // Create new User
    user = new User({ name, lastName, email, password, role, avatar });

    // Create Salt & hash
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;

    // save User
    await user.save();

    // Sign User
    const payload = {
      id: user._id,
    };

    const token = await jwt.sign(payload, process.env.secretOrKey, {
      expiresIn: '7 days',
    });

    res.status(200).send({ msg: 'User registred with success', user, token });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    POST api/user/login
//@desc     Login user
///@access  Public
Router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Simple Validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields!' });
    }

    // Check for existing user
    let user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: 'User does not exist!' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ msg: 'Bad Credentials!' });
    }

    // sing user
    const payload = {
      id: user._id,
    };

    const token = await jwt.sign(payload, process.env.secretOrKey, {
      expiresIn: '7 days',
    });

    res.status(200).send({ msg: 'User logged in with success', user, token });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    GET api/user/authUser
//@desc     Get authenticated user
///@access  Private
Router.get('/authUser', isAuth, (req, res) => {
  res.status(200).send({ user: req.user });
});

//@route    GET api/user/allUsers
//@desc     Get all users
///@access  Private
Router.get('/allUsers', isAuth, authAdmin, async (req, res) => {
  const users = await User.find().sort({ registerDate: -1 });
  res.send(users);
});

//@route    PUT api/user/:id
//@desc     block a user
///@access  Private
Router.put('/:id', isAuth, authAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (user.status === 'blocked') {
      user.status = 'actif';
    } else {
      user.status = 'blocked';
    }

    // Save user
    user.save();

    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

module.exports = Router;
