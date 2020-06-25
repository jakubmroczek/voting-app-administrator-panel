const mongo = require('mongodb');
const generator = require('generate-password');
const { getDb } = require('./db.js');

const blockchainUtils = require('./blockchain_utils.js');

const COLLECTION = 'elections';

async function create(_1, _2, { user }) {
  const db = getDb();
  const { username } = user;

  const election = {
    status: 'New',
    title: '',
    candidates: [],
    participants: [],
    publicKeys: [],
    normalizedPublicKeys: [],
  };

  const result = await db.collection(COLLECTION).insertOne(election);
  const savedElection = await db.collection(COLLECTION).findOne({ _id: result.insertedId });
  await db.collection('users').updateOne({ username }, { $push: { electionIDs: result.insertedId } });
  return savedElection;
}

async function list(_1, _2, { user }) {
  const db = getDb();
  const { username } = user;
  const dbUser = await db.collection('users').findOne({ username });
  const { electionIDs } = dbUser;
  const elections = await db.collection(COLLECTION).find({ _id: { $in: electionIDs } }).toArray();
  return elections;
}

async function get(_, { id }) {
  const db = getDb();
  const filter = { _id: mongo.ObjectID(id) };
  const election = await db.collection(COLLECTION).findOne(filter);
  return election;
}

async function update(_, { id, changes }) {
  const db = getDb();
  const filter = { _id: mongo.ObjectID(id) };
  if (changes.title || changes.candidates || changes.participants || changes.smartContract.address) {
    const election = await db.collection(COLLECTION).findOne(filter);
    Object.assign(election, changes);
  }
  await db.collection(COLLECTION).updateOne(filter, { $set: changes });
  const savedElection = await db.collection(COLLECTION).findOne(filter);
  return savedElection;
}

// TODO: Never used
async function remove(_, { id }, { user }) {
  const db = getDb();
  const { username } = user;
  const filter = { _id: mongo.ObjectID(id) };
  const result = await db.collection(COLLECTION).removeOne(filter);
  await db.collection('users').updateOne(
    { username },
    { $pull: { electionIDs: { id } } },
  );
  return result.deletedCount === 1;
}

// TODO: Not CRUD operation, where is should be?
async function setElectionInPublicKeyRegisterationStage(_, { id }) {
  const electionDB = await get({}, { id });

  const status = 'Registration';
  const { participants } = electionDB;

  // Lame for loop
  const { length } = participants;
  for (let i = 0; i < length; i += 1) {
    const participant = participants[i];
    const secretToken = generator.generate({
      length: 32,
      numbers: true,
    });
    participants[i] = {
      ...participant,
      secretToken,
    };
  }

  const changes = { status, participants };
  const savedElection = await update({}, { id, changes });
  return savedElection;
}

async function deployElection(_, { id }) {
  const electionDB = await get({}, { id });

  // TODO: What does it return
  // Returns abi and bytecode
  const smartContract = blockchainUtils.compile(electionDB);
  const changes = { smartContract, status: 'Deployed' };
  const updatedElection = await update({}, { id, changes });
  return updatedElection;
}

module.exports = {
  create, list, get, update, remove, setElectionInPublicKeyRegisterationStage, deployElection,
};
