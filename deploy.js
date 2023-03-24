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

async function sendTx(){
	let walletSigner = wallet.connect(provider)
	let send_token_amount = "1"
	let to_address = "0x3DF95c73357f988F732c4c7a8Fa2f9beD7952862"
	let send_address = "0xbbE4733d85bc2b90682147779DA49caB38C0aA1F"
	let gas_limit = "0x100000"

   let gas_price = "0x100000000"

	const tx = {
  		from: send_address,
  		type: 0,
  		to: to_address,
  		value: ethers.utils.parseEther(send_token_amount),
  		nonce: provider.getTransactionCount(send_address, "latest"),
  		gasLimit: ethers.utils.hexlify(gas_limit), // 100000
  		gasPrice: gas_price,
	}
	walletSigner.sendTransaction(tx).then((transaction) => {
  		console.dir(transaction)
	})
}

async function run() {
   await deployContract(jsonAbi,bytecode,wallet)
   await callContract(contractAddr, jsonAbi, provider)
   await sendTx()
} 

run()
