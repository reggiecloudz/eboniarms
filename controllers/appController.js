const bcrypt = require('bcrypt');

const ROLE_LIST = require('../models/role_list');
const User = require('../models/User');

exports.landing_page = (req, res) => {
  res.render('landing');
};

exports.login_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render('login', { err: error });
};

exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    req.session.error = 'Invalid Credentials';
    return res.redirect('/login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.session.error = 'Invalid Credentials';
    return res.redirect('/login');
  }

  req.session.isAuth = true;
  req.session.user = user;
  res.redirect('/dashboard');
};

exports.register_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render('register', { err: error });
};

exports.register_post = async (req, res) => {
  const { username, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    req.session.error = 'User already exists';
    return res.redirect('/register');
  }

  const hasdPsw = await bcrypt.hash(password, 12);

  user = new User({
    username,
    email,
    password: hasdPsw,
    roles: [ROLE_LIST.Admin]
  });

  await user.save();
  res.redirect('/login');
};

exports.dashboard_get = (req, res) => {
  const user = req.session.user;
  // console.log(user);
  res.render('dashboard', { user: user });
};

exports.logout_post = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/login');
  });
};

exports.matches_get = (req, res) => {
  res.render('matches');
};

exports.new_message_get = (req, res) => {
  // You can do validation or database stuff before emiting
  req.io.on('connection', (socket) => {
    socket.on('new-message', (msg) => {
      console.log(msg);
      socket.emit('response', 'Message received');
    });
  });
  return res.render('messages');
};
