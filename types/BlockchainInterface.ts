import { QVote } from "./QVote";
import { CookieOInterface } from "./Cookies";
import { Job } from "./Job";

/**
 * We implement a blockchain interface that modifies the state of
 * the mobx object,
 * we can implement an arbitrary blockchain implementing the methods
 * we have declared in the interface
 */
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
    isOwnerOfCurrentContract: boolean;
    someJobsInProgress: boolean;

    connect: () => Promise<() => void>;
    tryToGetContract: (address: string | string[]) => Promise<void>;
    contractLink: (address: string) => void;
    txLink: (id: string) => void;
    deploy: (decision: QVote.Decision) => Promise<void>;
    ownerRegister: (payload: {
        addresses: string[];
        creditsForAddresses: number[];
    }) => Promise<void>;
    vote: (payload: { creditsToOption: string[] }) => Promise<void>;
    regenerateJobs: () => void;
    tryToGetQueueState: (address: string | string[]) => Promise<void>;
    onlyOwnerPushQueue: (queueAddress: string) => Promise<void>;
    deployQueue: (maxQueueSize: string) => Promise<void>;
}
