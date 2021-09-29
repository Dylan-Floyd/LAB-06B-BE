require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns cars', async() => {

      const cars = [
        {
          make: 'Tesla',
          model: 'Model 3',
          releaseYear: 2017,
          stillProduced: true,
          energyType: 'electric'
        },
        {
          make: 'Ford',
          model: 'Mustang',
          releaseYear: 1964,
          stillProduced: true,
          energyType: 'gas'
        },
        {
          make: 'Mazda',
          model: 'Mazda3',
          releaseYear: 2003,
          stillProduced: true,
          energyType: 'gas'
        },
        {
          make: 'Mazda',
          model: 'Miata',
          releaseYear: 1989,
          stillProduced: true,
          energyType: 'gas'
        },
        {
          make: 'Toyota',
          model: 'Prius',
          releaseYear: 1997,
          stillProduced: true,
          energyType: 'hybrid'
        }
      ];

      const data = await fakeRequest(app)
        .get('/cars')
        .expect('Content-Type', /json/)
        .expect(200);

      //Tests if the returned data is correct, without
      //failing if there are extra properties on the objects
      expect(data.body).toEqual(
        cars.map(car => expect.objectContaining(car))
      );
    });

    test('returns a car by id', async() => {

      const expectation = {
        make: 'Tesla',
        model: 'Model 3',
        releaseYear: 2017,
        stillProduced: true,
        energyType: 'electric'
      };

      const data = await fakeRequest(app)
        .get('/cars/1')
        .expect('Content-Type', /json/)
        .expect(200);

      //Tests if the returned data is correct, without
      //failing if there are extra properties on the object
      expect(data.body).toEqual(expect.objectContaining(expectation));
    });
  });
});
