// routes/secretWord.js

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.secretWord) {
      req.session.secretWord = "syzygy"; 
  }
  console.log('Secret word from session on GET:', req.session.secretWord); 
  res.render("secretWord", { secretWord: req.session.secretWord });
});


router.post("/", (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] === "P") {
      req.flash("error", "That word won't work!");
      req.flash("error", "You can't use words that start with P.");
  } else {
      req.session.secretWord = req.body.secretWord;
      req.flash("info", "The secret word was changed.");
  }
  console.log('Secret word set to:', req.session.secretWord); 
  res.redirect("/secretWord");
});



module.exports = router;