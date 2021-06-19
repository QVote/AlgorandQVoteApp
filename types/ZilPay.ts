/**
 * There are no types for the *modified* Zilliqa sdk object
 * So the types are determined experimentally from chrome devtools :)
 */

type Wallet = {
    connect: () => Promise<boolean>;
    net: string;
    observableAccount: () => {
        subscribe: (func: (account: any) => void) => () => void;
    };
    observableNetwork: () => {
        subscribe: (func: (net: any) => void) => () => void;
    };
    defaultAccount?: { base16: string };
};

type Provider = any;

export type ZilPay = {
    provider: Provider;
    wallet: Wallet;
    blockchain: {
        getLatestTxBlock: () => Promise<any>;
        getMinimumGasPrice: () => Promise<any>;
        getTransaction: (id: string) => Promise<any>;
        getBlockChainInfo: () => Promise<any>;
        provider: Provider;
        wallet: Wallet;
    };
    transactions: {
        provider: Provider;
        wallet: Wallet;
    };
    contracts: {
        new: (code: string, init: any) => any;
        at: (address: string) => any;
        transactions: {
            provider: Provider;
            wallet: Wallet;
        };
    };
    utils: {
        validation: {};
        bytes: {};
        units: {
            Units: {
                Zil: "zil";
                Li: "li";
                Qa: "qa";
            };
        };
    };
    crypto: {};
    ERRORS: {
        REQUIRED: "is required";
        INIT_PARAMS: "Cannot deploy without code or initialisation parameters.";
        CONNECT: "User is't connections.";
        DISABLE_DMETHOD: "this method not allowed in ZIlPay";
        DISABLED: "ZilPay is disabled.";
        CONTRACT_HASN_TDEPLOYED: "Contract has not been deployed!";
        MUST_BE_OBJECT: "must be object.";
        MUST_BE_STRING: "must be string.";
    };
};
