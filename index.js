const express = require('express');
const app = express();
const port = 5001;
const Moralis = require('moralis').default;
const cors = require('cors');

require('dotenv').config();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const chain = '0x1';
app.get('/getEthPrice', async (req, res) => {
  try {
    const response = await Moralis.EvmApi.token.getTokenPrice({
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain,
    });

    return res.status(200).json(response);
  } catch (e) {
    console.log(`Something went wrong: ${e}`);
    return res.status(400).json();
  }
});

app.get('/address', async (req, res) => {
  try {
    const { address } = req.query;
    const response =
      await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
        address,
        chain,
      });
    return res.status(200).json(response);
  } catch (e) {
    console.log(`Something went wrong: ${e}`);
    return res.status(400).json();
  }
});

app.get('/getBlockInfo', async (req, res) => {
  try {
    const latestBlock = await Moralis.EvmApi.block.getDateToBlock({
      date: Date.now(),
      chain,
    });
    let blockNumOrParentHash = latestBlock.toJSON().block;
    let previousBlockInfo = [];

    for (let i = 0; i < 1; i++) {
      const prevBlockNums = await Moralis.EvmApi.block.getBlock({
        chain,
        blockNumberOrHash: blockNumOrParentHash,
      });

      blockNumOrParentHash = prevBlockNums.toJSON().parent_hash;
      if (i == 0) {
        previousBlockInfo.push({
          transactions: prevBlockNums.toJSON().transactions.map((i) => {
            return {
              transactionHash: i.hash,
              time: i.block_timestamp,
              fromAddress: i.from_address,
              toAddress: i.to_address,
              value: i.value,
            };
          }),
        });
      }
      previousBlockInfo.push({
        blockNumber: prevBlockNums.toJSON().number,
        totalTransactions: prevBlockNums.toJSON().transaction_count,
        gasUsed: prevBlockNums.toJSON().gas_used,
        miner: prevBlockNums.toJSON().miner,
        time: prevBlockNums.toJSON().timestamp,
      });
    }
    const response = {
      latestBlock: latestBlock.toJSON().block,
      previousBlockInfo,
    };
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
