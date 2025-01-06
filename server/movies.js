const postgres = require('postgres');

function Movies(host="localhost", db="movies", port=5432, username="kmalhal", password="kmalhal") {
  this.sql = postgres({
    host:     host,
    port:     port,
    database: db,
    username: username,
    password: password,
  })

  Movies.prototype.getGenres = function() {

  }
}