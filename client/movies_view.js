/*jshint esversion: 6 */

$(function() {

function Movies(API_URL) {
  this.url    = API_URL;
  this.user   = Cookie.get('user')   ? JSON.parse(Cookie.get('user'))   : '';
  this.search = Cookie.get('search') ? JSON.parse(Cookie.get('search')) : '';

  Movies.prototype.showMoviesPage = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
      Cookie.delete('user');
      window.location.href = './index.html'
    } else {
      $('.message').text(`User ${this.user} is logged in.`)
      $('.header').html(`
        <div class="item">
          <div class="content">
            <p class="user-welcome">Welcome ${this.user}</p>
          </div>
        </div>
        <div class="item">
          <div class="content">
            <button class="blogout">Log out</button>
          </div>
        </div>`)
      $('.movies_body').html(`
        <span class="nobr">
          <input type="text" class="search" value="${this.search}" placeholder="Search for a movie title" onfocus="let v=this.value; this.value=''; this.value=v">
          <input type='button' class='bsearch' value='Search'></input>
        </span>
        <table class="movies_table"></table>`)
      this.searchMovies();
    }
  };

  Movies.prototype.searchMovies = function() {
    if (typeof this.search === 'undefined' || this.search.length === 0) {
      Cookie.delete('search')
      this.fillTable([])
      return;
    }
    Cookie.set('search', JSON.stringify(this.search), 7);
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: this.url+'title/'+this.search
    })
    .then(r => {
      if (r.movies.length > 0) {
        this.fillTable(r.movies)
      }
      $('.message').text('')
    })
    .catch(error => {$('.message').text(JSON.parse(error.responseText).message)})
  };

  Movies.prototype.fillTable = function(movies) {
    let table = $('.movies_table')
    if (movies.length === 0) {
      table.html(``)
      return;
    }
    table.html(`
      <thead>
        <tr>
          <th scope='col'>Title</th>
          <th scope='col'>Sinopsis</th>
          <th scope='col'>Release Date</th>
          <th scope='col'>Homepage</th>
          <th scope='col'>Runtime</th>
          <th scope='col'>Budget</th>
          <th scope='col'>Revenue</th>
          <th scope='col'>Vote average</th>
        </tr>
      </thead>`)
    let body = $('<tbody></tbody>')
    movies.forEach(movie => {
      console.log(movie.homepage)
      let homepage = movie.homepage
      let release_date = movie.release_date.split('T')[0];
      let row = $('<tr></tr>')
      row.append($(`<th scope='row'>${movie.title}</th>`))
      row.append($(`<td>${movie.overview}</td>`))
      row.append($(`<td>${release_date}</td>`))
      if (typeof homepage === undefined || homepage.length === 0)
        row.append($(`<td>--</td>`))
      else
        row.append($(`<td><a target='_blank' href='${homepage}'>🔗</a></td>`))
      row.append($(`<td>${movie.runtime} minutes</td>`))
      row.append($(`<td>$${movie.budget}</td>`))
      row.append($(`<td>$${movie.revenue}</td>`))
      row.append($(`<td>${movie.vote_average}/10</td>`))
      body.append(row)
    });
    table.append(body)
  };

  Movies.prototype.logout = function() {
    Cookie.delete('user');
    Cookie.delete('search');
    let old = this.user;
    this.user = '';
    this.showMoviesPage()
    $('.message').text(`${old} just logged out`)
  }

  Movies.prototype.eventsController = function() {
    $(document).on('click',    'bsearch', ()  => {this.search = $('.search').val(); this.searchMovies()})
    $(document).on('enterKey', '.search', ()  => {this.search = $('.search').val(); this.searchMovies()});
    $(document).on('keypress', '.search', (e) => {if (e.keyCode === 13) $('.search').trigger("enterKey");});
    $(document).on('click',    '.blogout',() => this.logout());
  };

  this.showMoviesPage();
  this.eventsController();
}

let movies = new Movies('http://localhost:8000/movies/');
})