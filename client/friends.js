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
        $('.friends-body').html(`
          <div class="friends-body-search">
            <div class="row g-2 align-items-end">
              <label for="friend-search">Add an user</label>
              <input type="text" class="friend-search form-control" id="friend-search" placeholder="Username">
              <label class="friend-search-msg"></label>
              <div class="col-auto">
                <button class="btn btn-primary mb-3 add-friend">Add friend</button>
              </div>
            </div>
          </div>
          <div class="friends-body-list"></div>`)
      }
    }

    Friends.prototype.friendList = function(list) {
      return `
        <ul class="list-group">
      ` +
      list.reduce((ac, friend) => ac +=
      `<li class="list-group-item" friend="${friend}">
        <div class="d-flex justify-content-between align-items-center">
          <label>${friend}</label>
          <button type="submit" class="delete btn btn-outline-danger" friend="${friend}">Delete</button>
        </div>
      </li>\n`, 
      "") + `</ul>`
    }

    Friends.prototype.listFriends = function() {
      $.ajax({
        method: 'GET',
        dataType: 'json',
        url: this.url+this.user
      })
      .then(r => {
        $('.friends-body-list').html(this.friendList(r.friends))
      })
      .catch(() => {
        $('.friends-body-list').html('')
      })
    }

    Friends.prototype.addFriend = function(friend) {
      console.log(friend)
      const params = {
        username: this.user,
        friend: friend
      }
      $.ajax({
        method: 'POST',
        dataType: 'json',
        url: this.url+'add',
        data: params
      })
      .then(r => {
        $('.friend-search-msg').addClass('text-success');
        $('.friend-search-msg').removeClass('text-danger');
        $('.friend-search-msg').text(`${r.message}`);
        this.listFriends();
      })
      .catch(r => {
        $('.friend-search-msg').removeClass('text-success');
        $('.friend-search-msg').addClass('text-danger');
        $('.friend-search-msg').text(`${r.responseJSON.message}`);
      })
      $('.friend-search').val('');
    }

    Friends.prototype.deleteFriend = function(friend) {
      console.log(`Deleting friend ${friend}`)
      const params = {
        username: this.user,
        friend: friend
      }
      $.ajax({
        method: 'DELETE',
        dataType: 'json',
        url: this.url+'delete',
        data: params
      })
      .then(r => {
        $('.friend-search-msg').addClass('text-success');
        $('.friend-search-msg').removeClass('text-danger');
        $('.friend-search-msg').text(`${r.message}`);
        this.listFriends();
      })
      .catch(r => {
        $('.friend-search-msg').removeClass('text-success');
        $('.friend-search-msg').addClass('text-danger');
        $('.friend-search-msg').text(`${r.responseJSON.message}`);
      })
        $('.friend-search').val('');
    }

    Friends.prototype.eventsController = function() {
      $(document).on('click',    '.add-friend',    ()  => this.addFriend($('.friend-search').val()));
      $(document).on('enterKey', '.add-friend',    ()  => this.addFriend($('.friend-search').val()));
      $(document).on('keypress', '.friend-search', (e) => {if (e.keyCode === 13) $('.add-friend').trigger("enterKey");});
      $(document).on('click',    '.delete',        (e) => this.deleteFriend($(e.currentTarget).attr('friend')));
    }

    this.eventsController()
    this.showFriendsPage()
    this.listFriends()
  }
  let friends = new Friends('http://localhost:8000/friends/')
})