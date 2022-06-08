const axios = require('axios');

const CONTRACT_NAME = require("./constants").CONTRACT_NAME;
const StableCoins = require("./constants").StableCoins;
const getCoinId = require("./constants").getCoinId;
const getConfig = require("./constants").getConfig;

const encrypt3DES = require("./constants").encrypt3DES;
const decrypt3DES = require("./constants").decrypt3DES;

const port = process.env.PORT || 3001
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require('fs');
const path = require("path");
const { keyStores, KeyPair, connect, Contract } = require("near-api-js");

let near;
var formidable = require('formidable');

app.use(express.json());
app.use(cors());

// const args = process.argv.slice(2)

// let encrypt = encrypt3DES(args[0], "Thisisaprettyquity");
// console.log(encrypt);

// let decrypt = decrypt3DES(encrypt, "Thisisaprettyquity");
// console.log(decrypt);

async function init(){
  const keyStore = new keyStores.InMemoryKeyStore();
  const PRIVATE_KEY =
    "2nYhYbV58SqjgpmD5QwCjg9EWFMS9P3JCap9U58Wn651cCPtxKxYHmSk6oSZh2SeYFohcyoe8zQBbGNvRNvdAQoz";
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  await keyStore.setKey("testnet", "staking_treasury.testnet", keyPair);

  // const nearConfig = getConfig("testnet");
  const config = {
    networkId: "testnet",
    keyStore, 
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };
  near = await connect(
    config
  );
console.log(near)
}
async function withdraw(sender, amount, coinType) {
  let coins = StableCoins.filter((coin) => coin.upcoming == false);
  const price = ["1", "1", "1", "1", "1", "1", "1"];
  for(let i=0; i<coins.length; i++){
    let res
    try {
      res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins[i].id}&vs_currencies=usd`
      );
    } catch (e) { }

    price[i] = Math.floor(res.data[`${coins[i].id}`]["usd"] * 100);
  }

  const account = await near.account("staking_treasury.testnet");
  const tokenAddress = TOKEN_ADDRESS[getCoinId(coinType)];
  const contract = new Contract(
    account, // the account object that is connecting
    tokenAddress,
    {
      viewMethods: ["ft_balance_of"],
      changeMethods: ["ft_transfer_call"],
    }
  );

  let pool_msg = {
    account: sender,
    coin: coinType,
    price: price,
  };

  let token_msg = {
    receiver_id: CONTRACT_NAME,
    amount: amount,
    msg: JSON.stringify(pool_msg)
  }
console.log(token_msg);
  try{
    await contract.ft_transfer_call(token_msg, 300000000000000, 1);
    return "success";
  }
  catch(e){
    return "failed"
  }
}

app.post("/withdraw", async function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    let count = 0;
    let result;
    do {
      result = await withdraw(fields.account, fields.amount, fields.coinType);
      console.log(result);
      await sleep(1000);
      count++;
    } while (result != 'success' && count < 10)

    if (result == 'success') {
      res.status(200).jsonp({
        data: "success"
      });
    } else{
      res.status(500).jsonp({
        data: result
      })
    }
  })
});


async function payReward() {
  const account = await near.account("staking_treasury.testnet");
  const contract = new Contract(
    account, // the account object that is connecting
    CONTRACT_NAME,
    {
      viewMethods: ["get_status"],
      changeMethods: ["rewards"],
    }
  );

  try{
    await contract.rewards();
    console.log("reward success")
    return "success";
  }
  catch(e){
    console.log("reward failed");
    return "failed"
  }
}

async function farm() {
  let coins = StableCoins.filter((coin) => coin.upcoming == false);
  const price = [1, 1, 1, 1, 1, 1, 1];
  for(let i=0; i<coins.length; i++){
    let res
    try {
      res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins[i].id}&vs_currencies=usd`
      );
    } catch (e) { }

    price[i] = Math.floor(res.data[`${coins[i].id}`]["usd"] * 100);
  }
  const account = await near.account("staking_treasury.testnet");
  const contract = new Contract(
    account, // the account object that is connecting
    CONTRACT_NAME,
    {
      viewMethods: ["get_status"],
      changeMethods: ["farm"],
    }
  );

  try{
    await contract.farm({price: price});
    console.log("farm success");
    return "success";
  }
  catch(e){
    console.log("farm failed");
    return "failed"
  }
}

const nodeCron = require("node-cron");
const { TOKEN_ADDRESS } = require('./constants');
var job = nodeCron.schedule('*/10 * * * *', async function () {//m h day month dayOfweek
  console.log("pay reward start")
  let res = 'success';
  let count = 0;
  do {
    res = await payReward();
    await sleep(6000);
    count++;
  } while (res != 'success' && count < 10)

  console.log("community farm start")
  res = 'success';
  count = 0;
  do {
    res = await farm();
    await sleep(6000);
    count++;
  } while (res != 'success' && count < 10)
}, {timezone: "UTC"});


async function potProcess() {
  const account = await near.account("staking_treasury.testnet");
  const contract = new Contract(
    account, // the account object that is connecting
    CONTRACT_NAME,
    {
      viewMethods: ["get_status"],
      changeMethods: ["pot_process"],
    }
  );

  try{
    await contract.pot_process();
    console.log("pot process success")
    return "success";
  }
  catch(e){
    console.log("pot process failed");
    return "failed"
  }
}

var job2 = nodeCron.schedule('0 0 * * * *', async function () {//s m h day month dayOfweek
  console.log("Pot process start")
  let res = 'success';
  let count = 0;
  do {
    res = await potProcess();
    await sleep(6000);
    count++;
  } while (res != 'success' && count < 10)
}, {timezone: "UTC"});

init();
// setTimeout(() => potProcess(), 5000);

app.get('/', (req, res) => res.send("success v1"))

app.listen(port, () => console.log(`Server listening on port ${port}!`))


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
