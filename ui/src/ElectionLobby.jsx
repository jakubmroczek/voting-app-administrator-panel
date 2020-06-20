import React from 'react';
import { Button } from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';

import deploy from './deploy.js';

// TODO: Is this okay in the react?
const Web3 = require('web3');

export default class ElectionLobby extends React.Component {
  constructor(props) {
    super(props);
    this.fetchSmartContract = this.fetchSmartContract.bind(this);
    this.deployElection = this.deployElection.bind(this);
    this.bytecodeObject = this.bytecodeObject.bind(this);
    this.abi = this.abi.bind(this);
    this.metaMaskInit = this.metaMaskInit.bind(this);
  }

  web3Provider = null;

  web3 = null;

  async fetchSmartContract() {
    const query = `mutation  
      deployElection($id: ID!) {
        deployElection(id: $id) {
                  title
                  smartContract {
                    bytecode
                    abi
                  }
              }
    }`;

    const { id } = this.props;
    const response = await graphQLFetch(query, { id });

    if (response) {
      const { smartContract, title } = response.deployElection;
      this.setState({ smartContract, title });
    } else {
      alert('getElection call failed');
    }
  }

  // TODO: Move to the state
  bytecodeObject() {
    const { smartContract } = this.state;
    const { bytecode } = smartContract;
    const { object } = JSON.parse(bytecode);
    return `0x${object}`;
  }

  // TODO: Move to the state
  abi() {
    const { smartContract } = this.state;
    const { abi } = smartContract;
    const result = JSON.parse(abi);
    return result;
  }

  async update(address) {
    // TODO: Do not resend ABI, change it on the backend.
    const query = `mutation 
        updateElection($id: ID!, $changes: ElectionUpdateInputs!) {
          updateElection(id: $id, changes: $changes) {
                  title
                }
    }`;
    const { id } = this.props;

    // TODO: Do not do this, change backend logic
    const { smartContract: sm } = this.state;
    const { bytecode, abi } = sm;

    const smartContract = { address, bytecode, abi };
    const changes = { smartContract };
    const vars = { id, changes };
    const data = await graphQLFetch(query, vars);
    if (data) {
      alert('Successful deployment!!')
    } else {
      alert(`Could deploy the smart contract}`);
    }
  }

  async metaMaskInit() {
    // TODO: What does Modern means?
    // Modern dapp browsers...
    if (window.ethereum) {
      this.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        // TODO: Beter error handling
        console.error('User denied account access');
      }
    } else if (window.web3) {
      // Legacy dapp browsers...
      this.web3Provider = window.web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      // TODO: This should be removed from production code
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    this.web3 = new Web3(this.web3Provider);
  }

  async deployElection() {
    await this.fetchSmartContract();
    await this.metaMaskInit();

    const account = window.web3.eth.defaultAccount;

    const bytecode = this.bytecodeObject();
    const abi = this.abi();
    const { title: electionTitle } = this.state;

    // TODO: How to handle success or failure of the deploy
    const contractAddress = await deploy(bytecode, abi, electionTitle, account, this.web3);
    await this.update(contractAddress);
  }

  render() {
    return (
      <>
        <h1>Please wait for voters to register</h1>
        <Button onClick={this.deployElection}>
          Deploy election on blockchain
        </Button>
      </>
    );
  }
}
