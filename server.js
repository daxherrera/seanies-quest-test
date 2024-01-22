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

const NFT = sequelize.define('nfts', {
  contract: { type: Sequelize.STRING, },
  tokenID: { type: Sequelize.STRING, },
  name: { type: Sequelize.STRING, },
  fights: { type: Sequelize.INTEGER, },
});

async function write() {
  await NFT.sync({ force: true });

  // users we want to create
  const nfts = [
    ['contract123231234', '1', 'Tommy', 0],
    ['contract123231234', '2', 'Dingus', 0],
    ['contract123231234', '3', 'Ralph', 0],
    ['contract123231234', '4', 'Lobo', 0],
    ['contract123231234', '5', 'ingle', 2],
  ];

  await NFT.bulkCreate(
    nfts.map(([firstName, lastName]) => ({ firstName, lastName }))
  );

  console.log('All data written 🎉');
}

async function read() {
  await NFT.sync();

  const nfts = await NFT.findAll();

  for (const nft of nfts) {
    console.log(nft);
  }

  if (nfts.length === 0) {
    console.log('No nfts found 😔');
  }
}

(async() => {
  console.log('before start');

  await read();
  
  console.log('after start');
})();