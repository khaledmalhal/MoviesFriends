'use strict';
/*jshint node: true */
/*jshint esversion: 6 */

const postgres = require('postgres');

const host="localhost";
const db="users"
const port=5432;
const username="kmalhal"
const password="kmalhal"

let sql;

const connect = () => {
  sql = postgres({
    host:     host,
    port:     port,
    database: db,
    username: username,
    password: password,
  })
}

exports.login = async (username, password) => {
  return await new Promise(async (resolve, rejects) => {
    if (username.length == 0 || password.length == 0) {
      rejects(new Error(`No user or password were provided.`))
    } else {
      const user = {
        username: username,
        password: password
      }
      const res = await sql`
        select ${sql(user, 'username', 'password')}
        from users`
      .then(r => resolve())
      .catch(error => {rejects(new Error(error))})
    }
  })
}


exports.register = async (username, password)  => {
  return await new Promise(async (resolve, rejects) => {
    if (username.length == 0 || password.length == 0) {
      rejects(new Error(`No user or password were provided.`))
    } else {
      const user = {
        username: username,
        password: password
      }
      const res = await sql`insert into users ${
        sql(user, 'username', 'password')
      }`
      .then(r => resolve())
      .catch(error => {rejects(new Error(error))})
    }
  })
}

exports.getUser = async (user) => {
  return await new Promise(async (resolve, rejects) => {
    if (typeof user === 'undefined' || user.length == 0) {
      rejects(new Error(`The user cannot be empty`));
    } else {
      const res = await sql`
        select username
        from users
        where username = ${user}
      `
      .then(r => {
        resolve(r)
      })
      .catch(error => rejects(new Error(error)));
    }
  })

}

exports.getFriends = async (user) => {
  return await new Promise(async (resolve, rejects) => {
    if (typeof user === 'undefined' || user.length === 0) {
      rejects(new Error(`The user was not provided`));
    } else {
      const res = await sql`
        select friend
        from friends 
        where username = ${user}
      `
      .then(r => resolve(r.map(Object.values)))
      .catch(error => rejects(new Error(error)));
    }
  })
}

connect()