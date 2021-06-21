import { makeAutoObservable } from "mobx";
import type { QVote, Job, BlockchainInterface } from "../../types";
import { CookieObjectInterface } from "../Cookies";
import { networkNotSupported } from "../../components/utill";
import { longNotification } from "../../components/Notifications";
import { QVoting, QQueue } from "@qvote/algorand-sdk";
import { infoInit } from "../init";
import type { Accounts } from "@randlabs/myalgo-connect";
import type MyAlgoConnect from "@randlabs/myalgo-connect";
import { Algodv2 } from "algosdk";
import { notArrPlz } from "../../scripts";

const baseServer = "https://testnet-algorand.api.purestake.io/ps2";
const port = "";
const token = { "X-API-Key": "rPomKPFluE2MO7D0IdLyu3udnyOgWg846F3Gq9bZ" };
const config = { token, baseServer, port };

// async function myAlgoDeploy() {
//     try {
//         const conf = { token: token, baseServer: baseServer, port: port };
//         const registrationTime = 10 * 60; // in seconds
//         const votingTime = 10 * 24 * 60 * 60; // 10 days to vote

//         const { wallet, accounts } = await connectMyAlgo();
//         const creatorAddress = accounts[0].address;

//         const params = {
//             decisionName: "muchdecision",
//             votingStartTime: Math.round(Date.now() / 1000) + registrationTime,
//             votingEndTime:
//                 Math.round(Date.now() / 1000) + registrationTime + votingTime,
//             assetID: 13164495,
//             assetCoefficient: 200, // expressed in hundredths of a credit for 1 decimal place (not flexible at the moment)
//             options: [
//                 "first",
//                 "second",
//                 "third",
//                 "4",
//                 "5",
//                 "6",
//                 "7",
//                 "8",
//                 "9",
//                 "10",
//                 "11",
//                 "12",
//             ],
//             creatorAddress: creatorAddress,
//         };

//         const qv = new QVoting(conf, wallet, params);
//         await qv.deployNew();
//         console.log("DEPLOYED");
//         const appID = qv.getAppID();
//         console.log(appID);

//         const state = await qv.readGlobalState();
//         console.log("STATE", state);

//         await qv.optIn(creatorAddress);
//         console.log("opted in");

//         // did opt-in work?
//         const localStorage = await qv.getUserBalance(creatorAddress);
//         console.log("STORAGE");
//         console.log(localStorage);
//     } catch (e) {
//         console.log(e);
//     }
// }

// async function myAlgoOptin() {
//     try {
//         const { wallet, accounts } = await connectMyAlgo();
//         if (accounts.length > 1) {
//             console.log(
//                 "more than one account selected, choosing the first one"
//             );
//         }

//         const appID = 15856700; // previously deployed appID

//         const conf = { token: token, baseServer: baseServer, port: port };
//         const voterAddress = accounts[0].address;

//         const qv = new QVoting(conf, wallet);
//         console.log("created new instance");
//         await qv.initState(appID);

//         const state = await qv.readGlobalState();
//         console.log("STATE", state);

//         await qv.optIn(voterAddress);
//         console.log("opted in");

//         // did opt-in work?
//         const localStorage = await qv.getUserBalance(voterAddress);
//         console.log("STORAGE");
//         console.log(localStorage);
//     } catch (e) {
//         console.log(e);
//     }
// }

// async function myAlgoVote() {
//     try {
//         const { wallet, accounts } = await connectMyAlgo();
//         if (accounts.length > 1) {
//             console.log(
//                 "more than one account selected, choosing the first one"
//             );
//         }
//         const appID = 16061819; // previously deployed appID

//         const conf = { token: token, baseServer: baseServer, port: port };
//         const voterAddress = accounts[0].address;

//         const qv = new QVoting(conf, wallet);
//         console.log("created new instance");
//         await qv.initState(appID);

//         var state = await qv.readGlobalState();
//         console.log("STATE", state);

//         const balance = await qv.getUserBalance(voterAddress);
//         console.log("BALANCE", balance);

//         const options = [
//             { optionTitle: "second", creditNumber: 9 },
//             { optionTitle: "first", creditNumber: 4 },
//         ];

//         await qv.vote(voterAddress, options);

//         state = await qv.readGlobalState();
//         console.log("STATE", state);
//     } catch (e) {
//         console.log(e);
//     }
// }

// async function myAlgoDeployQueue() {
//     const qSize = 10;
//     const conf = { token: token, baseServer: baseServer, port: port };
//     const { wallet, accounts } = await connectMyAlgo();

//     console.log(accounts);
//     const creatorAddress = accounts[0].address;

//     console.log("address", creatorAddress);
//     const q = QQueue.newQueue(conf, qSize, creatorAddress, wallet);
//     const appID = await q.deployNew();
//     console.log("deployed, appid: ", appID);
// }

// async function myAlgoOptinQueue() {
//     const conf = { token: token, baseServer: baseServer, port: port };
//     const { wallet, accounts } = await connectMyAlgo();
//     const userAddress = accounts[0].address;

//     const appID = 16061894;
//     const q = QQueue.existingQueue(conf, appID, wallet);
//     console.log(userAddress);
//     await q.optIn(userAddress);
// }

// async function myAlgoPushQueue() {
//     const conf = { token: token, baseServer: baseServer, port: port };
//     const { wallet, accounts } = await connectMyAlgo();
//     const userAddress = accounts[0].address;

//     const appID = 16061894;
//     const q = QQueue.existingQueue(conf, appID, wallet);
//     await q.push(userAddress, 145);
// }

class AlgorandApi implements BlockchainInterface {
    connected = false;
    hasDescription = false;
    private wallet: MyAlgoConnect;
    private accounts: Accounts[];
    /**
     * canonical 20-byte Ethereum-style address
     */
    currentAddress = "";
    contractState?: QVote.ContractDecisionProcessed;
    queueState?: QVote.Queue;
    contractInfo = infoInit;
    loading = false;
    cookies = new CookieObjectInterface<{ arr: string[] }>(
        "AlgorandQvoteContractAddresses",
        "testnet"
    );
    jobs = new CookieObjectInterface<{ arr: Job[] }>(
        "AlgorandQvoteJobs",
        "testnet"
    );
    queues = new CookieObjectInterface<{ arr: string[] }>(
        "AlgorandQvoteQueues",
        "testnet"
    );

    constructor() {
        makeAutoObservable(this);
    }

    async connect(): Promise<() => void> {
        if (typeof window != "undefined") {
            const MyAlgoConnect = (await import("@randlabs/myalgo-connect"))
                .default;
            const myAlgoWallet = new MyAlgoConnect();
            const accounts = await myAlgoWallet.connect();
            this.wallet = myAlgoWallet;
            this.accounts = accounts;
            this.currentAddress = accounts[0].address;
            console.debug({ myAlgoWallet, accounts });
            this.connected = true;
        }
        return () => {};
    }

    async tryToGetContract(address: string | string[]): Promise<void> {
        const add = parseInt(notArrPlz(address));
        if (add >= 10000000) {
            this.loading = true;
            const qv = new QVoting(config, this.wallet);
            await qv.initState(add);
            console.log("STATE", qv.state);
            this.contractState = {
                _this_address: add + "",
                credit_to_token_ratio: qv.state.assetCoefficient + "",
                description: "",
                expiration_block: qv.state.votingEndTime,
                name: qv.state.decisionName,
                options: qv.state.options.map((o) => o.title),
                options_to_votes_map: qv.state.options.reduce((prev, cur) => {
                    prev[cur.title] = cur.value;
                    return prev;
                }, {}),
                option_to_votes: qv.state.options.map((o) => ({
                    name: o.title,
                    vote: o.value,
                })),
                owner: "none",
                token_id: qv.state.assetID + "",
                registered_voters: [],
                registration_end_time: qv.state.votingStartTime,
                voter_balances: {},
            };
            this.loading = false;
            this.registerAppId(add, "cookies");
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

    contractLink(address: string) {
        window.open(`https://testnet.algoexplorer.io/application/${address}`);
    }

    txLink(id: string) {
        window.open(`https://testnet.algoexplorer.io/tx/${id}`);
    }

    async deploy(decision: QVote.Decision): Promise<void> {
        const registerSeconds = decision.registerEndTime * 60;
        const endSeconds = decision.endTime * 60;
        const qv = new QVoting(config, this.wallet, {
            decisionName: decision.name,
            votingStartTime: Math.round(Date.now() / 1000) + registerSeconds,
            votingEndTime:
                Math.round(Date.now() / 1000) + endSeconds + registerSeconds,
            assetID: 13164495,
            assetCoefficient: 200, // expressed in hundredths of a credit for 1 decimal place (not flexible at the moment)
            options: decision.options.map((o) => o.optName),
            creatorAddress: this.currentAddress,
        });
        this.txWaitNotify();
        await qv.deployNew();
        //@ts-ignore
        const txId = qv.deployTxID;
        this.runJob({
            id: txId,
            name: `Deploy Transaction: ${txId}`,
            status: "waiting",
            contractAddress: "", //dont have it untill we have the appid
            type: "Deploy",
        });
    }

    async ownerRegister(payload: {
        addresses: string[];
        creditsForAddresses: number[];
    }): Promise<void> {}

    async vote(payload: { creditsToOption: string[] }): Promise<void> {}

    regenerateJobs(): void {
        this.jobs.value.arr.map((j) => {
            if (j.status == "waiting" || j.status == "inProgress") {
                this.runJob(j);
            }
        });
    }

    async tryToGetQueueState(address: string | string[]): Promise<void> {
        const add = parseInt(notArrPlz(address));
        if (add >= 10000000) {
            this.loading = true;
            const q = QQueue.newQueue(
                config,
                10,
                this.currentAddress,
                this.wallet
            );
            await q.init(add);
            const decisions = await q.getDecisions();
            this.queueState = {
                _balance: "0",
                queue: decisions.map((d) => d + ""),
                _this_address: add + "",
            };
            this.loading = false;
            this.registerAppId(add, "queues");
        }
    }

    async onlyOwnerPushQueue(queueAddress: string): Promise<void> {}

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

    private registerAppId(appId: number, on: "cookies" | "queues") {
        const toMakeFirst = appId + "";
        const cur = this[on].getCookie().arr;
        if (!cur.includes(toMakeFirst)) {
            //hold only most recent 9 app ids
            if (cur.length > 8) {
                cur.pop();
            }
            const next = [toMakeFirst, ...cur];
            this[on].setCookie({ arr: next });
        }
    }

    private async getAppId(txId: string): Promise<number> {
        const alg = new Algodv2(token, baseServer, port);
        const res = await alg.pendingTransactionInformation(txId).do();
        return parseInt(res["application-index"]);
    }

    private async runJob(job: Job) {
        try {
            this.pushJob(job);
            this.updateJob(job.id, { ...job, status: "inProgress" });
            //RETRY UNTIL WE HAVE A RECEIPT
            const q = QQueue.newQueue(
                config,
                10,
                this.currentAddress,
                this.wallet
            );
            await q.waitForConfirmation(job.id);
            longNotification.showNotification(
                `Success: ${job.type}`,
                "success"
            );
            const updatedJob: Job = { ...job, status: "done" };
            if (job.type == "Deploy") {
                const appID = await this.getAppId(job.id);
                updatedJob.contractAddress = appID;
                this.registerAppId(appID, "cookies");
            } else if (job.type == "DeployQueue") {
                const appID = await this.getAppId(job.id);
                updatedJob.contractAddress = appID;
                this.registerAppId(appID, "queues");
            }
            this.updateJob(job.id, updatedJob);
        } catch (e) {
            console.log(e);
            this.updateJob(job.id, { ...job, status: "error" });
            longNotification.showNotification(
                e.message ? `Error: ${e.message}` : "Error!",
                "error"
            );
        }
    }

    private async signAndSendQueue() {
        const q = QQueue.newQueue(config, 10, this.currentAddress, this.wallet);
        const tx = await q.buildDeployTx();
        //@ts-ignore
        tx["from"] = q.creatorAddress;
        //@ts-ignore
        delete tx["appIndex"];
        //@ts-ignore
        const signedTx = await q.wallet.signTransaction(tx);
        await q.sendSignedTx(signedTx.blob);
        return signedTx;
    }

    async deployQueue(maxQueueSize: string): Promise<void> {
        const signedTx = await this.signAndSendQueue();
        this.runJob({
            id: signedTx.txID,
            name: `Deploy Queue Transaction: ${signedTx.txID}`,
            status: "waiting",
            contractAddress: "", //dont have it untill we have the appid
            type: "DeployQueue",
        });
        this.txWaitNotify();
    }

    private txWaitNotify() {
        longNotification.showNotification(
            "Waiting for transaction confirmation...",
            "loading"
        );
    }
}

export const algorandApi = new AlgorandApi();
