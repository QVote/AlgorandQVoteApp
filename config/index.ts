type Protocol = { chainId: number; msgVersion: number };

export type BlockchainInfo = {
  url: string;
  protocol: Protocol;
};

const local = {
  url: "http://localhost:5555",
  protocol: { chainId: 222, msgVersion: 1 },
};

const testNet = {
  url: "https://dev-api.zilliqa.com",
  protocol: { chainId: 333, msgVersion: 1 },
};

const mainNet = {
  url: "https://api.zilliqa.com/",
  protocol: { chainId: 1, msgVersion: 1 },
};

const blockchains = {
  testnet: testNet,
  mainnet: mainNet,
  private: local,
};

export const BLOCKCHAINS = blockchains;
