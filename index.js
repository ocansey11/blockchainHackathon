const Blockchain = require('./Blockchain');
const Agent = require('./Agent');

const chain = new Blockchain();

// Add some agents
chain.addAgent(new Agent('GPT-001'));
chain.addAgent(new Agent('GPT-002'));
chain.addAgent(new Agent('GPT-003'));

// Try proposing a block
const block = chain.proposeBlock({ sender: "Alice", receiver: "Bob", amount: 50 });

console.log(JSON.stringify(block, null, 2));
