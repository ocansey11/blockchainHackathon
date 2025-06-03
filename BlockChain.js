const Block = require('./Block');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.agents = [];
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  proposeBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      Date.now().toString(),
      data,
      this.getLatestBlock().hash
    );

    // Let agents vote
    this.agents.forEach(agent => {
      const vote = agent.reviewBlock(newBlock);
      newBlock.addAgentVote(vote);
    });

    if (newBlock.isApproved()) {
      this.chain.push(newBlock);
      console.log("✅ Block approved and added.");
    } else {
      console.log("❌ Block rejected by agents.");
    }

    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i];
      const prev = this.chain[i - 1];

      if (curr.hash !== curr.calculateHash()) return false;
      if (curr.previousHash !== prev.hash) return false;
    }

    return true;
  }
}

module.exports = Blockchain;
