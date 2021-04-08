// Require mongoose
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  website: {
    type: String,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
  },
  language: {
    type: [String],
  },
  social: {
    youtube: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    github: { type: String },
    instagram: { type: String },
    twitter: { type: String },
  },
  location: {
    country: { type: String },
    city: { type: String },
    /*    required: true, */
  },
  ProfileCreationDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
