const express = require('express');
const { ethers } = require('ethers');
const { resolve } = require('path');

const { neon } = require( '@neondatabase/serverless');

require('dotenv').config();
const sql = neon(process.env.NEON_URL); 

const app = express(); 
const port = 3010;
app.use(express.json());

app.post('/api/authorize', (req, res) => {
  const { address, signature } = req.body;
  const message = "Authorize this request";

    try {
        // Recover the address from the signature
        console.log(signature);
        console.log(message);
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        console.log("recover");
        console.log(recoveredAddress.toLowerCase());
        // Check if the recovered address matches the provided address
        if (recoveredAddress.toLowerCase().trim() === address.toLowerCase().trim() ) {
            console.log("true");
            //res.send({ success: true, message: 'Authorized' });
        } else {
          console.log("false");
          res.send({ success: false, message: 'Unauthorized' });
        }
    } catch (err) {
      console.error("Error during message verification:", err);

        //res.status(500).send({ success: false, message: 'Error verifying signature' });
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