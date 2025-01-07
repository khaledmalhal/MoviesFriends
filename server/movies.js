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