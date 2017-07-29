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
app.use((req, res, next) => {

  if (!req.session.word) {

    req.session.word = words[Math.floor(Math.random() * words.length)];   //selects random word from library
    req.session.wordArray = (req.session.word).split("");                 //splits random word into array
    req.session.emptyArray = [];
    for (var i = 0; i < req.session.word.length; i++) {
      req.session.emptyArray.push("_");                                   //creates empty array of same length as word
    }
  }
  console.log(req.session);
  next();
});

let countdown = 8;
let usedArray = [];


// configure the webroot and set emptyArray of word.length
app.get('/', function(req, res) {

  res.render('home', {
    emptyArray: req.session.emptyArray

  })
});


app.post("/charGuess", function(req, res) {

  let charGuess = req.body

  req.checkBody('character', 'Enter 1 character').notEmpty().len(1, 1);

  req.getValidationResult().then(result => {
    let errors = result.useFirstErrorOnly().array();
    if (errors === true) {
      res.render('home', {
        emptyArray: req.session.emptyArray,
        errors:errors
      });
      res.redirect('/')
    } else {

      for (var i = 0; i < req.session.wordArray.length; i++) {
        if (charGuess.character === req.session.wordArray[i]) {
          req.session.emptyArray.splice(i , 1 , charGuess.character);
          res.render('home',{
            emptyArray:req.session.emptyArray,
          });
          usedArray.push(charGuess.character)
      
        } else {
          usedArray.push(charGuess.character)
          countdown -=1;
          console.log(countdown)

        }
      }

      // res.render('home', {
      //   emptyArray:req.session.emptyArray,
      //   // errors:errors
      // })
    }


  });

});



app.listen(3000);