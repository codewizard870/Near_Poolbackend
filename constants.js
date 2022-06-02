const crypto = require('crypto');

function encrypt3DES(data, key) {
 const md5Key = crypto.createHash('md5').update(key).digest("hex").substr(0, 24);
 const cipher = crypto.createCipheriv('des-ede3', md5Key, '');

 let encrypted = cipher.update(data, 'utf8', 'base64');
 encrypted += cipher.final('base64');
 return encrypted;
}

function decrypt3DES(data, key) {
 const md5Key = crypto.createHash('md5').update(key).digest("hex").substr(0, 24);
 const decipher = crypto.createDecipheriv('des-ede3', md5Key, '');

 let encrypted = decipher.update(data, 'base64', 'utf8');
 encrypted += decipher.final('utf8');
 return encrypted;
}

// const TERRA_SEED = decrypt3DES("wNGkDc9ZSAiWm4Y2L+Fog2xev8DC/hJLoiEWB7m01PGIYye/McmorgyAz1NiNiEZjRZXKY+Cd8Gut8pCIYMkZICPwohWzk0pwI9X/9xeR1j2Lh8y3ZmhP1o+/6huNG3LfDtECahzO0Ngnl2Xl2u2ugMYJgEIKYoZYZ7Yj16Pjhg8lnp5K+Ts/Pxj8Pyx3EMdQiHGRJa/X/fit+Sp58pJIA==", "Thisisaprettyquity");

const CONTRACT_NAME = 'staking1.alenzertest.testnet'; /* TODO: fill this in! */
function getConfig (env) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
      }
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
      }
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`)
  }
}

const StableCoins=[
  {
    name: 'USDC',
    id: 'usd-coin',
    description: 'USD Coin',
    avatar: 'Usdc.svg',
    apr: 14.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320,
    stable: true,
    upcoming: false
  },
  {
    name: 'USDT',
    id: 'tether',
    description: 'USD Tether',
    avatar: 'Usdt.svg',
    apr: 14.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: true,
    upcoming: false
  },
  {
    name: 'DAI',
    id: 'dai',
    description: 'Dai',
    avatar: 'Dai.svg',
    apr: 14.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: true,
    upcoming: false
  },
  {
    name: 'USN',
    id: 'usn',
    description: 'USD NEAR',
    avatar: 'Usn.svg',
    apr: 14.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: true,
    upcoming: false
  },
  {
    name: 'wBTC',
    id: 'wrapped-bitcoin',
    description: 'Wrapped Bitcoin',
    avatar: 'Wbtc.svg',
    apr: 9.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: false,
    upcoming: false
  },
  {
    name: 'ETH',
    id: 'ethereum',
    description: 'Ethereum',
    avatar: 'Eth.png',
    apr: 9.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: false,
    upcoming: false
  },
  {
    name: 'wNEAR',
    id: 'wrapped-near',
    description: 'Wrapped Near',
    avatar: 'Wnear.svg',
    apr: 9.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: false,
    upcoming: false
  },
  {
    name: 'NEARt',
    description: 'Near Treasury (Cooming Soon)',
    avatar: 'Neart.svg',
    apr: 9.87,
    tvl_coin: 47243320,
    tvl_usd: 47243320, 
    stable: false,
    upcoming: true
  }
]


module.exports = {
  CONTRACT_NAME,
  StableCoins,
  getConfig,
  encrypt3DES,
  decrypt3DES
}
