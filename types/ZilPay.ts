//this is embarrasing

export type ZilPay = {
  provider: {
    middleware: {
      request: {};
      response: {};
    };
    RPCMethod: {
      GetNetworkId: "GetNetworkId";
      GetBlockchainInfo: "GetBlockchainInfo";
      GetShardingStructure: "GetShardingStructure";
      GetDSBlock: "GetDsBlock";
      GetLatestDSBlock: "GetLatestDsBlock";
      GetNumDSBlocks: "GetNumDSBlocks";
      GetDSBlockRate: "GetDSBlockRate";
      DSBlockListing: "DSBlockListing";
      GetTxBlock: "GetTxBlock";
      GetLatestTxBlock: "GetLatestTxBlock";
      GetNumTxBlocks: "GetNumTxBlocks";
      GetTxBlockRate: "GetTxBlockRate";
      TxBlockListing: "TxBlockListing";
      GetNumTransactions: "GetNumTransactions";
      GetTransactionRate: "GetTransactionRate";
      GetCurrentMiniEpoch: "GetCurrentMiniEpoch";
      GetCurrentDSEpoch: "GetCurrentDSEpoch";
      GetPrevDifficulty: "GetPrevDifficulty";
      GetPrevDSDifficulty: "GetPrevDSDifficulty";
      GetTotalCoinSupply: "GetTotalCoinSupply";
      GetMinerInfo: "GetMinerInfo";
      CreateTransaction: "CreateTransaction";
      GetTransaction: "GetTransaction";
      GetTransactionStatus: "GetTransactionStatus";
      GetRecentTransactions: "GetRecentTransactions";
      GetTransactionsForTxBlock: "GetTransactionsForTxBlock";
      GetTxnBodiesForTxBlock: "GetTxnBodiesForTxBlock";
      GetNumTxnsTxEpoch: "GetNumTxnsTxEpoch";
      GetNumTxnsDSEpoch: "GetNumTxnsDSEpoch";
      GetMinimumGasPrice: "GetMinimumGasPrice";
      GetPendingTxn: "GetPendingTxn";
      GetPendingTxns: "GetPendingTxns";
      GetSmartContracts: "GetSmartContracts";
      GetSmartContractCode: "GetSmartContractCode";
      GetSmartContractInit: "GetSmartContractInit";
      GetSmartContractState: "GetSmartContractState";
      GetSmartContractSubState: "GetSmartContractSubState";
      GetContractAddressFromTransactionID: "GetContractAddressFromTransactionID";
      GetBalance: "GetBalance";
    };
  };
  wallet: {};
  blockchain: {
    getLatestTxBlock: () => Promise<any>;
    getMinimumGasPrice: () => Promise<any>;
    provider: {
      middleware: {
        request: {};
        response: {};
      };
      RPCMethod: {
        GetNetworkId: "GetNetworkId";
        GetBlockchainInfo: "GetBlockchainInfo";
        GetShardingStructure: "GetShardingStructure";
        GetDSBlock: "GetDsBlock";
        GetLatestDSBlock: "GetLatestDsBlock";
        GetNumDSBlocks: "GetNumDSBlocks";
        GetDSBlockRate: "GetDSBlockRate";
        DSBlockListing: "DSBlockListing";
        GetTxBlock: "GetTxBlock";
        GetLatestTxBlock: "GetLatestTxBlock";
        GetNumTxBlocks: "GetNumTxBlocks";
        GetTxBlockRate: "GetTxBlockRate";
        TxBlockListing: "TxBlockListing";
        GetNumTransactions: "GetNumTransactions";
        GetTransactionRate: "GetTransactionRate";
        GetCurrentMiniEpoch: "GetCurrentMiniEpoch";
        GetCurrentDSEpoch: "GetCurrentDSEpoch";
        GetPrevDifficulty: "GetPrevDifficulty";
        GetPrevDSDifficulty: "GetPrevDSDifficulty";
        GetTotalCoinSupply: "GetTotalCoinSupply";
        GetMinerInfo: "GetMinerInfo";
        CreateTransaction: "CreateTransaction";
        GetTransaction: "GetTransaction";
        GetTransactionStatus: "GetTransactionStatus";
        GetRecentTransactions: "GetRecentTransactions";
        GetTransactionsForTxBlock: "GetTransactionsForTxBlock";
        GetTxnBodiesForTxBlock: "GetTxnBodiesForTxBlock";
        GetNumTxnsTxEpoch: "GetNumTxnsTxEpoch";
        GetNumTxnsDSEpoch: "GetNumTxnsDSEpoch";
        GetMinimumGasPrice: "GetMinimumGasPrice";
        GetPendingTxn: "GetPendingTxn";
        GetPendingTxns: "GetPendingTxns";
        GetSmartContracts: "GetSmartContracts";
        GetSmartContractCode: "GetSmartContractCode";
        GetSmartContractInit: "GetSmartContractInit";
        GetSmartContractState: "GetSmartContractState";
        GetSmartContractSubState: "GetSmartContractSubState";
        GetContractAddressFromTransactionID: "GetContractAddressFromTransactionID";
        GetBalance: "GetBalance";
      };
    };
    wallet: {};
  };
  transactions: {
    provider: {
      middleware: {
        request: {};
        response: {};
      };
      RPCMethod: {
        GetNetworkId: "GetNetworkId";
        GetBlockchainInfo: "GetBlockchainInfo";
        GetShardingStructure: "GetShardingStructure";
        GetDSBlock: "GetDsBlock";
        GetLatestDSBlock: "GetLatestDsBlock";
        GetNumDSBlocks: "GetNumDSBlocks";
        GetDSBlockRate: "GetDSBlockRate";
        DSBlockListing: "DSBlockListing";
        GetTxBlock: "GetTxBlock";
        GetLatestTxBlock: "GetLatestTxBlock";
        GetNumTxBlocks: "GetNumTxBlocks";
        GetTxBlockRate: "GetTxBlockRate";
        TxBlockListing: "TxBlockListing";
        GetNumTransactions: "GetNumTransactions";
        GetTransactionRate: "GetTransactionRate";
        GetCurrentMiniEpoch: "GetCurrentMiniEpoch";
        GetCurrentDSEpoch: "GetCurrentDSEpoch";
        GetPrevDifficulty: "GetPrevDifficulty";
        GetPrevDSDifficulty: "GetPrevDSDifficulty";
        GetTotalCoinSupply: "GetTotalCoinSupply";
        GetMinerInfo: "GetMinerInfo";
        CreateTransaction: "CreateTransaction";
        GetTransaction: "GetTransaction";
        GetTransactionStatus: "GetTransactionStatus";
        GetRecentTransactions: "GetRecentTransactions";
        GetTransactionsForTxBlock: "GetTransactionsForTxBlock";
        GetTxnBodiesForTxBlock: "GetTxnBodiesForTxBlock";
        GetNumTxnsTxEpoch: "GetNumTxnsTxEpoch";
        GetNumTxnsDSEpoch: "GetNumTxnsDSEpoch";
        GetMinimumGasPrice: "GetMinimumGasPrice";
        GetPendingTxn: "GetPendingTxn";
        GetPendingTxns: "GetPendingTxns";
        GetSmartContracts: "GetSmartContracts";
        GetSmartContractCode: "GetSmartContractCode";
        GetSmartContractInit: "GetSmartContractInit";
        GetSmartContractState: "GetSmartContractState";
        GetSmartContractSubState: "GetSmartContractSubState";
        GetContractAddressFromTransactionID: "GetContractAddressFromTransactionID";
        GetBalance: "GetBalance";
      };
    };
    wallet: {};
  };
  contracts: {
    new: (code: string, init: any) => any;
    transactions: {
      provider: {
        middleware: {
          request: {};
          response: {};
        };
        RPCMethod: {
          GetNetworkId: "GetNetworkId";
          GetBlockchainInfo: "GetBlockchainInfo";
          GetShardingStructure: "GetShardingStructure";
          GetDSBlock: "GetDsBlock";
          GetLatestDSBlock: "GetLatestDsBlock";
          GetNumDSBlocks: "GetNumDSBlocks";
          GetDSBlockRate: "GetDSBlockRate";
          DSBlockListing: "DSBlockListing";
          GetTxBlock: "GetTxBlock";
          GetLatestTxBlock: "GetLatestTxBlock";
          GetNumTxBlocks: "GetNumTxBlocks";
          GetTxBlockRate: "GetTxBlockRate";
          TxBlockListing: "TxBlockListing";
          GetNumTransactions: "GetNumTransactions";
          GetTransactionRate: "GetTransactionRate";
          GetCurrentMiniEpoch: "GetCurrentMiniEpoch";
          GetCurrentDSEpoch: "GetCurrentDSEpoch";
          GetPrevDifficulty: "GetPrevDifficulty";
          GetPrevDSDifficulty: "GetPrevDSDifficulty";
          GetTotalCoinSupply: "GetTotalCoinSupply";
          GetMinerInfo: "GetMinerInfo";
          CreateTransaction: "CreateTransaction";
          GetTransaction: "GetTransaction";
          GetTransactionStatus: "GetTransactionStatus";
          GetRecentTransactions: "GetRecentTransactions";
          GetTransactionsForTxBlock: "GetTransactionsForTxBlock";
          GetTxnBodiesForTxBlock: "GetTxnBodiesForTxBlock";
          GetNumTxnsTxEpoch: "GetNumTxnsTxEpoch";
          GetNumTxnsDSEpoch: "GetNumTxnsDSEpoch";
          GetMinimumGasPrice: "GetMinimumGasPrice";
          GetPendingTxn: "GetPendingTxn";
          GetPendingTxns: "GetPendingTxns";
          GetSmartContracts: "GetSmartContracts";
          GetSmartContractCode: "GetSmartContractCode";
          GetSmartContractInit: "GetSmartContractInit";
          GetSmartContractState: "GetSmartContractState";
          GetSmartContractSubState: "GetSmartContractSubState";
          GetContractAddressFromTransactionID: "GetContractAddressFromTransactionID";
          GetBalance: "GetBalance";
        };
      };
      wallet: {};
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
