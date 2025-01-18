"use strict";
/*jshint esversion: 6 */
const express = require('express');
const app = express();
const cors = require('cors');

// Import MW for parsing POST params in BODY
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Import MW supporting Method Override with express
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const userAPI   = require('./users')
const moviesAPI = require('./movies')


/***************
 *    USERS    *
 ***************/
// POST /user/login
const logInController = (req, res, next) => {
  let {username, password} = req.body;
  if (username.length == 0 || password.length == 0)
    throw Error(`Username or password are empty`)

  userAPI.getUser(username)
  .then(r => {
    if (r == username) {
      userAPI.login(username, password)
      .then(() => {
        res.status(201).send({
          success: 'true',
          message: 'User logged in successfully',
        });
      })
      .catch(error => {next(Error(`User cannot sign in:\n${error}`))});
    } else {
      throw Error(`User ${username} does not exist`)
    }
  })
  .catch(error => {next(error)})
}

// POST /user/register
const registerController = (req, res, next) => {
  let {username, password} = req.body;
  if (username.length == 0 || password.length == 0)
    throw Error(`Username or password are empty`)

  userAPI.register(username, password)
  .then(() => {
    res.status(201).send({
      success: 'true',
      message: 'User registered successfully',
    });
  })
  .catch(error => {next(Error(`User was not registered:\n${error}`))});
}

// GET /user/:user
const getUserController = (req, res, next) => {
  let user = req.params.user;
  if (typeof user === 'undefined' || user.length === 0)
    throw Error('User is not provided')

  userAPI.getUser(user)
  .then(user => {
    res.status(201).send({
      success: 'true',
      user: user,
    });
  })
  .catch(error => next(Error(`Couldn't get ${user}:\n${error}`)));
}

// GET /friends/:user
const getFriendsController = (req, res, next) => {
  let user = req.params.user;
  if (typeof user === 'undefined' || user.length === 0)
    throw Error('User is not provided')

  userAPI.getFriends(user)
  .then(friends => {
    res.status(201).send({
      success: 'true',
      friends: friends,
    });
  })
  .catch(error => next(Error(`Couldn't get ${user}'s friends:\n${error}`)));
}

/****************
 *    MOVIES    *
 ****************/
// GET /movies/title/:title
const getMoviesTitleController = (req, res, next) => {
  let title = req.params.title;
  if (typeof title === 'undefined' || title.length === 0)
    throw Error('User is not provided')

  moviesAPI.getMovies(title)
  .then(movies => {
    res.status(201).send({
      success: 'true',
      movies: movies,
    });
  })
  .catch(error => next(Error(`Couldn't get movies with title ${title}:\n${error}`)));
}

// GET /movies/genres
const getGenresController = (req, res, next) => {
  moviesAPI.getGenres()
  .then(genres => {
    res.status(201).send({
      success: 'true',
      genres: genres
    });
  })
  .catch(error => next(Error(`Couldn't get genres:\n${error}`)));
}


const errorController = (err, req, res, next) => {
  res.status(409).send({
    success: 'false',
    message: err.toString(),
  });
};

// middleware to use for all requests
const logController = (req, res, next) => {
  // do logging
  console.log('req.method = ' + req.method);
  console.log('req.URL = ' + req.originalUrl);
  console.log('req.body = ' + JSON.stringify(req.body));
  console.log("======================");
  //console.log('req.path = ' + req.path);
  //console.log('req.route = ' + req.route);
  next(); // make sure we go to the next routes and don't stop here
};
  
// middleware to use for all requests
const headersController = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, PATCH, DELETE');
  next(); // make sure we go to the next routes and don't stop here
};

app.use(cors());

// ROUTER
app.use ('*',                    logController);
app.use ('*',                    headersController);


// USER ROUTER
app.post('/user/login',          logInController);
app.post('/user/register',       registerController);
app.get ('/user/:user',          getUserController);

// FRIENDS ROUTER
app.get ('/friends/:user',  getFriendsController);

// MOVIES ROUTER
app.get ('/movies/title/:title', getMoviesTitleController);
app.get ('/movies/genres',       getGenresController);

app.use(errorController);

app.all('*', (req, res) =>
  res.status(409).send("Error: resource not found or method not supported")
);

// Server started at port 8000
const PORT = 8000;
app.listen(PORT,
  () => {console.log(`Server running on port ${PORT}`);}
);