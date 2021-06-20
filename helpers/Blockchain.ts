import { BlockchainInterface } from "../types";
import { zilliqaApi } from "./Zilliqa/ZilliqaApi";

export const blockchain: BlockchainInterface =
    process.env.BLOCKCHAIN == "ALGO" ? zilliqaApi : zilliqaApi;
