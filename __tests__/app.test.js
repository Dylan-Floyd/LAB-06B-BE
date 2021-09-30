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

    test('get /cars/ returns cars', async () => {

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

    test('get /cars/:id returns a car by id', async () => {

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

    test('post /cars/ add a new car', async () => {

      const newCar = {
        make: 'Tesla',
        model: 'Cybertruck',
        releaseYear: 2024,
        stillProduced: false,
        energyType: 'electric'
      };

      const postResponse = await fakeRequest(app)
        .post('/cars/')
        .send(newCar)
        .expect('Content-Type', /json/)
        .expect(200);

      //check if reponse has new car
      expect(postResponse.body).toEqual(expect.objectContaining(newCar));

      const getResponse = await fakeRequest(app)
        .get('/cars/')
        .expect('Content-Type', /json/)
        .expect(200);

      //check if all data contains new car
      expect(getResponse.body).toEqual(expect.arrayContaining([expect.objectContaining(newCar)]));
    });

    test('put /cars/:id updates a car by id', async () => {
      const modifiedCarData = {
        make: 'Tesla',
        model: 'Cybertruck',
        releaseYear: 2024,
        stillProduced: false,
        energyType: 'electric'
      };

      //make a put request to /cars/1
      //add make, model, releaseYear, stillProduced and energyType
      const putResponse = await fakeRequest(app)
        .put('/cars/1')
        .send(modifiedCarData)
        .expect('Content-Type', /json/)
        .expect(200);

      //check if returned data matches supplied data.
      expect(putResponse.body).toEqual(expect.objectContaining(modifiedCarData));

      const getResponse = await fakeRequest(app)
        .get('/cars/')
        .expect('Content-Type', /json/)
        .expect(200);

      //check if all cars contains the updated car.
      expect(getResponse.body).toEqual(expect.arrayContaining([expect.objectContaining(modifiedCarData)]));
    });

    test('delete /cars/:id deletes a car by id', async () => {

      //get some car data to allow for checking if it has been deleted.
      const getResponse1 = await fakeRequest(app)
        .get('/cars/1')
        .expect('Content-Type', /json/)
        .expect(200);

      const id1Car = await getResponse1.body;

      //delete the car
      const deleteResponse = await fakeRequest(app)
        .delete('/cars/1')
        .expect('Content-Type', /json/)
        .expect(200);

      //check if the reponse contains the car we wanted to delete
      expect(deleteResponse.body).toEqual(expect.objectContaining(id1Car));

      //retrieve all car data
      const getResponse2 = await fakeRequest(app)
        .get('/cars/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(getResponse2.body).not.toEqual(expect.arrayContaining([expect.objectContaining(id1Car)]));
    });
  });
});
