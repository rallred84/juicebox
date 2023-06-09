const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
    FROM users;
  `
  );

  return rows;
}

async function createUser({ username, password, name, location }) {
  try {
    const { rows: user } = await client.query(
      `
    INSERT INTO users (username, password, name, location)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
    RETURNING *
    `,
      [username, password, name, location]
    );
    return user;
  } catch (err) {
    throw err;
  }
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (err) {
    console.log('Error updating user');
    throw err;
  }
}

async function createPost({ authorId, title, content }) {
  try {
    const { rows } = await client.query(
      `
    INSERT INTO posts ("authorId", title, content)
    VALUES ($1, $2, $3)
  `,
      [authorId, title, content]
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');
  if (setString.length === 0) {
    return;
  }
  try {
    const { rows } = await client.query(
      `
    UPDATE posts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return rows;
  } catch (err) {
    console.log('Error updating post');
    throw err;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM posts;
      `
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM posts 
      WHERE "authorId" = $1; 
      `,
      [userId]
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM users WHERE id=$1;
      `,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    delete rows[0].password;
    rows[0].posts = await getPostsByUser(userId);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
};
