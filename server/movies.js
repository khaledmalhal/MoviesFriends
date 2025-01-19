'use strict';
/*jshint node: true */
/*jshint esversion: 6 */

const postgres = require('postgres');
const process  = require('process');
require('dotenv').config();

const host     = process.env.HOST;
const db       = process.env.MOVIES_DB;
const port     = process.env.PORT;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

let sql;

const connect = async () => {
  sql = postgres({
    host:     host,
    port:     port,
    database: db,
    username: username,
    password: password,
  })
}

exports.getMovies = async (title) => {
  let title_low = title.toLowerCase()
  return await new Promise(async (resolve, rejects) => {
    const res = await sql`
    select   movie_id, title, budget, homepage, overview,
             release_date, revenue, runtime, vote_average
    from     movies.movie
    where    lower(title) like ${'%'+title_low+'%'}
    ${sql`order by popularity DESC`}`
    .then(r => {
      resolve(r)
    })
    .catch(error => {rejects(new Error(error))})
  })
}

exports.getGenres = async () => {
  return await new Promise(async (resolve, rejects) => {
    const res = await sql`
      select genre_name
      from movies.genre`
    .then(r => resolve(r.map(Object.values)))
    .catch(error => {rejects(new Error(error))})
  })
}

connect();