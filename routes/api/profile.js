// Require express
const express = require('express');

const Router = express.Router();

// Require User Model
const User = require('../../models/User');

// Require Profile Model
const Profile = require('../../models/Profile');

const isAuth = require('../../middleWares/isAuth');
const authAdmin = require('../../middleWares/authAdmin');

//@route    POST api/profile
//@desc     Create || Update profile
///@access  Private
Router.post('/', isAuth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    ).populate('user', ['name', 'avatar']);

    // Save profile
    profile.save();

    res.status(200).send({ msg: 'Profile created/updates', profile });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    GET api/profile/user/:id
//@desc     Get profile by user id
///@access  public
Router.get('/user/:id', isAuth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.id,
    }).populate('user', ['name', 'avatar']);
    // Check for profile
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(200).send(profile);
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    DELETE api/profile/:id
//@desc     Get profile by user id
///@access  Private
Router.delete('/:id', isAuth, async (req, res) => {
  try {
    // remove profile
    const profileToDelete = await Profile.findOneAndRemove({
      user: req.user.id,
    });
    res.status(200).send({ msg: 'Profile removed', profileToDelete });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    GET api/profile/allProfiles
//@desc     Get all profiles
///@access  Private
Router.get('/allProfiles', isAuth, authAdmin, async (req, res) => {
  try {
    const profiles = await Profile.find();

    res.send(profiles);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: 'Server Error', error });
  }
});

module.exports = Router;
