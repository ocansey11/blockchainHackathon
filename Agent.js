class Agent {
  constructor(agentId) {
    this.agentId = agentId;
  }

  reviewBlock(block) {

    if (this.agentId === 'GPT-001') {
      return this.reviewBlockForGPT001(block);
    } else if (this.agentId === 'GPT-002') {
      return this.reviewBlockForGPT002(block);
    } else if (this.agentId === 'GPT-003') {
      return this.reviewBlockForGPT003(block);
    } else {
      throw new Error(`Unknown agent: ${this.agentId}`);
    }
    
  }

  reviewBlockForGPT001(block) {
  const riskScore = Math.floor(Math.random() * 19); // Placeholder logic
    const decision = riskScore < 6 ? 'approve' : 'reject';
    const summary = `Agent ${this.agentId}: risk=${riskScore}`;

    return {
      agentId: this.agentId,
      decision,
      score: riskScore,
      summary
    };

  }
  reviewBlockForGPT002(block) {
    const riskScore = Math.floor(Math.random() * 10); // Placeholder logic
    const decision = riskScore < 5 ? 'approve' : 'reject';
    const summary = `Agent ${this.agentId}: risk=${riskScore}`;

    return {
      agentId: this.agentId,
      decision,
      score: riskScore,
      summary
    };
  }
  reviewBlockForGPT003(block) {
    const riskScore = Math.floor(Math.random() * 10); // Placeholder logic
    const decision = riskScore < 7 ? 'approve' : 'reject';
    const summary = `Agent ${this.agentId}: risk=${riskScore}`;

    return {
      agentId: this.agentId,
      decision,
      score: riskScore,
      summary
    };
  }
}

module.exports = Agent;
