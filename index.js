const express = require('express');
const { resolve } = require('path');
const Sequelize = require('sequelize');

//get the metadata
//fight

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


const app = express();
const port = 3010;

app.use(express.static('static'));

app.get('/metadata/:nftId', async (req, res) => {
  const nftId = req.params.nftId;

  try {
    await User.sync();
    const users = await User.findAll();
    console.log(users.length);
  } catch (error) {
    console.log(error);
  }


  res.send(`NFT ID: ${nftId}`);
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
