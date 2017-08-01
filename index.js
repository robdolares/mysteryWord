const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const morgan = require('morgan');
const expressValidator = require('express-validator');
const session = require('express-session');

const app = express();

// tell express to use handlebars
app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');

// configure session support middleware with express-session
app.use(
  session({
    secret: 'password', // this is a password. make it unique
    resave: false, // don't resave the session into memory if it hasn't changed
    saveUninitialized: true // always create a session, even if we're not storing anything in it.
  })
);

// setup morgan for logging requests
// put above other stuff to log static resources
app.use(morgan('dev'));

// tell express how to serve static files
app.use(express.static('public'));

//tell express to use the bodyParser middleware to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// add express-validator middleware. This adds the checkBody() and presumably
// other methods to the req.
app.use(expressValidator());

// this middleware creates a default session
function newSesh() {
  app.use((req, res, next) => {
    if (!req.session.word) {
      req.session.word = [];
    }
    console.log(req.session);
    next();
  });
};


word = words[Math.floor(Math.random() * words.length)]; //selects random word from library
wordArray = (word).split(""); //splits random word into array
emptyArray = []; //empty array for initial setup
for (var i = 0; i < word.length; i++) {
  emptyArray.push("_"); //creates empty array of same length as word
}
spentCharArray = [];
remTurns = 8;
console.log(wordArray);


// configure the webroot and set emptyArray of word.length
app.get('/', function(req, res) {
  req.session.word = wordArray;
  res.render('home', {
    emptyArray: emptyArray
  })
});


app.post("/charGuess", function(req, res) {

  let charGuess = req.body

  req.checkBody('character', 'Please enter a character').notEmpty();
  req.checkBody('character', 'Only 1 character allowed').len(1, 1);

  req.getValidationResult()

    .then((result) => {
      // do something with the validation result
      let errors = result.array();
      console.log(errors);
      res.render('home', {
        emptyArray: emptyArray,
        errors: errors,
        spentCharArray: spentCharArray
      });
    })

    // .then(()=>{
    //   for (var i = 0; i < spentCharArray.length; i++) {
    //     if (charGuess.character === spentCharArray[i]) {
    //       spentCharArray[i]
    //     }
    //
    //   }
    // })

    .then(() => {
      for (var i = 0; i < wordArray.length; i++) {
        if (charGuess.character === wordArray[i]) {
          emptyArray.splice(i, 1, charGuess.character);
          spentCharArray.push(charGuess.character);

          console.log(emptyArray);
        }
      }
    })

  // .then(()=>{
  //
  //
  //
  //
  //
  // })





});









app.listen(3000);
