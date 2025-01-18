/*jshint esversion: 6 */

$(function() {

function Login(API_URL) {
  this.url = API_URL;
  this.user = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';
  this.notallowed = ['login', 'register', 'friends']

  Login.prototype.showLoginPage = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
      $('.login_body').html(`
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

  Login.prototype.showHomePage = function() {
    window.location.href = './home.html'
  }

  Login.prototype.register = function(username, password) {
    let params = {
      username: username,
      password: password
    }
    if (this.notallowed.includes(username)) {
      $('.message').text(`Username ${username} is not allowed. It cannot be neither of these: ${this.notallowed.map((e) => (e)).join(', ')}`)
      $('.user').val('');
      $('.pass').val('');
      return;
    }
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: this.url + username
    })
    .then(r => {
      console.log(r)
      if (r.user.length > 0 && r.user[0].username == username) {
        $('.message').text(`User ${username} already exists.`)
      }
      else {
        $.ajax({
          method: 'POST',
          dataType: 'json',
          url: this.url+'register',
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

  Login.prototype.login = function (username, password) {
    let params = {
      username: username,
      password: password
    }
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: this.url + 'login',
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

  Login.prototype.logout = function() {
    Cookie.delete('user');
    let old = this.user;
    this.user = '';
    this.showLoginPage()
    $('.message').text(`${old} just logged out`)
  }

  Login.prototype.eventsController = function() {
    $(document).on('click',    '.register-submit', ()  => this.register($('.user').val(), $('.pass').val()));
    $(document).on('keypress', '.pass',            (e) => {if (e.keyCode === 13) $('.login-submit').trigger("enterKey");});
    $(document).on('keypress', '.user',            (e) => {if (e.keyCode === 13) $('.login-submit').trigger("enterKey");});
    $(document).on('enterKey', '.login-submit',    ()  => this.login   ($('.user').val(), $('.pass').val()));
    $(document).on('click',    '.login-submit',    ()  => this.login   ($('.user').val(), $('.pass').val()));

    $(document).on('click', '.logout-button',   () => this.logout());
  }
  this.showLoginPage();
  this.eventsController();
}
let login = new Login('http://localhost:8000/user/')
})