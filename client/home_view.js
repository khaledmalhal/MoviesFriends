/*jshint esversion: 6 */

$(function() {

function Home(URL) {
  this.url = URL;

  Home.prototype.register = function(username, password) {
    console.log(username)
    console.log(password)
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
    .catch(error => {$('.message').text(`Error: ${error}`)})
  }

  Home.prototype.eventsController = function() {
    $(document).on('click', '.register-submit', () => {
      this.register($('.user').val(), $('.pass').val())

    })
  }
  this.eventsController();
}
let home = new Home('http://localhost:8000')
})