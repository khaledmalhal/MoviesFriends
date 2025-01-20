/*jshint esversion: 6 */

$(function() {

function Movies(API_URL) {
  this.url    = API_URL;
  this.user   = Cookie.get('user')   ? JSON.parse(Cookie.get('user'))   : '';
  this.search = Cookie.get('search') ? JSON.parse(Cookie.get('search')) : '';
  this.favorites = [];

  Movies.prototype.showMoviesPage = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
      Cookie.delete('user');
      window.location.href = './index.html'
    } else {
      $('.movies_body').html(`
        <div class="row row-gap-2 m-3">
          <input type="text"   class="col-auto m-2 w-25 search form-control" value="${this.search}" placeholder="Search for a movie title" onfocus="let v=this.value; this.value=''; this.value=v">
          <input type="button" class="col-auto m-2 btn btn-primary justify-content-center bsearch" value="Search"></input>
          <label class="movies-msg"></label>
        </div>
        <hr>
        <div class="movies-list"></div>`)
      this.searchMovies();
    }
  };

  Movies.prototype.searchMovies = function() {
    if (typeof this.search === 'undefined' || this.search.length === 0) {
      Cookie.delete('search')
      $('.movies-list').html(this.listMovies([]))
      return;
    }
    this.getFavorites();

    Cookie.set('search', JSON.stringify(this.search), 7);
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: this.url+'title/'+this.search
    })
    .then(r => {
      if (r.movies.length > 0) {
        $('.movies-msg').text('')
        $('.movies-list').html(this.listMovies(r.movies))
      }
    })
    .catch(error => {
      $('.movies-msg').removeClass('text-success');
      $('.movies-msg').addClass('text-danger');
      $('.movies-msg').text(error.responseJSON.message)
    })
  };

  Movies.prototype.listMovies = function(movies) {
    if (movies.length === 0) {
      return ''
    }
    console.log(this.favorites)
    return `
    <div class="container-fluid d-flex justify-content-between">
      <div class="row">` +
    movies.reduce((ac, movie) => ac += `
    <div class="col p-3">
      <div class="card min-vw-25" style="width: 25vw; min-width: 350px;">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <hr>
          <p class="card-text">Release date: ${movie.release_date.split('T')[0]}</p>
          <p class="card-text">Homepage: 
            <a href="${movie.homepage}">${movie.homepage}</a>
          </p>
          <p class="card-text">Runtime: ${movie.runtime} minutes</p>
          <p class="card-text">Budget: $${movie.budget}</p>
          <p class="card-text">Revenue: $${movie.revenue}</p>
          <p class="card-text">Vote average: ${movie.vote_average}/10</p>
          <div class="d-flex justify-content-evenly m-1">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#sinopsis-${movie.movie_id}">
              Sinopsis
            </button>
            ${this.favorites.some(el => el.movie_id === movie.movie_id) ?
            `<button type="button" class="btn btn-danger remove-movie" movie-id="${movie.movie_id}" remove-movie-${movie.movie_id}">
              Remove from favorites
            </button>` :
            `<button type="button" class="btn btn-success add-movie" movie-id="${movie.movie_id}" add-movie-${movie.movie_id}">
              Add to favorites
            </button>`
            }
          </div>
        </div>
      </div>
      <div class="modal fade" id="sinopsis-${movie.movie_id}" tabindex="-1" aria-labelledby="sinopsis-${movie.movie_id}-label" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="sinopsis-${movie.movie_id}-label">${movie.title}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">${movie.overview}</div>
          </div>
        </div>
      </div>
    </div>
    `, "") + `</div></div>`
  }

  Movies.prototype.getFavorites = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
      $('.movies-msg').removeClass('text-success');
      $('.movies-msg').addClass('text-danger');
      $('.movies-msg').text(`Error with user. Try reloading the page.`)
    }
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: this.url+'favorite/'+this.user
    })
    .then(r => {
      if (Object.hasOwn(r, 'favorites')) {
        console.log(r.favorites)
        // this.favorites.length = 0
        // r.favorites.forEach(element => {
        //   this.favorites.push(element)
        // });
        this.favorites = r.favorites.map((favorite) => favorite)
      }
    })
    .catch(error => {
      console.log(error)
      $('.movies-msg').removeClass('text-success');
      $('.movies-msg').addClass('text-danger');
      $('.movies-msg').text(`Error at getting ${this.user}'s favorite movies.`)
      return []
    })
  }

  Movies.prototype.addFavorite = function(movie_id) {
    const params = {
      username: this.user,
      movie_id: movie_id
    }
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: this.url+'favorite/add',
      data: params
    })
    .then(r => {
      $('.movies-msg').addClass('text-success');
      $('.movies-msg').removeClass('text-danger');
      $('.movies-msg').text(`${r.message}`);
      this.searchMovies();
    })
    .catch(error => {
      $('.movies-msg').removeClass('text-success');
      $('.movies-msg').addClass('text-danger');
      $('.movies-msg').text(`${error.responseJSON.message}`);
    })
  }

  Movies.prototype.logout = function() {
    Cookie.delete('user');
    Cookie.delete('search');
    let old = this.user;
    this.user = '';
    this.showMoviesPage()
  }

  Movies.prototype.eventsController = function() {
    $(document).on('click',    '.bsearch',   ()  => {this.search = $('.search').val(); this.searchMovies()})
    $(document).on('enterKey', '.search',    ()  => {this.search = $('.search').val(); this.searchMovies()});
    $(document).on('keypress', '.search',    (e) => {if (e.keyCode === 13) $('.search').trigger("enterKey");});
    $(document).on('click',    '.add-movie', (e) => this.addFavorite($(e.currentTarget).attr("movie-id")))
    $(document).on('click',    '.blogout',   ()  => this.logout());
  };

  this.showMoviesPage();
  this.eventsController();
}

let movies = new Movies('http://localhost:8000/movies/');
})