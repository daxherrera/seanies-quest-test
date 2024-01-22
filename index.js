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


const NFT = sequelize.define('nfts', {
  contract: { type: Sequelize.STRING, },
  tokenID: { type: Sequelize.STRING, },
  name: { type: Sequelize.STRING, },
  fights: { type: Sequelize.INTEGER, },
});


const app = express();
const port = 3010;

app.use(express.static('static'));

app.get('/metadata/:tokenID', async (req, res) => {
  const tokenID = req.params.tokenID;

  const nft = await NFT.findOne({
    where: { tokenID: tokenID, },
  });
  
  if(nft.length == 0)
    res.send(`None found. Go buy one.`);
  else
    res.json(nft.toJSON());
});

app.get('/fight/:tokenID', async (req, res) => {
  const tokenID = req.params.tokenID;

  res.send(`NFT ID: ${tokenID}`);
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})