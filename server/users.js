'use strict';
/*jshint node: true */
/*jshint esversion: 6 */

const postgres = require('postgres');
const process  = require('process');
require('dotenv/config');

const host     = process.env.HOST;
const db       = process.env.USER_DB;
const port     = process.env.PORT;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

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
        select username, password
        from users
        where username = ${username}`
      .then(r => {
        console.log(r)
        if (r.length == 0)
          rejects(new Error(`User ${username} does not exist`))
        if (r[0].username === username) {
          if (r[0].password !== password)
            rejects(new Error(`Password doesn't match`))
        }
        else rejects(new Error(`Error at login in.`))
        resolve()
      })
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
        if (r.length == 0) throw (new Error(`There is no user ${user}.`))
        resolve(r[0].username)
      })
      .catch(error => rejects(Error(error)));
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
      .then(r => {
        resolve(r.map((array) => {return array.friend}))}
      )
      .catch(error => rejects(new Error(error)));
    }
  })
}

connect()