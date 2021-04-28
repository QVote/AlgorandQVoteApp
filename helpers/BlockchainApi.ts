import { QVoteZilliqa, QueueZilliqa } from "@qvote/zilliqa-sdk";
import { Protocol } from "../config";
import type { QVote, ZilPay } from "../types";
import { BN, Zilliqa, Long } from "@zilliqa-js/zilliqa";
import { retryLoop, formatAddress } from "../scripts";
import { BLOCKCHAINS } from "../config";

type walletApi = "zilPay" | "moonlet";

declare global {
    interface Window {
        zilPay?: ZilPay;
    }
}

const GAS_LIMIT = 20000;

export const TOKENS: {
    [key in keyof typeof BLOCKCHAINS]: {
        [key in "REDC" | "GZIL"]?: { addr: string; decimals: number };
    };
} = {
    testnet: {
        REDC: {
            addr: "zil14jmjrkvfcz2uvj3y69kl6gas34ecuf2j5ggmye",
            decimals: 9,
        },
    },
    mainnet: {
        GZIL: {
            addr: "zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e",
            decimals: 15,
        },
    },
    private: {},
};

export class BlockchainApi {
    public wallet: walletApi;
    private protocol: Protocol;

    constructor({
        wallet,
        protocol,
    }: {
        wallet: walletApi;
        protocol: Protocol;
    }) {
        this.wallet = wallet;
        this.protocol = protocol;
    }

    static thereIsZilPay() {
        if (typeof window != "undefined") {
            if (typeof window.zilPay != "undefined") {
                return true;
            }
        }
        return false;
    }

    static getZilPay(): ZilPay {
        if (BlockchainApi.thereIsZilPay()) {
            return window.zilPay;
        }
        throw new Error(
            "Zilpay wallet was set but there is no zilPay object in the window!"
        );
    }

    static async checkReceipt(txId: string) {
        const receipt = await retryLoop(15, 5000, async () => {
            const resTx = await BlockchainApi.getZilPay().blockchain.getTransaction(
                txId
            );
            if (resTx.receipt) {
                return { res: resTx.receipt, shouldRetry: false };
            }
            return { res: undefined, shouldRetry: true };
        });
        return receipt;
    }

    static async getCurrentBlockNumber() {
        const txblock = await BlockchainApi.getZilPay().blockchain.getLatestTxBlock();
        return parseInt(txblock.result!.header!.BlockNum);
    }

    static async getCurrentTxBlockRate() {
        const info = await BlockchainApi.getZilPay().blockchain.getBlockChainInfo();
        return parseFloat(info.result!.TxBlockRate);
    }

    private async getSDKInitialized<T extends QVoteZilliqa | QueueZilliqa>(
        ClassToInit: typeof QVoteZilliqa | typeof QueueZilliqa,
        includeRate?: boolean
    ): Promise<[T, BN]> {
        let rate: number;
        if (includeRate) {
            rate = await BlockchainApi.getCurrentTxBlockRate();
        }
        const qv = new ClassToInit(
            null,
            this.protocol,
            rate ? Math.round(1 / rate) : undefined
        );
        const gasPrice = await qv.handleMinGas(
            BlockchainApi.getZilPay().blockchain.getMinimumGasPrice()
        );
        return [qv as T, gasPrice];
    }

    private getContract(address: string) {
        return BlockchainApi.getZilPay().contracts.at(address);
    }

    async deploy(decision: QVote.Decision, curAccount: string) {
        const zilPayContractApi = BlockchainApi.getZilPay().contracts;
        const curBlockNumber = await BlockchainApi.getCurrentBlockNumber();
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
                ownerAddress: curAccount,
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
        return [tx, contractInstance];
    }

    async ownerRegister(
        contractAddress: string,
        payload: {
            addresses: string[];
            creditsForAddresses: number[];
        }
    ) {
        const [qv, gasPrice] = await this.getSDKInitialized<QVoteZilliqa>(
            QVoteZilliqa
        );
        const contract = this.getContract(contractAddress);
        const [transition, args, params] = qv.payloadOwnerRegister({
            payload: payload,
            gasPrice,
            gasLimit: Long.fromNumber(GAS_LIMIT),
        });
        const tx = await contract.call(transition, args, params, true);
        return tx;
    }

    async vote(
        contractAddress: string,
        payload: {
            creditsToOption: string[];
        }
    ) {
        const [qv, gasPrice] = await this.getSDKInitialized<QVoteZilliqa>(
            QVoteZilliqa
        );
        const contract = this.getContract(contractAddress);
        const [transition, args, params] = qv.payloadVote({
            payload: payload,
            gasPrice,
            gasLimit: Long.fromNumber(GAS_LIMIT),
        });
        const tx = await contract.call(transition, args, params, true);
        return tx;
    }

    async getContractState(
        address: string
    ): Promise<QVote.ContractDecisionProcessed> {
        const qv = new QVoteZilliqa(
            new Zilliqa("", BlockchainApi.getZilPay().provider),
            this.protocol
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
            option_to_votes: Object.entries(
                state.options_to_votes_map
            ).map(([k, v]) => ({ name: k, vote: v })),
            voter_balances: Object.fromEntries(
                Object.entries(state.voter_balances).map(([k, v]) => [
                    formatAddress(k),
                    parseInt(v),
                ])
            ),
        };
        return res;
    }

    async getQueueState(address: string): Promise<QVote.Queue> {
        const queue = new QueueZilliqa(
            new Zilliqa("", BlockchainApi.getZilPay().provider),
            this.protocol
        );
        const state = await queue.getContractState(address);
        return {
            _balance: state._balance,
            queue: state.queue.map((a) => formatAddress(a)),
            _this_address: address,
        };
    }

    async deployQueue(maxQueueSize: string, curAccount: string) {
        const zilPayContractApi = BlockchainApi.getZilPay().contracts;
        const [queue, gasPrice] = await this.getSDKInitialized<QueueZilliqa>(
            QueueZilliqa
        );
        const contract = zilPayContractApi.new(
            ...queue.payloadQueue({
                payload: {
                    maxQueueSize,
                },
                ownerAddress: curAccount,
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
        return [tx, contractInstance];
    }

    async onlyOwnerPushQueue(addressToPush: string, contractAddress: string) {
        const [queue, gasPrice] = await this.getSDKInitialized<QueueZilliqa>(
            QueueZilliqa
        );
        const contract = this.getContract(contractAddress);
        const [transition, args, params] = queue.payloadPushQueue({
            payload: { addressToPush },
            gasPrice,
        });
        const tx = await contract.call(transition, args, params, true);
        return tx;
    }

    async getTokenContractCreditBalances(
        tokensContracts: string,
        decimals: number,
        credit_to_token_ratio: string
    ) {
        const tokensContract = this.getContract(formatAddress(tokensContracts));
        const balances = BlockchainApi.processZrc2Balances(
            await tokensContract.getSubState("balances"),
            decimals,
            credit_to_token_ratio
        );
        return balances;
    }

    static balanceToCredits(
        decimals: number,
        credit_to_token_ratio: string,
        balanceFromContract: string
    ): number {
        return new BN(balanceFromContract)
            .mul(new BN(credit_to_token_ratio))
            .div(new BN(10 ** decimals))
            .toNumber();
    }

    static processZrc2Balances(
        state: { balances: { [key: string]: string } },
        dec: number,
        credit_to_token_ratio: string
    ) {
        return Object.fromEntries(
            Object.entries(state.balances)
                .filter((b) => parseInt(b[1]) != 0)
                .map((b) => [
                    b[0],
                    BlockchainApi.balanceToCredits(
                        dec,
                        credit_to_token_ratio,
                        b[1]
                    ),
                ])
        );
    }
}
