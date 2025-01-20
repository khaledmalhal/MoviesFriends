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
      .catch(error => {next(error)});
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

  userAPI.getUser(username)
  .then(r => {
    if (r == username)
      throw Error(`User ${username} already exists.`)
  })
  .catch(r => {
    userAPI.register(username, password)
    .then(() => {
      res.status(201).send({
        success: 'true',
        message: 'User registered successfully',
      });
    })
    .catch(error => {next(Error(`User was not registered:\n${error}`))});
  })
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

// POST /friends/add
const addFriendsController = (req, res, next) => {
  let {username, friend} = req.body;
  if (username.length == 0 || friend.length == 0)
    throw Error(`Username or friend are empty.`)
  if (username == friend)
    throw Error(`You can't add yourself as a friend.`)

  userAPI.getUser(username)
  .then(r1 => {
    if (r1 == username) {
      userAPI.getUser(friend)
      .then(r2 => {
        if (r2 == friend) {
          userAPI.addFriend(username, friend)
          .then(() => {
            res.status(201).send({
              success: 'true',
              message: 'Friend added successfully',
            });
          })
          .catch(error => {next(error)});
        }
      })
      .catch(error => {next(new Error(`User ${friend} does not exist.`))});
    }
  })
  .catch(error => {next(new Error(`User ${username} does not exist.`))});
}

// DELETE /friends/delete
const deleteFriendsController = (req, res, next) => {
  let {username, friend} = req.body;
  if (username.length == 0 || friend.length == 0)
    throw Error(`Username or friend are empty.`)
  if (username == friend)
    throw Error(`You can't remove yourself as a friend.`)

  userAPI.getUser(username)
  .then(r1 => {
    if (r1 == username) {
      userAPI.getUser(friend)
      .then(r2 => {
        if (r2 == friend) {
          userAPI.removeFriend(username, friend)
          .then(() => {
            res.status(201).send({
              success: 'true',
              message: 'Friend removed successfully',
            });
          })
          .catch(error => {next(error)});
        }
      })
      .catch(error => {next(new Error(`User ${friend} does not exist.`))});
    }
  })
  .catch(error => {next(new Error(`User ${username} does not exist.`))});
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

// GET /movies/favorite/:user
const getFavoritesController = (req, res, next) => {
  let user = req.params.user

  userAPI.getUser(user)
  .then(r => {
    if (r !== user)
      throw(Error('User does not exist'))
    moviesAPI.getFavoritesFromUser(user)
    .then(r => {
      res.status(201).send({
        success: 'true',
        favorites: r
      });
    })
    .catch(error => {next(error)});
  })
  .catch(error => {next(error)})
}

// POST /movies/favorite/add
const addFavoriteMovieController = (req, res, next) => {
  let {username, movie_id} = req.body;
  movie_id = Number(movie_id);
  if (username.length == 0)
    throw Error(`Username is empty.`)
  if (movie_id < 0)
    throw Error(`Invalid movie_id.`)

  moviesAPI.getMovie(movie_id)
  .then(r => {
    if (Number(r.movie_id) !== movie_id) {
      throw Error(`Error getting movie to add as favorite.`)
    }
    moviesAPI.addFavorites(username, movie_id)
    .then(r => {
      res.status(201).send({
        success: 'true',
        message: 'Movie added as favorite successfully.'
      })
    })
    .catch(error => next(error));
  })
  .catch(error => next(error));
}

// DELETE /movies/favorite
const deleteFavoriteMovieController = (req, res, next) => {
  let {username, movie_id} = req.body;
  movie_id = Number(movie_id);
  if (username.length == 0)
    throw Error(`Username is empty.`)
  if (movie_id < 0)
    throw Error(`Invalid movie_id.`)

  moviesAPI.getMovie(movie_id)
  .then(r => {
    if (Number(r.movie_id) !== movie_id) {
      throw Error(`Error deleting movie as favorite.`)
    }
    moviesAPI.deleteFavorite(username, movie_id)
    .then(r => {
      res.status(201).send({
        success: 'true',
        message: 'Movie removed as favorite successfully.'
      })
    })
    .catch(error => next(error));
  })
  .catch(error => next(error));
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
app.get   ('/friends/:user',     getFriendsController);
app.post  ('/friends/add',       addFriendsController);
app.delete('/friends/delete',    deleteFriendsController);

// MOVIES ROUTER
app.get ('/movies/title/:title', getMoviesTitleController);
app.get ('/movies/genres',       getGenresController);

// FAVORITES ROUTER
app.get   ('/movies/favorite/:user',  getFavoritesController);
app.post  ('/movies/favorite/add',    addFavoriteMovieController);
app.delete('/movies/favorite/delete', deleteFavoriteMovieController);


app.use(errorController);

app.all('*', (req, res) =>
  res.status(409).send("Error: resource not found or method not supported")
);

// Server started at port 8000
const PORT = 8000;
app.listen(PORT,
  () => {console.log(`Server running on port ${PORT}`);}
);