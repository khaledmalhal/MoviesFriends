/*jshint esversion: 6 */

$(function() {

function Home(URL) {
  this.url = URL;
  this.user = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';

  Home.prototype.init = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
      $('.home_body').html(`
      <div class="form">
        <div class="form-register">
          <label for="username">Username: </label>
          <input type="text" name='username' class='user' required/><br>
        </div>
        <div class="form-register">
          <label for="username">Password: </label>
          <input type="password" name='password' class='pass' required/>
        </div>
        <div class="form-buttons">
          <button class="register-submit">Register</button>
          <button class="login-submit">Log in</button>
        </div>
      </div>`)
    }
    else this.showHomePage()
  }

  Home.prototype.showHomePage = function() {
    $('.message').text(`User ${this.user} is logged in.`)
    $('.home_body').html(`
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
  }

  Home.prototype.register = function(username, password) {
    let params = {
      username: username,
      password: password
    }
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: this.url+'/user/'+username
    })
    .then(r => {
      if (r.message[0].username == username) {
        $('.message').text(`User ${username} already exists.`)
      }
      else {
        $.ajax({
          method: 'POST',
          dataType: 'json',
          url: this.url+'/user/register',
          data: params
        })
        .then(r => {
          $('.message').text(r.message)
          this.login(username, password)
        })
        .catch(error => {$('.message').text(JSON.parse(error.responseText).message)})
      }
    })
    .catch((error => {$('.message').text(JSON.parse(error.responseText).message)}))
  }

  Home.prototype.login = function (username, password) {
    let params = {
      username: username,
      password: password
    }
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: this.url + '/user/login',
      data: params
    })
    .then(r => {
      $('.message').text(r.message)
      this.user = username
      Cookie.set('user', JSON.stringify(this.user), 7)
      this.showHomePage()
    })
    .catch(error => {$('.message').text(JSON.parse(error.responseText).message)})
  }

  Home.prototype.logout = function() {
    Cookie.delete('user');
    let old = this.user;
    this.user = '';
    this.init()
    $('.message').text(`${old} just logged out`)
  }

  Home.prototype.eventsController = function() {
    $(document).on('click', '.register-submit', () => this.register($('.user').val(), $('.pass').val()));
    $(document).on('click', '.login-submit',    () => this.login   ($('.user').val(), $('.pass').val()));
    $(document).on('click', '.logout-button',   () => this.logout());
  }
  this.init()
  this.eventsController();
}
let home = new Home('http://localhost:8000')
})