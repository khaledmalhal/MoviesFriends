/*jshint esversion: 6 */

$(function() {

function Login(API_URL) {
  this.url = API_URL;
  this.user = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';
  this.notallowed = ['login', 'register', 'friends']

  Login.prototype.showLoginPage = function() {
    if (typeof this.user === 'undefined' || this.user.length === 0) {
      $('.login_body').html(`
      <p class="fs-1 text-center">MoviesFriends</p>
      <p class="fs-4 text-center">Start sharing your favorite movies with your friends over the internet!</p>
      <div class="bg-info min-vw-100 min-vh-100"></div>
        <div class="position-absolute top-50 start-50 translate-middle border rounded min-vw-50 vw-50 p-3 bg-light">
          <form style="width: 300px;">
            <div class="mb-3">
              <label for="username-input" class="form-label">Username</label>
              <input type="text" class="form-control user" id="username-input">
            </div>
            <div class="mb-3">
              <label for="password-input" class="form-label">Password</label>
              <input type="password" class="form-control pass" id="password-input">
            </div>
            <div class="mb-3">
              <label class="login-message" style="color: red;"></label>
            </div>
          </form>
          <div>
            <button class="btn btn-outline-primary register-submit">Register</button>
            <button class="btn btn-primary login-submit">Log in</button>
          </div>
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
      $('.login-message').text(`Username ${username} is not allowed. It cannot be neither of these: ${this.notallowed.map((e) => (e)).join(', ')}`)
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
        $('.login-message').text(`User ${username} already exists.`)
      }
      else {
        $.ajax({
          method: 'POST',
          dataType: 'json',
          url: this.url+'register',
          data: params
        })
        .then(r => {
          $('.login-message').text(r.message)
          this.login(username, password)
        })
        .catch(error => {$('.login-message').text(JSON.parse(error.responseText).message)})
      }
    })
    .catch((error => {$('.login-message').text(JSON.parse(error.responseText).message)}))
  }

  Login.prototype.login = function (username, password) {
    $('.login-message').text('')
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
      this.user = username
      Cookie.set('user', JSON.stringify(this.user), 7)
      this.showHomePage()
    })
    .catch(error => {$('.login-message').text(JSON.parse(error.responseText).message)})
  }

  Login.prototype.logout = function() {
    Cookie.delete('user');
    let old = this.user;
    this.user = '';
    this.showLoginPage()
    $('.login-message').text(`${old} just logged out`)
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