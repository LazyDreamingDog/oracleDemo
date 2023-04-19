const common = require('./utils/common.js')
const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 20000
//const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || './caller/caller_private_key'
const CallerJSON = require('./build/contracts/CallerContract.json')
const OracleJSON = require('./build/contracts/HashOracle.json')

async function getCallerContract(web3js) {
    const networkId = await web3js.eth.net.getId()
    console.log(networkId)
    console.log(CallerJSON.networks[networkId].address)
    return new web3js.eth.Contract(CallerJSON.abi, CallerJSON.networks[networkId].address)
}

async function filterEvents (callerContract) {
    callerContract.events.getHashEvent({ filter: { } }, async (err, event) => {
      if (err) console.error('Error on event', err)
      console.log('* New getHash event. hashRes: ' + event.returnValues.hashRes)
    })
    callerContract.events.ReceivedNewHashRequestEvent({ filter: { } }, async (err, event) => {
      if (err) console.error('Error on event', err)
      console.log("请求已成功创建, id = " + event.returnValues.id + ",hashMes = " + event.returnValues.hashMessage)
    })
}

async function init () {
    const { accounts, web3js } = await common.loadAccount()
    const ownerAddress = accounts[0]
    console.log("Caller_Address = " + ownerAddress)
    const callerContract = await getCallerContract(web3js)
    filterEvents(callerContract)
    return { callerContract, ownerAddress, web3js }
}

(async () => {
    const { callerContract, ownerAddress, web3js } = await init()
    process.on( 'SIGINT', () => {
      console.log('Calling client.disconnect()')
      // client.disconnect();
      process.exit();
    })

    const networkId = await web3js.eth.net.getId()
    const oracleAddress =  OracleJSON.networks[networkId].address
    console.log(oracleAddress)
    // await callerContract.methods.setOracleInstanceAddress(oracleAddress).send({ from: ownerAddress })
    setInterval( async () => {
      // Start here
      i=1;
      console.log("start " + i)
      await callerContract.methods.hashRequest("hello world", oracleAddress).send({gasLimit: 1000000,from:ownerAddress})
      console.log("Have send a request!");
      i=i+1
    }, SLEEP_INTERVAL);
})()