/*jshint esversion: 6 */

$(function() {

  function Home(API_URL) {
    this.url = API_URL;
    this.user = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : '';

    Home.prototype.showHomePage = function() {
      if (typeof this.user === 'undefined' || this.user.length === 0) {
        this.showLoginPage();
      } else {
        // $('.home_body').html(`
        //   
        // `)
      }
    }

    Home.prototype.showLoginPage = function() {
      window.location.href = './index.html'
    }

    Home.prototype.logout = function() {
      Cookie.delete('user');
      let old = this.user;
      this.user = '';
      this.showLoginPage()
      $('.message').text(`${old} just logged out`)
    }

    Home.prototype.eventsController = function() {
      $(document).on('click', '.blogout', () => this.logout());
    }
    this.eventsController()
  }

  let home = new Home("http://localhost:8000/")
})