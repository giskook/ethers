const {ethers} = require("ethers")
const fs = require('fs')
 
let provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
 
function getHexString(prikeyPath) {
    const privKeyFile = fs.readFileSync(prikeyPath).toString().trim();
    const privKey = new Buffer.from(privKeyFile, 'hex');    
    return privKey
}
 
// var privKey  = getHexString(".secret")
var privKey = '0x8ff3ca2d9985c3a52b459e2f6e7822b23e1af845961e22128d5f372fb9aa5f17'
let wallet = new ethers.Wallet(privKey,provider)
 
var jsonStr = fs.readFileSync('./SimpleStorage.json')
var jsonInfo = JSON.parse(jsonStr)
var jsonAbi  = jsonInfo.abi
var bytecode = jsonInfo.bytecode
var contractAddr = "0x45dD91b0289E60D89Cec94dF0Aac3a2f539c514a"
 
async function deployContract(abi,bytecode,wallet) {
    let factory = new ethers.ContractFactory(abi,bytecode,wallet)
    let contractObj = await factory.deploy("Hello, World!")
    console.log('contractAddress=',contractObj.address)
    console.log('deploy txHash=',contractObj.deployTransaction.hash)
 
    contractAddr = contractObj.address
    await contractObj.deployed()   
}

async function callContract(contractAddress, abi, provider) {
    let contract = new ethers.Contract(contractAddress, abi, provider);
    // 获取当前的值
    let currentValue = await contract.getValue();

    console.log(currentValue);

    // 使用签名器创建一个新的合约实例，它允许使用可更新状态的方法
    let contractWithSigner = contract.connect(wallet);
    // 设置一个新值，返回交易
    let tx = await contractWithSigner.setValue("I love OKex!");
    // 查看: https://ropsten.etherscan.io/tx/0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364
    console.log(tx.hash);
    // 操作还没完成，需要等待交易被打包
    await tx.wait();
    // 再次调用合约的 getValue()
    let newValue = await contract.getValue();
    console.log(newValue);
}

async function run() {
    await deployContract(jsonAbi,bytecode,wallet)
    await callContract(contractAddr, jsonAbi, provider)
} 

run()
