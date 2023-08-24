const express = require('express');
const app = express();
const port = 5001;
const Moralis = require('moralis').default;
const cors = require('cors');

require('dotenv').config();

app.get('/getethprice', async (req, res) => {
  try {
    const response = await Moralis.EvmApi.token.getTokenPrice({
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: '0x1',
    });

    return res.status(200).json(response);
  } catch (e) {
    console.log(`Something went wrong: ${e}`);
    return res.status(400).json();
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log('Listening...');
  });
});