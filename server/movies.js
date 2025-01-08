'use strict';
/*jshint node: true */
/*jshint esversion: 6 */

const postgres = require('postgres');

const host="localhost";
const db="movies"
const port=5432;
const username="kmalhal"
const password="kmalhal"

let sql;

const connect = async () => {
  sql = postgres({
    host:     host,
    port:     port,
    database: db,
    username: username,
    password: password,
  })
  await sql`set search_path to movies`
}

exports.getMovies = async (title) => {
  let title_low = title.toLowerCase()
  return await new Promise(async (resolve, rejects) => {
    const res = await sql`
    select   movie_id, title, budget, homepage, overview,
             release_date, revenue, runtime, vote_average
    from     movie
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
      from genre`
    .then(r => resolve(r.map(Object.values)))
    .catch(error => {rejects(new Error(error))})
  })
}

connect();