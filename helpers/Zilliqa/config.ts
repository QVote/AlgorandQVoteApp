import type { ZilPay } from "../../types";
declare global {
    interface Window {
        zilPay?: ZilPay;
    }
}
type Protocol = { chainId: number; msgVersion: number };
type Networks = "private" | "testnet" | "mainnet";
type BlockchainInfo = {
    url: string;
    protocol: Protocol;
    name: Networks;
};
export const blockchains: {
    [key in Networks]: BlockchainInfo;
} = {
    testnet: {
        url: "https://dev-api.zilliqa.com",
        protocol: { chainId: 333, msgVersion: 1 },
        name: "testnet",
    },
    mainnet: {
        url: "https://api.zilliqa.com/",
        protocol: { chainId: 1, msgVersion: 1 },
        name: "mainnet",
    },
    private: {
        url: "http://localhost:5555",
        protocol: { chainId: 222, msgVersion: 1 },
        name: "private",
    },
};
