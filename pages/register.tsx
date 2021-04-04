import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Paragraph,
  Keyboard,
  TextInput,
  Heading,
} from "grommet";
import { useMainContext } from "../hooks/useMainContext";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { TwoCards } from "../components/TwoCards";
import { RHeading } from "../components/RHeading";
import { useReponsiveContext } from "../hooks/useReponsiveContext";
import { ScrollBox } from "../components/ScrollBox";
import { Trash, Add } from "grommet-icons";
import { scrollTo, areUniqueOnKey } from "../scripts";
import { validation } from "@zilliqa-js/util";

type VoterToAdd = { address: string; credits: number };
const initVoterToAdd = {
  address: "",
  credits: 100,
};

export default function RegisterPage() {
  const main = useMainContext();
  const [loading, setLoading] = useState(false);
  const responsiveContext = useReponsiveContext();
  const [votersToAdd, setVotersToAdd] = useState<VoterToAdd[]>([]);
  const [curDecision, setCurDecision] = useState(
    main.contractAddressses.currentContract
  );
  const [tempVoterValid, setTempVoterValid] = useState(false);
  const [tempVoter, setTempVoter] = useState<VoterToAdd>(initVoterToAdd);
  const lastVoterToAdd = useRef(null);
  const [nextCard, setNextCard] = useState(false);

  /**
   * If user changes the contract reset
   */
  useEffect(() => {
    if (
      main.contractAddressses.currentContract._this_address !=
      curDecision._this_address
    ) {
      setNextCard(false);
      setVotersToAdd([]);
      setTempVoter(initVoterToAdd);
    }
    setCurDecision(main.contractAddressses.currentContract);
  }, [main.contractAddressses.currentContract]);

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
              credits: decision.credits,
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

  function isTempVoterValid(v: VoterToAdd) {
    return (
      validation.isAddress(v.address) &&
      areUniqueOnKey([v, ...votersToAdd], "address")
    );
  }

  function onAddTempVoter() {
    if (tempVoterValid) {
      setVotersToAdd([...votersToAdd, tempVoter]);
      scrollTo(lastVoterToAdd);
      setTempVoter({ address: "", credits: tempVoter.credits });
      setTempVoterValid(false);
    }
  }

  function onDeleteVoter(address: string) {
    setVotersToAdd(votersToAdd.filter((v) => v.address != address));
  }

  function onChangeCredits(credits: string) {
    const c = parseInt(credits);
    if (Number.isInteger(c)) {
      if (10000 > c && c > 0) {
        setTempVoter({ ...tempVoter, credits: c });
      }
    }
  }

  return main.contractAddressses.currentContract.owner != "" ? (
    <Box fill align="center" justify="center" pad="large">
      {!nextCard ? (
        <TwoCards
          Card1={
            <Box fill>
              <RHeading {...{ responsiveContext, txt: "Register users" }} />
              <Paragraph style={{ wordBreak: "break-word" }}>
                As an owner of a decision contract you can register voters and
                the number of credits they can vote with.
              </Paragraph>
            </Box>
          }
          Card2={
            <Box fill justify="around">
              <Heading style={{ wordBreak: "break-word" }} level={"3"}>
                {main.contractAddressses.currentContract.name}
              </Heading>
              <Paragraph
                style={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
                size="small"
              >
                {main.contractAddressses.currentContract.description.replace(
                  /\\n/g,
                  "\n"
                )}
              </Paragraph>
              <Paragraph
                style={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
                size="small"
              >
                {`Owner: ${main.contractAddressses.currentContract.owner}`}
              </Paragraph>
              <Paragraph
                style={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
                size="small"
                color={
                  main.contractAddressses.currentContract.owner == main.curAcc
                    ? "status-ok"
                    : "status-critical"
                }
              >
                {main.contractAddressses.currentContract.owner == main.curAcc
                  ? "You are the owner of this decision."
                  : `You are not the owner of this decision!`}
              </Paragraph>
              <Box align="start" justify="center">
                <Button
                  label={"Show other decisions"}
                  onClick={() =>
                    main.menu.current.setOpen(
                      main.menu.current.open != "contracts"
                        ? "contracts"
                        : "none"
                    )
                  }
                />
              </Box>
            </Box>
          }
          NextButton={
            <Box fill direction="row">
              <Box
                justify="center"
                align="center"
                pad={{ left: "small" }}
                fill
              ></Box>
              <Box align="center" justify="center" fill pad="small">
                <Button
                  disabled={
                    !(
                      main.contractAddressses.currentContract.owner ==
                      main.curAcc
                    )
                  }
                  label={"Next"}
                  onClick={() => setNextCard(true)}
                />
              </Box>
            </Box>
          }
        />
      ) : (
        <TwoCards
          Card1={
            <Box fill>
              <RHeading {...{ responsiveContext, txt: "Register users" }} />
              <Paragraph style={{ wordBreak: "break-word" }}>
                As an owner of a decision contract you can register voters and
                the number of credits they can vote with.
              </Paragraph>
              <ScrollBox props={{ gap: "small" }}>
                {Object.entries(
                  main.contractAddressses.currentContract.voter_balances
                ).map(([k, v], i) => {
                  return (
                    <Box
                      height={{ min: "50px" }}
                      justify="center"
                      key={`option${k}`}
                      margin={{ bottom: "small" }}
                      pad={{ left: "small" }}
                      background="white"
                      round="xsmall"
                      direction="row"
                    >
                      <Box fill justify="center">
                        <Text truncate size="small">
                          {`${i + 1}. ${k}`}
                        </Text>
                        <Text truncate size="small">
                          {`Credits: ${v}`}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </ScrollBox>
            </Box>
          }
          Card2={
            <Box fill>
              <RHeading {...{ responsiveContext, txt: "Voters" }} />
              <Box
                direction="row"
                margin={{ bottom: "small" }}
                height={{ min: "xxsmall" }}
              >
                <Keyboard onEnter={onAddTempVoter}>
                  <Box fill direction="row" gap="small">
                    <Box fill>
                      <TextInput
                        placeholder="Voter Address"
                        size="small"
                        value={tempVoter.address}
                        onChange={(e) => {
                          const next = {
                            ...tempVoter,
                            address: e.target.value,
                          };
                          setTempVoter(next);
                          setTempVoterValid(isTempVoterValid(next));
                        }}
                        maxLength={42}
                      />
                    </Box>
                    <Box width="70%">
                      <TextInput
                        placeholder="Credit to token ratio"
                        size="small"
                        type="number"
                        value={tempVoter.credits}
                        maxLength={3}
                        onChange={(e) => onChangeCredits(e.target.value)}
                      />
                    </Box>
                    <Box align="center" justify="center" height="xxsmall">
                      <Button
                        icon={<Add />}
                        disabled={!tempVoterValid}
                        onClick={onAddTempVoter}
                      />
                    </Box>
                  </Box>
                </Keyboard>
              </Box>
              <ScrollBox props={{ gap: "small" }}>
                {votersToAdd.map((v, i) => {
                  return (
                    <Box
                      height={{ min: "50px" }}
                      justify="center"
                      key={`voter${v.address}`}
                      ref={lastVoterToAdd}
                      margin={{ bottom: "small" }}
                      pad={{ left: "small" }}
                      background="white"
                      round="xsmall"
                      direction="row"
                    >
                      <Box fill justify="center">
                        <Text truncate size="small">
                          {`${i + 1}. ${v.address}`}
                        </Text>
                        <Text truncate size="small">
                          {`Credits: ${v.credits}`}
                        </Text>
                      </Box>
                      <Box align="center" justify="center">
                        <Button
                          onClick={() => onDeleteVoter(v.address)}
                          icon={<Trash />}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </ScrollBox>
            </Box>
          }
          NextButton={
            <Box fill direction="row">
              <Box justify="center" align="center" pad={{ left: "small" }} fill>
                <Button
                  disabled={false}
                  secondary
                  label={"Go Back"}
                  onClick={() => setNextCard(false)}
                />
              </Box>
              <Box align="center" justify="center" fill pad="small">
                <Button
                  disabled={loading}
                  label={"Deploy to zilliqa"}
                  onClick={() => console.log("asfe")}
                />
              </Box>
            </Box>
          }
        />
      )}
    </Box>
  ) : (
    <Text>Choose a decision contract you own to register voters.</Text>
  );
}
