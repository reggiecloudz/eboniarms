const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const appController = require("./controllers/appController");
const isAuth = require("./middleware/is-auth");
const verifyRoles = require("./middleware/verifyRoles");
const ROLE_LIST = require("./models/role_list");

const app = express();

const mongoUri = "mongodb://localhost:27017/eboniarms";

mongoose.connect(mongoUri, {}).then((res) => {
    console.log("MongoDB Connected");
});

const store = new MongoDBSession({
    uri: mongoUri,
    collection: "sessions",
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "VGgxJE4wdDRIdW1Abkl6",
    resave: false,
    saveUninitialized: false,
    store: store
}));

//=================== Routes
// Landing Page
app.get("/", appController.landing_page);

// Login Page
app.get("/login", appController.login_get);
app.post("/login", appController.login_post);

// Register Page
app.get("/register", appController.register_get);
app.post("/register", appController.register_post);

// Dashboard Page
app.get("/dashboard", isAuth, verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Moderator), appController.dashboard_get);

app.post("/logout", appController.logout_post);

app.get("/access-denied", (req, res) => {
    res.render("accessDenied");
});

app.listen(3000, console.log("Server running on http://localhost:3000"));