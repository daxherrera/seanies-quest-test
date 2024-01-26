const express = require('express');
const Web3 = require('web3');
const { resolve } = require('path');
const { neon } = require( '@neondatabase/serverless');

require('dotenv').config();
const sql = neon(process.env.NEON_URL);

const app = express();
const port = 3010;  

//app.use(express.static('static'));
// In-memory storage for nonces
const nonces = {};

// Endpoint to request a nonce for a specific address
app.get('/requestNonce/:address', (req, res) => {
  const { address } = req.params;
  const nonce = `Your nonce: ${Math.random()}`; // Generate a random nonce

  nonces[address] = nonce; // Store the nonce for later verification

  res.json({ nonce });
});

// Endpoint to verify the signed nonce
app.post('/verifySignature', (req, res) => {
  const { address, signature } = req.body;
  const nonce = nonces[address];

  if (!nonce) {
      return res.status(400).json({ message: "Nonce not found" });
  }

  try {
      const recoveredAddress = web3.eth.accounts.recover(nonce, signature);

      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
          // The signature is valid
          res.json({ success: true, message: "Authentication successful" });
      } else {
          // The signature is invalid
          res.status(401).json({ success: false, message: "Invalid signature" });
      }
  } catch (error) {
      res.status(500).json({ success: false, message: "Error verifying signature" });
  }
});





app.get('/metadata/:tokenID', async (req, res) => {
  //id, name, description, image
  let tokenID = req.params.tokenID; 
  tokenID = 1;
  const [post] = await sql('SELECT * FROM seanies WHERE id =$1', [tokenID]);

  let name = req.params.tokenID + " " + post.name
 
  let nft = { name: name, description: post.desc, image: post.image};

  //get all the properties and loop them
  const props = await sql('SELECT name, value FROM attributes WHERE seanies_id = $1', [post.id]);
  console.log(props);

  let attributes = [];
  attributes.push({trait_type: "fights", value: post.fights});

  attributes.push({trait_type: "request", value: req.params.tokenID});

  props.forEach(attr => {
    attributes.push({trait_type: attr.name, value: attr.value});
  });
  nft.attributes = attributes;

  res.json(nft);
}); 

app.get('/list', async (req, res) => {
  const {rows} = await sql('SELECT * FROM seanies');
  console.log(rows);
  console.log(rows);
  res.send(`done`);
});
 
app.get('/fight/:tokenID', async (req, res) => {
  const tokenID = req.params.tokenID;
  const [ret] = await sql('UPDATE seanies SET fights = fights + 1 WHERE id =$1 RETURNING fights', [tokenID]);
  console.log(ret.fights)
  res.send(`NFT ID: ${tokenID} has fought: ${ret.fights} times.`);
});

app.get('/', (req, res) => {  
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})