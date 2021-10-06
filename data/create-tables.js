const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );
                CREATE TABLE categories (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL
                );
                CREATE TABLE cars (
                    id SERIAL PRIMARY KEY NOT NULL,
                    make TEXT NOT NULL,
                    model TEXT NOT NULL,
                    "releaseYear" INTEGER NOT NULL,
                    "stillProduced" BOOLEAN NOT NULL,
                    "energyType" TEXT NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id),
                    category_id INTEGER NOT NULL REFERENCES categories(id),
                    img TEXT NOT NULL
                );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
