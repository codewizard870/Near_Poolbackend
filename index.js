const axios = require('axios');

const CONTRACT_NAME = require("./constants").CONTRACT_NAME;
const StableCoins = require("./constants").StableCoins;
const encrypt3DES = require("./constants").encrypt3DES;
const decrypt3DES = require("./constants").decrypt3DES;
const getConfig = require("./constants").getConfig;

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

  let withdraw_msg = {
    account: sender,
    coin: coinType,
    amount: amount,
    price: price
  }
console.log(withdraw_msg);
  const account = await near.account("staking_treasury.testnet");
  const contract = new Contract(
    account, // the account object that is connecting
    CONTRACT_NAME,
    {
      viewMethods: ["get_status"],
      changeMethods: ["withdraw"],
    }
  );

  try{
    await contract.withdraw(withdraw_msg);
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
console.log(near)
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
init();
// setTimeout(() => payReward(), 5000);

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
});


// async function potProcess() {
//   let msg_pot = {
//     "pot_process": {}
//   };

//   const pot = new MsgExecuteContract(
//     mk.accAddress,
//     poolAddress,
//     msg_pot,
//     {}
//   )

//   let res = await EstimateSend([pot], "pot_process");
//   if (res == "success") console.log("pot process suceess");
//   else console.log("pot process failed");
//   return res;
// }

// var job2 = nodeCron.schedule('0 0 0 28 * *', async function () {//s m h day month dayOfweek
//   console.log("Pot process start")
//   let res = 'success';
//   let count = 0;
//   do {
//     res = await potProcess();
//     await sleep(6000);
//     count++;
//   } while (res != 'success' && count < 10)
// });


app.get('/', (req, res) => res.send("success v21"))

app.listen(port, () => console.log(`Server listening on port ${port}!`))


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
