// Import required modules
require("dotenv").config(); // Loads environment variables from .env file
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session); // MongoDB store for sessions
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware to parse the body of incoming requests
app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB URI from environment variables
const url = process.env.MONGO_URI; // Mongo URI from .env file

// Set up MongoDB session store
const store = new MongoDBStore({
  uri: url, // URI for MongoDB connection
  collection: "mySessions", // The name of the collection to store session data
});

// Import required modules
const flash = require("connect-flash");

// Handle MongoDB store errors
store.on("error", function (error) {
  console.log(error); // Log any errors related to MongoDB store
});

// Session configuration
const sessionParms = {
  secret: process.env.SESSION_SECRET, // Secret key from .env file
  resave: true, // Resave session even if it wasn't modified
  saveUninitialized: true, // Save session even if it is empty
  store: store, // Store sessions in MongoDB
  cookie: { secure: false, sameSite: "strict" }, // Cookie settings
};

// For production environments, enable secure cookies
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // Trust first proxy
  sessionParms.cookie.secure = true; // Enable secure cookies
}

// Apply session middleware with MongoDB store
app.use(session(sessionParms));
app.use(require("connect-flash")());

// GET route to display the secret word
app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");

  res.render("secretWord", {
    secretWord: req.session.secretWord,
  });
});

// POST route to update the secret word
app.post("/secretWord", (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] == "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Log the server URL
});
