const Sequelize = require('sequelize');

// setup a new database
const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: 'data/database.sqlite',
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database: ', error);
  });

const User = sequelize.define('users', {
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
});

async function writetest() {
  console.log('Inside of myfunction');
  await User.sync({ force: true });

  // users we want to create
  const users = [
    ['John', 'Hancock'],
    ['Liz', 'Smith'],
    ['Ahmed', 'Khan'],
    ['dom', 'delouise'],
  ];

  await User.bulkCreate(
    users.map(([firstName, lastName]) => ({ firstName, lastName }))
  );

  console.log('All data written 🎉');
}

async function readtest() {
  await User.sync();

  const users = await User.findAll();

  for (const user of users) {
    console.log(`${user.firstName} ${user.lastName}`);
  }

  if (users.length === 0) {
    console.log('No users found 😔');
  }
}

/*
(async() => {
  console.log('before start');

  await writetest();
  await readtest();
  
  console.log('after start');
})();
*/

module.exports = { readtest };
