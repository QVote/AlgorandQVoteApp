import { BlockchainInterface } from "../types";
import { zilliqaApi } from "./Zilliqa/ZilliqaApi";

/**
 * We implement a blockchain interface that modifies the state of
 * the mobx object,
 * we can implement an arbitrary blockchain implementing the methods
 * we have declared in the interface
 */
export const blockchain: BlockchainInterface =
    process.env.BLOCKCHAIN == "ALGO" ? zilliqaApi : zilliqaApi;
