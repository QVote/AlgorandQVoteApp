type Protocol = { chainId: number; msgVersion: number };

export type BlockchainInfo = {
  url: string;
  protocol: Protocol;
  name: "private" | "testnet" | "mainnet";
};

const privateConf: BlockchainInfo = {
  url: "http://localhost:5555",
  protocol: { chainId: 222, msgVersion: 1 },
  name: "private",
};

const testnet: BlockchainInfo = {
  url: "https://dev-api.zilliqa.com",
  protocol: { chainId: 333, msgVersion: 1 },
  name: "testnet",
};

const mainnet: BlockchainInfo = {
  url: "https://api.zilliqa.com/",
  protocol: { chainId: 1, msgVersion: 1 },
  name: "mainnet",
};

const blockchains: {
  testnet: BlockchainInfo;
  mainnet: BlockchainInfo;
  private: BlockchainInfo;
} = {
  testnet,
  mainnet,
  private: privateConf,
};

export const BLOCKCHAINS = blockchains;
