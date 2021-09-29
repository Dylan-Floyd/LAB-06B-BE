const client = require('../lib/client');
// import our seed data:
const cars = require('./cars.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      cars.map(car => {
        return client.query(`
                    INSERT INTO cars (make, model, "releaseYear", "stillProduced", "energyType", owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [car.make, car.model, car.releaseYear, car.stillProduced, car.energyType, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
