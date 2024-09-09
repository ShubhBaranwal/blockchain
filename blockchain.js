const Block = require("./block"); // Import the Block class for creating new blocks
const cryptoHash = require("./crypto-hash"); // Import the cryptoHash function for hashing data

class Blockchain {
  constructor() {
    // Initialize the blockchain with the genesis block (first block)
    this.chain = [Block.genesis()];
  }

  // Method to add a new block to the chain
  addBlock({ data }) {
    // Mine a new block based on the previous block and provided data
    const newBlock = Block.mineBlock({
      prevBlock: this.chain[this.chain.length - 1], // The last block in the chain is the previous block
      data, // New data to be added to the block
    });

    // Add the newly mined block to the chain
    this.chain.push(newBlock);
  }

  // Method to replace the current chain with a new one (for consensus)
  replaceChain(chain) {
    // Ensure the incoming chain is longer than the current chain
    if (chain.length <= this.chain.length) {
      console.error("The incoming chain is not longer"); // Error if the chain is shorter or equal in length
      return;
    }

    // Validate if the incoming chain is a valid blockchain
    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain is not valid"); // Error if the incoming chain is invalid
      return;
    }

    // Replace the current chain with the new valid chain
    this.chain = chain;
  }

  // Static method to validate the entire chain
  static isValidChain(chain) {
    // Check if the first block matches the genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false; // Return false if the first block isn't the valid genesis block
    }

    // Loop through each block starting from the second block
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, prevHash, hash, nonce, difficulty, data } = chain[i]; // Destructure the block properties
      const lastDifficulty = chain[i - 1].difficulty; // The difficulty of the previous block
      const realLastHash = chain[i - 1].hash; // The hash of the previous block

      // Check if the previous hash in the block matches the hash of the previous block
      if (prevHash !== realLastHash) return false;

      // Validate the block's hash by recalculating it with cryptoHash function
      const validatedHash = cryptoHash(
        timestamp,
        prevHash,
        nonce,
        difficulty,
        data
      );
      
      // If the block's hash doesn't match the recalculated hash, it's invalid
      if (hash !== validatedHash) return false;

      // Ensure the difficulty level only adjusts by a maximum of 1
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    // If all checks pass, the chain is valid
    return true;
  }
}

// Example usage of the Blockchain class
// const blockchain = new Blockchain();
// blockchain.addBlock({ data: "Block1" });
// blockchain.addBlock({ data: "Block2" });
// const result = Blockchain.isValidChain(blockchain.chain);
// console.log(blockchain.chain); // Log the blockchain's current state
// console.log(result); // Check if the chain is valid
// //console.log(blockchain);

// Export the Blockchain class for use in other modules
module.exports = Blockchain;
