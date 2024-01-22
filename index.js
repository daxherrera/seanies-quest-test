const express = require('express');
const { resolve } = require('path');
const { neon } = require( '@neondatabase/serverless');

const sql = neon("postgresql://daxherrera:sXlrhNBWk1P3@ep-throbbing-bread-a5hiytdn.us-east-2.aws.neon.tech/neondb?sslmode=require");
// `post` is now [{ id: 12, title: 'My post', ... }] (or undefined)


const app = express();
const port = 3010;


app.use(express.static('static'));

app.get('/metadata/:tokenID', async (req, res) => {
  //id, name, description, image
  let tokenID = req.params.tokenID;
  const [post] = await sql('SELECT * FROM seanies WHERE id =$1', [tokenID]);
 
  let nft = { name: post.name, description: post.desc, image: post.image};

  //get all the properties and loop them
  const props = await sql('SELECT name, value FROM attributes WHERE seanies_id = $1', [post.id]);
  console.log(props);

  let attributes = [];
  attributes.push({trait_type: "fights", value: post.fights});
 
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