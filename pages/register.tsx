import React, { useState } from "react";
import { Box, Button, Text, Paragraph } from "grommet";
import { useMainContext } from "../hooks/useMainContext";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { TwoCards } from "../components/TwoCards";
import { RHeading } from "../components/RHeading";
import { useReponsiveContext } from "../hooks/useReponsiveContext";

export default function RegsiterPage() {
  const main = useMainContext();
  const [loading, setLoading] = useState(false);
  const responsiveContext = useReponsiveContext();

  async function onOwnerRegister() {
    if (!loading) {
      try {
        setLoading(true);
        const zilPay = window.zilPay;
        const zilPayContractApi = zilPay.contracts;
        const zilPayBlockchainApi = zilPay.blockchain;
        // Do zilliqa sdk stuff
        const txblock = await zilPayBlockchainApi.getLatestTxBlock();
        const curBlockNumber = parseInt(txblock.result!.header!.BlockNum);
        console.log(main.blockchainInfo.protocol);
        const qv = new QVoteZilliqa(null, main.blockchainInfo.protocol);
        const gasPrice = await qv.handleMinGas(
          zilPayBlockchainApi.getMinimumGasPrice()
        );
        // *******************************************************
        const contract = zilPayContractApi.new(
          ...qv.payloadQv({
            payload: {
              name: decision.name,
              description: decision.description,
              options: decision.options.map((o) => o.optName),
              creditToTokenRatio: decision.creditToTokenRatio,
              //can register for next 0 min
              registrationEndTime: qv.futureTxBlockNumber(
                curBlockNumber,
                60 * decision.registerEndTime
              ),
              //can vote in 0 min and voting is open for 15 min
              expirationBlock: qv.futureTxBlockNumber(
                curBlockNumber,
                60 * decision.endTime + 60 * decision.registerEndTime
              ),
              tokenId: decision.tokenId,
            },
            ownerAddress: main.curAcc,
          })
        );
        const [params, attempts, interval] = qv.payloadDeploy({ gasPrice });
        console.log(contract, { params, attempts, interval });
        const [tx, contractInstance] = await contract.deploy(
          params,
          attempts,
          interval
        );
        setSubmitted(true);
        main.jobsScheduler.checkReceiptDeploy(
          {
            id: tx.ID,
            name: `Deploy Transaction: ${tx.ID}`,
            status: "waiting",
            contractAddress: contractInstance.address,
            type: "Deploy",
          },
          async () => {},
          async () => {}
        );
        main.longNotification.current.setLoading();
        main.longNotification.current.onShowNotification(
          "Waiting for transaction confirmation..."
        );
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  }

  return main.contractAddressses.addresses.length > 0 ? (
    <Box fill align="center" justify="center" pad="large">
      <TwoCards
        Card1={
          <Box fill>
            <RHeading {...{ responsiveContext, txt: "Register users" }} />
            <Paragraph style={{ wordBreak: "break-word" }}>
              As an owner of a decision contract you can register voters and the
              number of credits they can vote with.
            </Paragraph>
          </Box>
        }
        Card2={<Text>Hello</Text>}
        NextButton={<Button label={"hi"} />}
      />
    </Box>
  ) : (
    <Text>Choose a decision contract you own to register voters.</Text>
  );
}
