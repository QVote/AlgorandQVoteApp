import { NextApiRequest, NextApiResponse } from "next";
import { Zilliqa, BN } from "@zilliqa-js/zilliqa";
import { getPrivateKey, formatAddress } from "../../scripts";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { BLOCKCHAINS } from "../../config";
import { TOKENS, BlockchainApi } from "../../helpers/BlockchainApi";

export type SnapshotDeployResponse = {
  deployID: string;
  registerID: string;
  contractAddress: string;
};

export type SnapshotDeployRequest = Parameters<QVoteZilliqa["deploy"]>["0"] & {
  net: string;
};

export default async function deployWithSnapshot(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    //const token = "REDC"; //"GZIL"; // "REDC";
    const body: SnapshotDeployRequest = req.body;
    const net = body.net;
    const zil = new Zilliqa(BLOCKCHAINS[net].url);
    zil.wallet.addByPrivateKey(getPrivateKey());
    const tokenInfo = TOKENS[net][body.tokenId];
    const tokensContract = zil.contracts.atBech32(tokenInfo.addr);
    const balances = BlockchainApi.processZrc2Balances(
      await tokensContract.getSubState("balances"),
      tokenInfo.decimals,
      body.creditToTokenRatio
    );
    const balancesEntries = Object.entries(balances);
    const addressList = balancesEntries.map((b) => b[0]);
    const creditList = balancesEntries.map((b) => b[1]);
    const qv = new QVoteZilliqa(zil, BLOCKCHAINS[net].protocol);
    const gasPrice = await qv.handleMinGas(zil.blockchain.getMinimumGasPrice());
    const contract = zil.contracts.new(
      ...qv.payloadQv({
        payload: body,
        ownerAddress: zil.wallet.defaultAccount.address,
      })
    );
    const [tx, contractInstance] = await contract.deploy(
      ...qv.payloadDeploy({ gasPrice })
    );
    const reg = qv.payloadOwnerRegister({
      gasPrice,
      payload: {
        addresses: addressList,
        creditsForAddresses: creditList,
      },
    });
    const registerTx = await contractInstance.callWithoutConfirm(
      reg[0],
      reg[1],
      reg[2],
      false
    );
    const response: SnapshotDeployResponse = {
      deployID: tx.id,
      registerID: registerTx.id,
      contractAddress: contractInstance.address,
    };
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).send("oopsie");
  }
  res.end();
}
