import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { Protocol } from "../config";
import type { QVote, ZilPay } from "../types";
import { BN, Zilliqa } from "@zilliqa-js/zilliqa";
import { retryLoop, formatAddress } from "../scripts";
import { stat } from "node:fs";

type walletApi = "zilPay" | "moonlet";

declare global {
  interface Window {
    zilPay?: ZilPay;
  }
}

export class BlockchainApi {
  public wallet: walletApi;
  private protocol: Protocol;

  constructor({ wallet, protocol }: { wallet: walletApi; protocol: Protocol }) {
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

  private async getQV(includeRate?: boolean): Promise<[QVoteZilliqa, BN]> {
    let rate;
    if (includeRate) {
      rate = await BlockchainApi.getCurrentTxBlockRate();
    }
    const qv = new QVoteZilliqa(
      null,
      this.protocol,
      rate ? Math.round(1 / rate) : undefined
    );
    const gasPrice = await qv.handleMinGas(
      BlockchainApi.getZilPay().blockchain.getMinimumGasPrice()
    );
    return [qv, gasPrice];
  }

  private getContract(address: string) {
    return BlockchainApi.getZilPay().contracts.at(address);
  }

  async deploy(decision: QVote.Decision, curAccount: string) {
    const zilPayContractApi = BlockchainApi.getZilPay().contracts;
    const curBlockNumber = await BlockchainApi.getCurrentBlockNumber();
    const [qv, gasPrice] = await this.getQV(true);
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
    const [params, attempts, interval] = qv.payloadDeploy({ gasPrice });
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
    const [qv, gasPrice] = await this.getQV();
    const contract = this.getContract(contractAddress);
    const [transition, args, params] = qv.payloadOwnerRegister({
      payload: payload,
      gasPrice,
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
    const [qv, gasPrice] = await this.getQV();
    const contract = this.getContract(contractAddress);
    const [transition, args, params] = qv.payloadVote({
      payload: payload,
      gasPrice,
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
}
