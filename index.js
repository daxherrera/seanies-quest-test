const express = require('express');
const { ethers, utils } = require('ethers');
const { resolve } = require('path');
const { neon } = require('@neondatabase/serverless');

require('dotenv').config();
const sql = neon(process.env.NEON_URL);


const app = express();
const port = 3010;
app.use(express.json());

async function authenticate(req, res, next) {
  console.log("authenticate");
  const token = req.headers['token'] 
  if (!token) {
    return res.status(401).send('No token provided');
  }

  try {
    const result = await sql('SELECT * FROM auth_tokens WHERE auth_token =$1 LIMIT 1', [token]);

    if (result.length === 0) {
      // No address associated with this token, reject the request
      return res.status(403).send('Invalid token');
    }
    next();
  } catch (error) {
    // Handle the error (e.g., token is invalid or expired)
    return res.status(403).send('Invalid token');
  }
}


//implement the middleware auth
//show all owned post ass-pocalypse seanies
//go adventure
//each seanie needs a gamestate
//fetch the gamestate and display based on that.

//an attribute for each layer
//attack or run

//save every wallet that connects
//save seanies ownership

function saveGameState(id) {
  //seanies_game_states
}
function loadGameState(id) {

}

function getRandom(items) {
  if (!items.length)
    return "";
  var item = items[Math.floor(Math.random() * items.length)];
  return item;
}
const guitars = [

]
const monsters = [
  {
    name: "Tiny Maddox",
    desc: "A tiny cuck",
    power: 10
  },
  {
    name: "Maddox",
    desc: "A cuck",
    power: 50
  },
  {
    name: "Super Maddox",
    desc: "A mega cuck",
    power: 90
  }];

function startFight() {
  let game_state;
  //pick an encounter
  game_state.mode = "fight";
  game_state.monster = getRandom(monsters);
  let monster = game_state.monster;
  let sean = game_state.sean;

  //see if the monster won initiative and attacked first.
  if (Math.floor(Math.random() * 100) < monster.power) {
    //surprise attack!
    sean.health -= 1;
    if (sean.health < 1) {
      //sean is dead
    }
  }

  //what do you want to do? Run, Fight

}

function attack() {
  //load game state
}

function gameMaster() {
  //load the game state and swap based on where we are.
  //battle
  //town
  //guitar store
}

function verifySignature(signature, message) {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    return recoveredAddress;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return null;
  }
}

app.get('/fight', authenticate, async (req, res) => {
  //id, name, description, image
  console.log("in fight wow!")
  console.log(req);

  res.json();
});

app.post('/api/authorize', async (req, res) => {
  const { address, signature, message } = req.body;

  // Verify the signature
  console.log(message);
  const recoveredAddress = verifySignature(signature, message);

  if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
    authToken = (Math.random() + 1).toString(36).substring(7);
    console.log(address); 
    console.log(authToken);

    await sql('INSERT INTO auth_tokens (address, auth_token) VALUES ($1, $2)', [address, authToken]);

    res.status(200).json({ authToken: authToken, success: true, message: 'Signature is valid.' });
  } else {
    res.status(401).json({ success: false, message: 'Signature is not valid.' });
  }
});

app.get('/metadata/:tokenID', async (req, res) => {
  //id, name, description, image
  let tokenID = req.params.tokenID;
  tokenID = 1;
  const [post] = await sql('SELECT * FROM seanies WHERE id =$1', [tokenID]);

  let name = req.params.tokenID + " " + post.name

  let nft = { name: name, description: post.desc, image: post.image };

  //get all the properties and loop them
  const props = await sql('SELECT name, value FROM attributes WHERE seanies_id = $1', [post.id]);
  console.log(props);

  let attributes = [];
  attributes.push({ trait_type: "fights", value: post.fights });

  attributes.push({ trait_type: "request", value: req.params.tokenID });

  props.forEach(attr => {
    attributes.push({ trait_type: attr.name, value: attr.value });
  });
  nft.attributes = attributes;

  res.json(nft);
});

app.get('/list', async (req, res) => {
  const { rows } = await sql('SELECT * FROM seanies');
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