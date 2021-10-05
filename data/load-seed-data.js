const client = require('../lib/client');
// import our seed data:
const cars = require('./cars.js');
const categories = require('./categories.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function getCategoryId(categoryName) {
  const data = await client.query(`
      SELECT * FROM categories
      WHERE name=$1
    `, [categoryName]);
  return data.rows[0].id;
}

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
      categories.map(category => {
        return client.query(`
                    INSERT INTO categories (name)
                    VALUES ($1);
                `,
        [category.name]);
      })
    );

    await Promise.all(
      cars.map(async (car) => {
        const categoryId = await getCategoryId(car.category);
        return client.query(`
                    INSERT INTO cars (make, model, "releaseYear", "stillProduced", "energyType", owner_id, category_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [car.make, car.model, car.releaseYear, car.stillProduced, car.energyType, user.id, categoryId]);
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
