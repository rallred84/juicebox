const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
} = require('./index');

async function dropTables() {
  try {
    console.log('Starting to drop tables...');

    await client.query(`
    DROP TABLE IF EXISTS posts;
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
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR (255) UNIQUE NOT NULL,
      password VARCHAR (255) NOT NULL,
      name VARCHAR (255) NOT NULL,
      location VARCHAR (255) NOT NULL,
      active BOOLEAN DEFAULT true
    );

    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      "authorId" INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      active BOOLEAN DEFAULT true
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
    console.log('Starting to create users...');

    await createUser({
      username: 'rallred',
      password: 'password123',
      name: 'Robert',
      location: 'Texas',
    });
    await createUser({
      username: 'sandy',
      password: 'sandRadical',
      name: 'Sandra',
      location: 'California',
    });
    await createUser({
      username: 'glamgal',
      password: 'soglam',
      name: 'Betty',
      location: 'Somewhere glamorous',
    });

    await createInitialPosts();

    console.log('Finished creating users');
  } catch (err) {
    console.error('Error Creating Users!');
    throw err;
  }
}

async function createInitialPosts() {
  try {
    const [rallred, sandy, glamgal] = await getAllUsers();

    await createPost({
      authorId: rallred.id,
      title: 'First Post',
      content: 'This is my first post',
    });

    await createPost({
      authorId: sandy.id,
      title: "Sandy's First Post",
      content: 'This is Sandras first post',
    });

    await createPost({
      authorId: sandy.id,
      title: 'Sandy Strikes Back',
      content: 'This is my second post',
    });

    await createPost({
      authorId: glamgal.id,
      title: 'Glam Posts enter the building',
      content: "This is glamgal's first post",
    });

    await createPost({
      authorId: rallred.id,
      title: "I'm back",
      content: 'Robert posts again',
    });

    await createPost({
      authorId: glamgal.id,
      title: '2 Glam',
      content: 'This is 2nd glam post',
    });
  } catch (err) {
    console.error(err);
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
    console.log('Starting to test database...');

    console.log('Calling getAllUsers');
    const users = await getAllUsers();
    console.log('Result:', users);

    console.log('Calling updateUser on users[0]');
    const updateUserResult = await updateUser(users[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY',
    });
    console.log('Result:', updateUserResult);

    console.log('Calling getAllPosts');
    const posts = await getAllPosts();
    console.log('Result:', posts);

    console.log('Calling updatePost on posts[0]');
    const updatePostResult = await updatePost(posts[0].id, {
      title: 'New Title',
      content: 'Updated Content',
    });
    console.log('Result:', updatePostResult);

    console.log('Calling getUserById with 1');
    const rallred = await getUserById(1);
    console.log('Result:', rallred);

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
