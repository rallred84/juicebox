const { client, getAllUsers, createUser } = require('./index');

async function dropTables() {
  try {
    console.log('Starting to dropp tables...');

    await client.query(`
    DROP TABLE IF EXISTS users;
    `);

    console.log('Finished dropping tables...');
  } catch (err) {
    console.error('Error dropping tables!');
    throw err;
  }
}

async function createTables() {
  try {
    console.log('Starting to build tables...');

    await client.query(`
    CREATE TABLE USERS (
      id SERIAL PRIMARY KEY,
      username VARCHAR (255) UNIQUE NOT NULL,
      password VARCHAR (255) NOT NULL
    );
    `);

    console.log('Finished building tables...');
  } catch (err) {
    console.error('Error building tables...');
    throw err;
  }
}

async function createInitialUsers() {
  try {
    const robert = await createUser({
      username: 'Robert',
      password: 'password123',
    });
    const sandra = await createUser({
      username: 'Sandra',
      password: 'sandRadical',
    });
    const glamgal = await createUser({
      username: 'Glamgal',
      password: 'soglam',
    });
    console.log(robert);
    console.log(sandra);
    console.log(glamgal);
  } catch (err) {
    console.error('Error Creating Users!');
    throw err;
  }
}

async function rebuildDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (err) {
    console.error(err);
  }
}

async function testDB() {
  try {
    console.log('starting to test database...');

    const users = await getAllUsers();
    console.log('getAllUsers:', users);

    console.log('Finished database tests!');
  } catch (err) {
    console.log('Error testing databases');
    console.error(err);
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
