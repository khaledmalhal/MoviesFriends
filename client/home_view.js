/*jshint esversion: 6 */

$(function() {

function Home(URL) {
  this.url = URL;
  this.user = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';

  Home.prototype.init = function() {
    if (typeof this.user == 'undefined' || this.user.length == 0) {
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
      </div>`)
    }
    else this.showHomePage()
  }

  Home.prototype.showHomePage = function() {
    $('.home_body').html(`<p>User ${this.user} is logged in.</p>`)
  }

  Home.prototype.register = function(username, password) {
    let params = {
      username: username,
      password: password
    }
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: this.url+'/user/register',
      data: params
    })
    .then(r => {
      $('.message').text(r.message)
    })
    .catch(error => {$('.message').text(JSON.parse(error.responseText).message)})
    this.login(username, password)
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
    })
    .catch(error => {$('.message').text(JSON.parse(error.responseText).message)})
  }

  Home.prototype.eventsController = function() {
    $(document).on('click', '.register-submit', () => this.register($('.user').val(), $('.pass').val()))
    $(document).on('click', '.login-submit',    () => this.login   ($('.user').val(), $('.pass').val()))
  }
  this.init()
  this.eventsController();
}
let home = new Home('http://localhost:8000')
})