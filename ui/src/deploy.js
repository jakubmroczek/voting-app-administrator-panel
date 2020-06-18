const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');

// const web3 = new Web3('https://ropsten.infura.io/v3/76ba732d07064c4ab4178385fc6c005f');
const web3 = new Web3('http://localhost:8545');

const account1 = '0x6bbe6b9946B280a633Bc424BdA575132E95d1695';
// const pK1 = Buffer.from('0xc39b1962b1910e8724095df3e3cb41150d6a6f1c0739a9869db1b195facee6c9');
const pK1 = Buffer.from('dda520c88004cb0b8a9e4cea64c55bd0a124571419bff59d872b300660a9e389', 'hex');

web3.eth.getTransactionCount(account1, (err, txCount) => {
    // Smart contract data
  // Fetch the compiled code from the backend

  // This is some form of slightely chnaged bytecode
  const data = '0x608060405234801561001057600080fd5b5060c78061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80636057361d146037578063b05784b8146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b60686088565b6040518082815260200191505060405180910390f35b8060008190555050565b6000805490509056fea26469706673582212208dea039245bf78c381278382d7056eef5083f7d243d8958817ef447e0a403bd064736f6c63430006060033';

  // Create transaction object
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    // How to minimize this
    gasLimit: web3.utils.toHex(1000000),
    // How to minimize this
    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
    data,
  };

  // Sign the transaction
  const tx = new Tx(txObject, {'chain':'ropsten'});
  tx.sign(pK1);

  const serializedTx = tx.serialize();
  const raw = `0x${serializedTx.toString('hex')}`;

  // Broadcast the tranasction
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log('err:', err, 'txHash', txHash);
    // Use this txHash to find the contract on Etherscan
  });
});
