import { QVote } from "./QVote";
import { CookieOInterface } from "./Cookies";
import { Job } from "./Job";

export interface BlockchainInterface {
    connected: boolean;
    /**
     * canonical 20-byte Ethereum-style address
     */
    currentAddress: string;
    contractState?: QVote.ContractDecisionProcessed;
    queueState?: QVote.Queue;
    contractInfo: QVote.ContractInfo;
    loading: boolean;
    cookies: CookieOInterface<{ arr: string[] }>;
    jobs: CookieOInterface<{ arr: Job[] }>;
    queues: CookieOInterface<{ arr: string[] }>;
}
