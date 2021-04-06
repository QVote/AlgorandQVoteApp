import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Text, Keyboard, TextInput, Heading } from "grommet";
import { useMainContext } from "../hooks/useMainContext";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { TwoCards } from "../components/TwoCards";
import { QHeading } from "../components/QHeading";
import { ScrollBox } from "../components/ScrollBox";
import { Trash, Add } from "grommet-icons";
import { scrollTo, areUniqueOnKey, convertToHex } from "../scripts";
import { validation } from "@zilliqa-js/util";
import { QVote } from "../types";
import { QParagraph } from "../components/QParagraph";
import { BlockchainApi } from "../helpers/BlockchainApi";

type VoterToAdd = { address: string; credits: number };
const initVoterToAdd = {
  address: "",
  credits: 100,
};

export default function RegisterPage() {
  const main = useMainContext();

  return main.contractAddressses.currentContract.owner != "" ? (
    <Register
      {...{
        main,
        curDecision: main.contractAddressses.currentContract,
        change: main.contractAddressses.change,
      }}
    />
  ) : (
    <Text>Choose a decision contract you own to register voters.</Text>
  );
}

function Register({
  curDecision,
  main,
  change,
}: {
  curDecision: QVote.ContractDecisionProcessed;
  main: ReturnType<typeof useMainContext>;
  change: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [votersToAdd, setVotersToAdd] = useState<VoterToAdd[]>([]);
  const [tempVoterValid, setTempVoterValid] = useState(false);
  const [tempVoter, setTempVoter] = useState<VoterToAdd>(initVoterToAdd);
  const lastVoterToAdd = useRef(null);
  const [nextCard, setNextCard] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previousChange, setPreviousChange] = useState(change);
  const [curBlock, setCurBlock] = useState(-1);
  const [txRate, setTxRate] = useState(-1);

  /**
   * reset on change
   */
  useEffect(() => {
    if (change != previousChange) {
      reset();
      setPreviousChange(change);
    }
  }, [change]);

  useEffect(() => {
    getCurBlock();
  }, [change]);

  function reset() {
    setNextCard(false);
    setSubmitted(false);
    setVotersToAdd([]);
    setTempVoter(initVoterToAdd);
    setSubmitted(false);
    setCurBlock(-1);
  }

  async function getCurBlock() {
    try {
      const curBlockNumber = await BlockchainApi.getCurrentBlockNumber();
      const rate = await BlockchainApi.getCurrentTxBlockRate();
      setCurBlock(curBlockNumber);
      setTxRate(rate);
    } catch (e) {
      console.error(e);
    }
  }

  async function onOwnerRegister() {
    if (!loading) {
      try {
        setLoading(true);
        const blockchainApi = new BlockchainApi({
          wallet: "zilPay",
          protocol: main.blockchainInfo.protocol,
        });
        const tx = await blockchainApi.ownerRegister(
          curDecision._this_address,
          {
            addresses: votersToAdd.map((v) => convertToHex(v.address)),
            creditsForAddresses: votersToAdd.map((v) => v.credits),
          }
        );
        setSubmitted(true);
        main.jobsScheduler.checkContractCall(
          {
            id: tx.ID,
            name: `Register Transaction: ${tx.ID}`,
            status: "waiting",
            contractAddress: curDecision._this_address,
            type: "Register",
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
      validation.isAddress(convertToHex(v.address)) &&
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

  function onAddressChange(a: string) {
    const next = {
      ...tempVoter,
      address: a,
    };
    setTempVoter(next);
    setTempVoterValid(isTempVoterValid(next));
  }

  return submitted ? (
    <Box fill align="center" justify="center" pad="large">
      <Box height="small" />
      <QHeading>{"Transaction submitted!"}</QHeading>
      <Box height="20%" justify="center" align="center">
        <Text truncate>{"Register more voters?"}</Text>
      </Box>
      <Box align="center" justify="center" gap="medium">
        <Button label={"Go to register"} onClick={() => reset()} />
      </Box>
      <Box fill />
    </Box>
  ) : (
    <Box fill align="center" justify="center" pad="large">
      {!nextCard ? (
        <TwoCards
          Card1={
            <Box fill>
              <QHeading>{"Register voters"}</QHeading>
              <QParagraph>
                As an owner of a decision contract you can register voters and
                the number of credits they can vote with.
              </QParagraph>
              <QParagraph>
                If you call register multiple times only the last registration
                will be valid!
              </QParagraph>
            </Box>
          }
          Card2={
            <Box fill justify="start">
              <Heading style={{ wordBreak: "break-word" }} level={"3"}>
                {curDecision.name}
              </Heading>
              <QParagraph size="small">
                {curDecision.description.replace(/\\n/g, "\n")}
              </QParagraph>
              <QParagraph
                size="small"
                color={
                  curDecision.owner == main.curAcc
                    ? "status-ok"
                    : "status-critical"
                }
              >
                {curDecision.owner == main.curAcc
                  ? "You are the owner of this decision."
                  : `You are not the owner of this decision!`}
              </QParagraph>
              <QParagraph
                size="small"
                color={
                  curDecision.registration_end_time - curBlock > 0
                    ? "status-ok"
                    : "status-critical"
                }
              >
                {curBlock != -1 &&
                  (curDecision.registration_end_time - curBlock > 0
                    ? `Registration ends in ${
                        curDecision.registration_end_time - curBlock
                      } blocks, ~${Math.round(
                        (curDecision.registration_end_time - curBlock) /
                          txRate /
                          60
                      )} minutes.`
                    : `Registration period ended.`)}
              </QParagraph>
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
                      curDecision.owner == main.curAcc &&
                      curDecision.registration_end_time - curBlock > 0
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
              <QHeading>{"Already Registered:"}</QHeading>
              {Object.entries(curDecision.voter_balances).length != 0 ? (
                <ScrollBox props={{ gap: "small" }}>
                  {Object.entries(curDecision.voter_balances).map(
                    ([k, v], i) => {
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
                    }
                  )}
                </ScrollBox>
              ) : (
                <QParagraph size="small">
                  {"There are no registered voters on this decision."}
                </QParagraph>
              )}
            </Box>
          }
          Card2={
            <Box fill>
              <QHeading>{"Voters"}</QHeading>
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
                        onChange={(e) => onAddressChange(e.target.value)}
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
                  disabled={loading || votersToAdd.length == 0}
                  label={"Register Voters"}
                  onClick={() => onOwnerRegister()}
                />
              </Box>
            </Box>
          }
        />
      )}
    </Box>
  );
}
