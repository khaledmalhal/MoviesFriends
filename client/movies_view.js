/*jshint esversion: 6 */

$(function() {

function Movies(API_URL) {
  this.url = API_URL;
  this.user = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';

  Movies.prototype.showMoviesPage = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
    $('.message').text(`User ${this.user} is logged in.`)
    $('.movies_body').html(`
      <div class="header">
        <div class="item">
          <div class="content">
            <p class="user-welcome">Welcome ${this.user}</p>
          </div>
        </div>
        <div class="item">
          <div class="content">
            <button class="logout-button">Log out</button>
          </div>
        </div>
      </div>`)
    } else {
      Cookie.delete('user');
      window.location.hred = './index.html'
    }
  }

  Movies.prototype.eventsController = function() {
    console.log('Events')
  }
  this.showMoviesPage();
  this.eventsController();
}
let movies = Movies('http://localhost:8000/movies/')
})