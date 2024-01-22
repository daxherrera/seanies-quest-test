const express = require('express');
const { resolve } = require('path');
const readtest = require('./server.js');

const app = express();
const port = 3010;

app.use(express.static('static'));

app.get('/', (req, res) => {
    console.log('before start');

    //await readtest();

    console.log('after start');

  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
