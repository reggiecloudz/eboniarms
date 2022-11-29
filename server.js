const { createServer } = require('http'); // you can use https as well
const express = require('express');
const socketIo = require('socket.io');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const appController = require('./controllers/appController');
const isAuth = require('./middleware/is-auth');
const verifyRoles = require('./middleware/verifyRoles');
const ROLE_LIST = require('./models/role_list');

const app = express();

const server = createServer(app);
const io = socketIo(server, { cors: { origin: '*' } }); // you can change the cors to your own domain

app.use((req, res, next) => {
  req.io = io;
  return next();
});

const mongoUri = 'mongodb://localhost:27017/eboniarms';

mongoose.connect(mongoUri, {}).then((res) => {
  console.log('MongoDB Connected');
});

const store = new MongoDBSession({
  uri: mongoUri,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('node_modules/bootstrap-icons'));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'VGgxJE4wdDRIdW1Abkl6',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isAuth;
  next();
});

//=================== Routes
// Landing Page
app.get('/', appController.landing_page);

// socket.io
app.get('/new-message', appController.new_message_get);

// Login Page
app.get('/login', appController.login_get);
app.post('/login', appController.login_post);

// Register Page
app.get('/register', appController.register_get);
app.post('/register', appController.register_post);

app.get('/matches', appController.matches_get);

// Dashboard Page
app.get('/dashboard', isAuth, verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Moderator), appController.dashboard_get);

app.get('/logout', appController.logout_post);

app.get('/access-denied', (req, res) => {
  res.render('accessDenied');
});

server.listen(3000, () => console.log(`Server started on port 3000!`));
