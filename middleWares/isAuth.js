// Require Json Web Token
const jwt = require('jsonwebtoken');

// Require the User Schema
const User = require('../models/User');

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers['x-auth-token'];

    // Check for token
    if (!token) {
      return res.status(401).send({ msg: 'No token, authorization denied' });
    }

    // Decode the token
    const decoded = await jwt.verify(token, process.env.secretOrKey);

    // Add user from payload
    const user = await User.findById(decoded.id);

    // Check for user
    if (!user) {
      return res.status(401).send({ msg: 'authorization denied' });
    }

    // Create user
    req.user = user;

    next();
  } catch (error) {
    return res.status(400).send({ msg: 'Token is not valid' });
  }
};

module.exports = isAuth;
