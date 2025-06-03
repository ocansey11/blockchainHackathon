const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.agentVotes = []; // Each vote: { agentId, decision, score, summary }
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const raw = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + JSON.stringify(this.agentVotes);
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  addAgentVote(vote) {
    this.agentVotes.push(vote);
    this.hash = this.calculateHash(); // Update hash when votes change
  }

  isApproved(threshold = 0.6) {
    const approvals = this.agentVotes.filter(v => v.decision === 'approve').length;
    return approvals / this.agentVotes.length >= threshold;
  }
}

module.exports = Block;
