const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// need to tell passport what to do with the User
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());