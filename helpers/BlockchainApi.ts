import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { Protocol } from "../config";
import type { QVote, ZilPay } from "../types";

type walletApi = "zilpay" | "moonlet";

export class BlockchainApi {
  public wallet: walletApi;
  private protocol: Protocol;

  constructor({ wallet, protocol }: { wallet: walletApi; protocol: Protocol }) {
    this.wallet = wallet;
    this.protocol = protocol;
  }

  private getZilpay(): ZilPay {
    if (typeof window != "undefined") {
      if (typeof window.zilPay != "undefined") {
        return window.zilPay;
      }
    }
    throw new Error(
      "Zilpay wallet was set but there is no zilpay object in the window!"
    );
  }

  async deploy(decision: QVote.Decision, curAccount:string) {
    const zilPay = this.getZilpay();
    const zilPayContractApi = zilPay.contracts;
    const zilPayBlockchainApi = zilPay.blockchain;
    const txblock = await zilPayBlockchainApi.getLatestTxBlock();
    const curBlockNumber = parseInt(txblock.result!.header!.BlockNum);
    const qv = new QVoteZilliqa(null, this.protocol);
    const gasPrice = await qv.handleMinGas(
      zilPayBlockchainApi.getMinimumGasPrice()
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
    const [params, attempts, interval] = qv.payloadDeploy({ gasPrice });
    const [tx, contractInstance] = await contract.deploy(
      params,
      attempts,
      interval
    );
    return [tx, contractInstance];
  }
}
