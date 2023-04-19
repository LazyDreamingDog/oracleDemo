const axios = require('axios')
const BN = require('bn.js')
const common = require('./utils/common.js')
const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000
// const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || './oracle/oracle_private_key'
// const CHUNK_SIZE = process.env.CHUNK_SIZE || 3
// const MAX_RETRIES = process.env.MAX_RETRIES || 5
var OracleJSON = require('./build/contracts/HashOracle.json')
var pendingRequests = []

// start here
async  function getOracleContract(web3js) {
    var networkId = await web3js.eth.net.getId()
    console.log(networkId)
    return new web3js.eth.Contract(OracleJSON.abi, OracleJSON.networks[networkId].address)
}

// 调用cryptoAPI的hash方法
async function getHash(hashMes) {
    const resp = await axios({
        url: "http://localhost:8000/crypto/hash",
        data: {
          hashType:"sha256",        // 为了便于测试固定hashType为sha256
          hashMessage:hashMes
        },
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        }
    })
    // console.log(resp.data)
    // console.log(resp.data.res)
    return resp.data.res
}

// 监听事件
async function filterEvents(oracleContract, web3js) {
    oracleContract.events.GetHashRequestEvent(async (err, event) => {
        if (err) {
          console.error('Error on event', err)
          return
        }
        await addRequestToQueue(event)
    })
    oracleContract.events.SetHashResEvent(async (err, event) => {
        if (err) console.error('Error on event', err)
    })
}

// 记录请求队列
async function addRequestToQueue(event) {
    const callerAddress = event.returnValues.callerAddress
    const hashMessage = event.returnValues.hashMes
    const id = event.returnValues.id
    pendingRequests.push({callerAddress, hashMessage, id})
    console.log("接收到一个哈希请求, id = ",id," hashMes = ", hashMessage, " callerAddress = ", callerAddress)
}

// 处理队列
async function processQueue(oracleContract, ownerAddress) {
    let processedRequests = 0
    while(pendingRequests.length > 0 && processedRequests < 3) {
        const req = pendingRequests.shift()
        console.log("开始处理 id = "+req.id)
        // 调用函数处理请求
        await processRequest(oracleContract, ownerAddress, req.id, req.hashMessage, req.callerAddress)
        processedRequests++
        console.log(processedRequests)
    }
}

// 处理请求
async function processRequest(oracleContract, ownerAddress, id, hashMes, callerAddress) {
    try {
        const hashRes = await getHash(hashMes)
        console.log("成功计算哈希值 hashRes = " + hashRes)
        await setHashRes(oracleContract,callerAddress,ownerAddress,hashRes,id)
    } catch (error) {
        if (retries === MAX_RETRIES - 1) {
            await setHashRes(oracleContract,callerAddress,ownerAddress," ",id)
            return
        }
    }
}

async function setHashRes(oracleContract,callerAddress,ownerAddress,hashRes,id) {
    const idInt = new BN(parseInt(id))
    try {
        // 调用合约方法
        await oracleContract.methods.setHashRes(hashRes, callerAddress, idInt.toString()).send({gasLimit:1000000,from:ownerAddress})
    } catch (error) {
        console.log('Error encountered while calling setHashRes.')
        console.log(error);
    }
}

// init
async function init() {
    const { accounts, web3js } = await common.loadAccount()
    const ownerAddress = accounts[0]

    console.log("Oracle_Address = " + ownerAddress)

    const oracleContract = await getOracleContract(web3js)

    filterEvents(oracleContract,web3js)

    console.log("start to listen!")

    return {oracleContract,ownerAddress }
}

(async () => {
    const { oracleContract, ownerAddress } = await init()
    process.on( 'SIGINT', () => {
        console.log('Calling client.disconnect()')
        // 1. Execute client.disconnect
        //   client.disconnect()
        process.exit()
    })
    setInterval(async () => {
        // 2. Run processQueue
        await processQueue(oracleContract,ownerAddress)
    }, SLEEP_INTERVAL)
  })()