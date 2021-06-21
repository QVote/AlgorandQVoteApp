import { BlockchainInterface } from "../types";
import { zilliqaApi } from "./Zilliqa/ZilliqaApi";
import { algorandApi } from "./Algorand";

export const blockchain: () => BlockchainInterface = () =>
    process.env.NEXT_PUBLIC_BLOCKCHAIN == "ALGO" ? algorandApi : zilliqaApi;
