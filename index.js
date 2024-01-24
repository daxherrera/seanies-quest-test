const { ThirdwebAuth } = require( "@thirdweb-dev/auth/express");
const { PrivateKeyWallet } = require("@thirdweb-dev/auth/evm");

const express = require('express');
const { resolve } = require('path');
const { neon } = require( '@neondatabase/serverless');

require('dotenv').config();
const sql = neon(process.env.NEON_URL);

const app = express();
const port = 3010;  
  
const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: process.env.THIRDWEB_AUTH_DOMAIN || "",
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
  // NOTE: All these callbacks are optional! You can delete this section and
  // the Auth flow will still work.
  callbacks: {
    onLogin: async (address) => {
      // Here we can run side-effects like creating and updating user data
      // whenever a user logs in.
      if (!users[address]) { 
        users[address] = {
          created_at: Date.now(),
          last_login_at: Date.now(),
          num_log_outs: 0,
        };
      } else {
        users[address].last_login_at = Date.now();
      }

      // We can also provide any session data to store in the user's session.
      return { role: ["admin"] };
    },
    onUser: async (user) => {
      // Here we can run side-effects whenever a user is fetched from the client side
      if (users[user.address]) {
        users[user.address].user_last_accessed = Date.now();
      }

      // And we can provide any extra user data to be sent to the client
      // along with the default user object.
      return users[user.address];
    },
    onLogout: async (user) => {
      // Finally, we can run any side-effects whenever a user logs out.
      if (users[user.address]) {
        users[user.address].num_log_outs++;
      }
    },
  },
});

// Add the auth middleware to the rest of our app to allow user authentication on other endpoints
app.use(authMiddleware);

// Add the auth router to our app to set up the /auth/* endpoints
app.use("/auth", authRouter);


//app.use(express.static('static'));

app.get("/secret", async (req, res) => {
  const user = await getUser(req);

  if (!user) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  return res.status(200).json({
    message: "This is a secret... don't tell anyone.",
  });
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