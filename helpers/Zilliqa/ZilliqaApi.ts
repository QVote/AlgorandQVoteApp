import { makeAutoObservable } from "mobx";
import type { QVote, Job, JobTypes, BlockchainInterface } from "../../types";
import { validation } from "@zilliqa-js/util";
import { BN, Zilliqa, Long } from "@zilliqa-js/zilliqa";
import { retryLoop, formatAddress } from "../../scripts";
import { blockchains } from "./config";
import { QVoteZilliqa, QueueZilliqa } from "@qvote/zilliqa-sdk";
import { infoInit } from "../init";
import { getContractStateMessages } from "./utill";
import { CookieObjectInterface } from "../Cookies";
import { networkNotSupported } from "../../components/utill";
import { longNotification } from "../../components/Notifications";

function logsHaveEvent(logs: { _eventname: string }[], eventName: string) {
    const logsContain =
        logs.filter((l) => l._eventname == eventName).length != 0;
    return logsContain;
}

function isContractCallReceiptSuccess(
    receipt: { event_logs?: { _eventname: string }[] },
    eventName: string
) {
    if (receipt.event_logs) {
        return logsHaveEvent(receipt.event_logs, eventName);
    }
    return false;
}
function addressIn(a: string, arr: string[]) {
    return arr.map((adr) => formatAddress(adr)).includes(formatAddress(a));
}

const GAS_LIMIT = 20000;

const _JOB_SUCCESS_EVENT: Partial<Record<JobTypes, string>> = {
    Register: "owner_register_success",
    Vote: "vote_success",
    Push: "push_success",
};

class ZilliqaApi implements BlockchainInterface {
    tokenSupport = false;
    hasDescription = true;
    private blockchainInfo = blockchains.testnet;
    connected = false;
    /**
     * canonical 20-byte Ethereum-style address
     */
    currentAddress = "";
    contractState?: QVote.ContractDecisionProcessed;
    queueState?: QVote.Queue;
    contractInfo = infoInit;
    loading = false;
    cookies = new CookieObjectInterface<{ arr: string[] }>(
        "ZilliqaQvoteContractAddresses",
        "testnet"
    );
    jobs = new CookieObjectInterface<{ arr: Job[] }>(
        "ZilliqaQvoteJobs",
        "testnet"
    );
    queues = new CookieObjectInterface<{ arr: string[] }>(
        "ZilliqaQvoteQueues",
        "testnet"
    );

    constructor() {
        makeAutoObservable(this);
    }

    private async checkReceipt(txId: string) {
        const receipt = await retryLoop(15, 5000, async () => {
            const resTx = await this.getZilPay().blockchain.getTransaction(
                txId
            );
            if (resTx.receipt) {
                return { res: resTx.receipt, shouldRetry: false };
            }
            return { res: undefined, shouldRetry: true };
        });
        return receipt;
    }

    private zilPayExists() {
        if (typeof window != "undefined") {
            if (typeof window.zilPay != "undefined") {
                return true;
            }
        }
        return false;
    }

    private getZilPay() {
        if (this.zilPayExists()) {
            return window.zilPay;
        }
        throw new Error(
            "Zilpay wallet was set but there is no zilPay object in the window!"
        );
    }

    private setNet(net: string) {
        console.debug({ net });
        const name = Object.keys(blockchains).includes(net)
            ? blockchains[net]
            : blockchains.testnet;
        this.blockchainInfo = name;
        this.cookies.setExtension(this.blockchainInfo.name);
        this.jobs.setExtension(this.blockchainInfo.name);
        this.queues.setExtension(this.blockchainInfo.name);
    }

    private async getCurrentBlockNumber() {
        const txblock = await this.getZilPay().blockchain.getLatestTxBlock();
        const r = txblock.result;
        if (r) {
            if (r.header) {
                if (r.header.BlockNum) {
                    return parseInt(r.header.BlockNum);
                }
            }
        }
        throw new Error("Couldn't get blocknumber");
    }

    private async getCurrentTxBlockRate() {
        const info = await this.getZilPay().blockchain.getBlockChainInfo();
        if (info.result) {
            return parseFloat(info.result.TxBlockRate);
        }
        throw new Error("Couldn't get tx block rate");
    }

    private async getContractState(
        address: string
    ): Promise<QVote.ContractDecisionProcessed> {
        const qv = new QVoteZilliqa(
            new Zilliqa("", this.getZilPay().provider),
            this.blockchainInfo.protocol
        );
        const state = await qv.getContractState(address);
        const registration_end_time = parseInt(state.registration_end_time);
        const expiration_block = parseInt(state.expiration_block);
        const res: QVote.ContractDecisionProcessed = {
            ...state,
            description: state.description.replace(/\\n/g, "\n"),
            registration_end_time,
            expiration_block,
            owner: formatAddress(state.owner),
            _this_address: formatAddress(state._this_address),
            option_to_votes: Object.entries(state.options_to_votes_map).map(
                ([k, v]) => ({ name: k, vote: v })
            ),
            voter_balances: Object.fromEntries(
                Object.entries(state.voter_balances).map(([k, v]) => [
                    formatAddress(k),
                    parseInt(v),
                ])
            ),
        };
        console.debug(res);
        return res;
    }

    private async getSDKInitialized<T extends QVoteZilliqa | QueueZilliqa>(
        ClassToInit: typeof QVoteZilliqa | typeof QueueZilliqa,
        includeRate?: boolean
    ): Promise<[T, BN]> {
        let rate: number;
        if (includeRate) {
            rate = await this.getCurrentTxBlockRate();
        }
        const qv = new ClassToInit(
            null,
            this.blockchainInfo.protocol,
            rate ? Math.round(1 / rate) : undefined
        );
        const gasPrice = await qv.handleMinGas(
            this.getZilPay().blockchain.getMinimumGasPrice()
        );
        return [qv as T, gasPrice];
    }

    private registerContractAddress(address: string) {
        const toMakeFirst = formatAddress(address);
        const cur = this.cookies.getCookie().arr;
        if (!cur.includes(toMakeFirst)) {
            //hold only most recent 9 contract addresses
            if (cur.length > 8) {
                cur.pop();
            }
            const next = [toMakeFirst, ...cur];
            this.cookies.setCookie({ arr: next });
        }
    }

    private registerQueueAddress(address: string) {
        const toMakeFirst = formatAddress(address);
        const cur = this.queues.getCookie().arr;
        if (!cur.includes(toMakeFirst)) {
            //hold only most recent 9 contract addresses
            if (cur.length > 8) {
                cur.pop();
            }
            const next = [toMakeFirst, ...cur];
            this.queues.setCookie({ arr: next });
        }
    }

    private pushJob(add: Job) {
        const cookie = this.jobs.getCookie();
        const isAlreadyIn =
            cookie.arr.filter((j) => add.id == j.id).length == 1;
        if (!isAlreadyIn) {
            const jobs = cookie.arr;
            //hold only most recent 9 transactions
            if (jobs.length > 8) {
                jobs.pop();
            }
            const next = [add, ...jobs];
            this.jobs.setCookie({ ...cookie, arr: next });
        }
    }

    private updateJob(id: string, newVal: Job) {
        const next = this.jobs
            .getCookie()
            .arr.map((j) => (j.id == id ? newVal : j));
        this.jobs.setCookie({ arr: next });
    }

    private async runJob(job: Job) {
        try {
            this.pushJob(job);
            this.updateJob(job.id, { ...job, status: "inProgress" });
            //RETRY UNTIL WE HAVE A RECEIPT
            const receipt = await this.checkReceipt(job.id);
            if (receipt.success) {
                if (
                    job.type != "Deploy" &&
                    job.type != "DeployQueue" &&
                    !isContractCallReceiptSuccess(
                        receipt,
                        _JOB_SUCCESS_EVENT[job.type]
                    )
                ) {
                    throw new Error(job.type);
                }
                longNotification.showNotification(
                    `Success: ${job.type}`,
                    "success"
                );
                this.updateJob(job.id, { ...job, status: "done" });
                if (job.type == "Deploy") {
                    this.registerContractAddress(job.contractAddress + "");
                } else if (job.type == "DeployQueue") {
                    this.registerQueueAddress(job.contractAddress + "");
                }
            } else {
                throw new Error("Failed to confirm transaction");
            }
        } catch (e) {
            console.log(e);
            this.updateJob(job.id, { ...job, status: "error" });
            longNotification.showNotification(
                e.message ? `Error: ${e.message}` : "Error!",
                "error"
            );
        }
    }

    private txWaitNotify() {
        longNotification.showNotification(
            "Waiting for transaction confirmation...",
            "loading"
        );
    }

    private getContract(address: string) {
        return this.getZilPay().contracts.at(address);
    }

    async connect(): Promise<() => void> {
        if (this.zilPayExists()) {
            const zilPay = this.getZilPay();
            const isConnected = await zilPay.wallet.connect();
            if (isConnected) {
                this.currentAddress = formatAddress(
                    zilPay.wallet.defaultAccount.base16
                );
                const unsub1 = zilPay.wallet
                    .observableAccount()
                    .subscribe((account) => {
                        this.currentAddress = formatAddress(account.base16);
                    });
                this.setNet(zilPay.wallet.net);
                const unsub2 = zilPay.wallet
                    .observableNetwork()
                    .subscribe((net: string) => this.setNet(net));
                this.connected = true;
                console.debug({ connected: true });
                return () => {
                    unsub1();
                    unsub2();
                };
            } else {
                this.connected = false;
            }
        } else {
            //open extension window
            window.open("https://zilpay.io/");
        }
        return () => {};
    }

    async tryToGetContract(address: string | string[]): Promise<void> {
        const add = formatAddress(address);
        if (validation.isAddress(add)) {
            this.loading = true;
            const state = await this.getContractState(add);
            const curBlockNumber = await this.getCurrentBlockNumber();
            const rate = await this.getCurrentTxBlockRate();
            this.contractState = state;
            this.contractInfo = getContractStateMessages(
                state,
                rate,
                curBlockNumber,
                this.currentAddress
            );
            this.loading = false;
            this.registerContractAddress(add);
        }
    }

    get isOwnerOfCurrentContract(): boolean {
        return (
            this.contractState &&
            this.contractState.owner == this.currentAddress
        );
    }

    get someJobsInProgress(): boolean {
        return this.jobs.value.arr.reduce(
            (prev, cur) => (cur.status == "inProgress" ? true : prev),
            false
        );
    }

    contractLink(address: string): void {
        //Try to open a viewblock
        if (
            this.blockchainInfo.name == "testnet" ||
            this.blockchainInfo.name == "mainnet"
        ) {
            window.open(
                `https://viewblock.io/zilliqa/address/${address}?network=${this.blockchainInfo.name}`
            );
        } else {
            networkNotSupported();
        }
    }

    txLink(id: string): void {
        //Try to open a viewblock
        if (
            this.blockchainInfo.name == "testnet" ||
            this.blockchainInfo.name == "mainnet"
        ) {
            window.open(
                `https://viewblock.io/zilliqa/tx/0x${id}?network=${this.blockchainInfo.name}`
            );
        } else {
            networkNotSupported();
        }
    }

    async deploy(decision: QVote.Decision): Promise<void> {
        const zilPayContractApi = this.getZilPay().contracts;
        const curBlockNumber = await this.getCurrentBlockNumber();
        const [qv, gasPrice] = await this.getSDKInitialized<QVoteZilliqa>(
            QVoteZilliqa,
            true
        );
        const contract = zilPayContractApi.new(
            ...qv.payloadQv({
                payload: {
                    name: decision.name,
                    description: decision.description,
                    options: decision.options.map((o) => o.optName),
                    creditToTokenRatio: decision.creditToTokenRatio,
                    registrationEndTime: qv.futureTxBlockNumber(
                        curBlockNumber,
                        60 * decision.registerEndTime
                    ),
                    expirationBlock: qv.futureTxBlockNumber(
                        curBlockNumber,
                        60 * decision.endTime + 60 * decision.registerEndTime
                    ),
                    tokenId: decision.tokenId,
                },
                ownerAddress: this.currentAddress,
            })
        );
        const [params, attempts, interval] = qv.payloadDeploy({
            gasPrice,
            gasLimit: Long.fromNumber(GAS_LIMIT),
        });
        const [tx, contractInstance] = await contract.deploy(
            params,
            attempts,
            interval
        );
        this.runJob({
            id: tx.ID,
            name: `Deploy Transaction: ${tx.ID}`,
            status: "waiting",
            contractAddress: contractInstance.address,
            type: "Deploy",
        });
        this.txWaitNotify();
    }

    async ownerRegister(payload: {
        addresses: string[];
        creditsForAddresses: number[];
    }): Promise<void> {
        const [qv, gasPrice] = await this.getSDKInitialized<QVoteZilliqa>(
            QVoteZilliqa
        );
        const contract = this.getContract(this.contractState._this_address);
        const [transition, args, params] = qv.payloadOwnerRegister({
            payload: payload,
            gasPrice,
            gasLimit: Long.fromNumber(GAS_LIMIT),
        });
        const tx = await contract.call(transition, args, params, true);
        this.runJob({
            id: tx.ID,
            name: `Register Transaction: ${tx.ID}`,
            status: "waiting",
            contractAddress: this.contractState._this_address,
            type: "Register",
        });
        this.txWaitNotify();
    }

    async vote(payload: { creditsToOption: string[] }): Promise<void> {
        const [qv, gasPrice] = await this.getSDKInitialized<QVoteZilliqa>(
            QVoteZilliqa
        );
        const contract = this.getContract(this.contractState._this_address);
        const [transition, args, params] = qv.payloadVote({
            payload: payload,
            gasPrice,
            gasLimit: Long.fromNumber(GAS_LIMIT),
        });
        const tx = await contract.call(transition, args, params, true);
        this.runJob({
            id: tx.ID,
            name: `Vote Transaction: ${tx.ID}`,
            status: "waiting",
            contractAddress: this.contractState._this_address,
            type: "Vote",
        });
        this.txWaitNotify();
    }

    regenerateJobs(): void {
        this.jobs.value.arr.map((j) => {
            if (j.status == "waiting" || j.status == "inProgress") {
                this.runJob(j);
            }
        });
    }

    async tryToGetQueueState(address: string | string[]): Promise<void> {
        const add = formatAddress(address);
        if (validation.isAddress(add)) {
            this.loading = true;
            const queue = new QueueZilliqa(
                new Zilliqa("", this.getZilPay().provider),
                this.blockchainInfo.protocol
            );
            const state = await queue.getContractState(add);
            this.queueState = {
                _balance: state._balance,
                queue: state.queue.map((a) => formatAddress(a)),
                _this_address: add,
            };
            this.loading = false;
            this.registerQueueAddress(add);
        }
    }

    async onlyOwnerPushQueue(queueAddress: string): Promise<void> {
        const [queue, gasPrice] = await this.getSDKInitialized<QueueZilliqa>(
            QueueZilliqa
        );
        await this.tryToGetQueueState(queueAddress);
        if (
            addressIn(this.contractState._this_address, this.queueState.queue)
        ) {
            longNotification.showNotification(
                "This decision is already in the queue!",
                "error"
            );
        } else {
            const contract = this.getContract(queueAddress);
            const [transition, args, params] = queue.payloadPushQueue({
                payload: { addressToPush: this.contractState._this_address },
                gasPrice,
            });
            const tx = await contract.call(transition, args, params, true);
            this.runJob({
                id: tx.ID,
                name: `Push Queue Transaction: ${tx.ID}`,
                status: "waiting",
                contractAddress: queueAddress,
                type: "Push",
            });
            this.txWaitNotify();
        }
    }

    async deployQueue(maxQueueSize: string): Promise<void> {
        const zilPayContractApi = this.getZilPay().contracts;
        const [queue, gasPrice] = await this.getSDKInitialized<QueueZilliqa>(
            QueueZilliqa
        );
        const contract = zilPayContractApi.new(
            ...queue.payloadQueue({
                payload: {
                    maxQueueSize,
                },
                ownerAddress: this.currentAddress,
            })
        );
        const [params, attempts, interval] = queue.payloadDeploy({
            gasPrice,
            gasLimit: Long.fromNumber(GAS_LIMIT),
        });
        const [tx, contractInstance] = await contract.deploy(
            params,
            attempts,
            interval
        );
        this.runJob({
            id: tx.ID,
            name: `Deploy Queue Transaction: ${tx.ID}`,
            status: "waiting",
            contractAddress: contractInstance.address,
            type: "DeployQueue",
        });
        this.txWaitNotify();
    }
}

export const zilliqaApi = new ZilliqaApi();
