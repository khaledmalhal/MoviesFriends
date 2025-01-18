/*jshint esversion: 6 */

$(function() {

  function Friends(API_URL) {
    this.url    = API_URL;
    this.user   = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';

    Friends.prototype.showFriendsPage = function() {
      if (typeof this.user === 'undefined' || this.user.length === 0) {
        Cookie.delete('user');
        window.location.href = './index.html'
      } else {
        $('.message').text(`User ${this.user} is logged in.`)
        $('.home-header').html(`
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
        $('.friends_body').html(`

          `)
      }
    }

    Friends.prototype.listFriends = function() {

    }

    Friends.prototype.eventsController = function() {
      
    }
  }
  let friends = new Friends('http://localhost:8000/friends/')
})