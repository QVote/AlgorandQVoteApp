type Protocol = { chainId: number; msgVersion: number };

export type BlockchainInfo = {
  url: string;
  protocol: Protocol;
  name: string;
};

const privateConf = {
  url: "http://localhost:5555",
  protocol: { chainId: 222, msgVersion: 1 },
  name: "private",
};

const testnet = {
  url: "https://dev-api.zilliqa.com",
  protocol: { chainId: 333, msgVersion: 1 },
  name: "testnet",
};

const mainnet = {
  url: "https://api.zilliqa.com/",
  protocol: { chainId: 1, msgVersion: 1 },
  name: "mainNet",
};

const blockchains = {
  testnet,
  mainnet,
  private: privateConf,
};

export const BLOCKCHAINS = blockchains;
