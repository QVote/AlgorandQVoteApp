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
import { fromBech32Address } from "@zilliqa-js/crypto";

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
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setNextCard(false);
    setSubmitted(false);
    setVotersToAdd([]);
    setTempVoter(initVoterToAdd);
    setSubmitted(false);
  }

  /**
   * If user changes the contract reset
   */
  useEffect(() => {
    if (
      main.contractAddressses.currentContract._this_address !=
      curDecision._this_address
    ) {
      reset();
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
        const qv = new QVoteZilliqa(null, main.blockchainInfo.protocol);
        const gasPrice = await qv.handleMinGas(
          zilPayBlockchainApi.getMinimumGasPrice()
        );
        const contract = await zilPayContractApi.at(curDecision._this_address);
        const [transition, args, params] = qv.payloadOwnerRegister({
          payload: {
            addresses: votersToAdd.map((v) => convertToHex(v.address)),
            creditsForAddresses: votersToAdd.map((v) => v.credits),
          },
          gasPrice,
        });
        const tx = await contract.call(transition, args, params, true);
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

  function convertToHex(bench32OrHex: string) {
    let a = bench32OrHex;
    try {
      a =
        bench32OrHex.startsWith("zil") && bench32OrHex.length == 42
          ? fromBech32Address(bench32OrHex)
          : bench32OrHex;
    } catch (e) {
      console.error(e);
    }
    return a;
  }

  return curDecision.owner != "" ? (
    submitted ? (
      <Box fill align="center" justify="center" pad="large">
        <Box height="small" />
        <RHeading {...{ responsiveContext, txt: "Transaction submitted!" }} />
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
                <RHeading {...{ responsiveContext, txt: "Register users" }} />
                <Paragraph
                  style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
                >
                  As an owner of a decision contract you can register voters and
                  the number of credits they can vote with.
                </Paragraph>
                <Paragraph
                  style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
                >
                  If you call register multiple times only the last registration will be valid!
                </Paragraph>
              </Box>
            }
            Card2={
              <Box fill justify="start">
                <Heading style={{ wordBreak: "break-word" }} level={"3"}>
                  {curDecision.name}
                </Heading>
                <Paragraph
                  style={{
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                  }}
                  size="small"
                >
                  {curDecision.description.replace(/\\n/g, "\n")}
                </Paragraph>
                <Paragraph
                  style={{
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                  }}
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
                    disabled={!(curDecision.owner == main.curAcc)}
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
                <RHeading
                  {...{ responsiveContext, txt: "Already Registered:" }}
                />
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
                  <Paragraph
                    size="small"
                    style={{
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                    }}
                  >
                    {"There is no registered voters on this decision."}
                  </Paragraph>
                )}
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
                <Box
                  justify="center"
                  align="center"
                  pad={{ left: "small" }}
                  fill
                >
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
    )
  ) : (
    <Text>Choose a decision contract you own to register voters.</Text>
  );
}
