import { QVote } from "../types";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextInput,
  TextArea,
  Button,
  Keyboard,
  Text,
  CheckBox,
  Select,
} from "grommet";
import { v4 as uuidv4 } from "uuid";
import { decisionValidate, getInitDecision, areUniqueOnKey } from "../scripts";
import { ScrollBox } from "../components/ScrollBox";
import { Money, Clock, InProgress, Scorecard, Trash, Add } from "grommet-icons";
import { useMainContext } from "../hooks/useMainContext";
import { TwoCards } from "../components/TwoCards";
import { QHeading } from "../components/QHeading";
import { scrollTo } from "../scripts";
import { BlockchainApi, TOKENS } from "../helpers/BlockchainApi";
import { TransactionSubmitted } from "../components/TransactionSubmitted";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import {
  SnapshotDeployRequest,
  SnapshotDeployResponse,
} from "./api/deployWithSnapshot";

export default function DecisionCreator() {
  const main = useMainContext();
  const [decision, setDecision] = useState(getInitDecision());
  const [tempOption, setTempOption] = useState("");
  const [isTempOptionValid, setIsTempOptionValid] = useState(false);
  const [decisionValid, setDecisionValid] = useState(
    decisionValidate(getInitDecision())
  );
  const [loading, setLoading] = useState(false);
  const lastOption = useRef(null);
  const [nextCard, setNextCard] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [useTokenOwnershipSnapshot, setUseTokenOwnershipSnapshot] = useState(
    false
  );

  function reset() {
    setUseTokenOwnershipSnapshot(false);
    setLoading(false);
    setNextCard(false);
    setSubmitted(false);
    setDecisionValid(decisionValidate(getInitDecision()));
    setDecision(getInitDecision());
    setTempOption("");
    setIsTempOptionValid(false);
  }

  const canAddOption = () =>
    tempOption != "" && areUniqueOnKey(decision.options, "optName");

  function updateDecision(d: QVote.Decision) {
    setDecision(d);
    setDecisionValid(decisionValidate(d));
  }

  function onChangeName(n: string) {
    updateDecision({ ...decision, name: n });
  }

  function onChangeDescription(d: string) {
    updateDecision({ ...decision, description: d });
  }

  function onAddNewOption() {
    if (canAddOption() && isTempOptionValid) {
      const toAdd: QVote.Option = {
        optName: tempOption,
        uid: uuidv4(),
      };
      updateDecision({ ...decision, options: [...decision.options, toAdd] });
      setTempOption("");
      setIsTempOptionValid(false);
      scrollTo(lastOption);
    }
  }

  function onChangeRegisterEndTime(time: string) {
    const registerEndTime = parseInt(time);
    if (Number.isInteger(registerEndTime)) {
      if (registerEndTime >= 0) {
        updateDecision({ ...decision, registerEndTime });
      }
    }
  }

  function onChangeEndTime(time: string) {
    const endTime = parseInt(time);
    if (Number.isInteger(endTime)) {
      if (endTime > 0) {
        updateDecision({ ...decision, endTime });
      }
    }
  }

  function onChangeTokenId(tokenId: string) {
    updateDecision({ ...decision, tokenId });
  }

  function onChangeCreditToTokenRatio(creditToTokenRatio: string) {
    const ratio = parseInt(creditToTokenRatio);
    if (Number.isInteger(ratio)) {
      if (10000 > ratio && ratio > 0) {
        updateDecision({ ...decision, creditToTokenRatio });
      }
    }
  }

  function onDeleteOption(o: QVote.Option) {
    const newOptions = decision.options.filter((x) => x.uid != o.uid);
    updateDecision({ ...decision, options: newOptions });
  }

  async function onTryToDeploy() {
    if (!loading && decisionValid.isValid) {
      setLoading(true);
      try {
        if (useTokenOwnershipSnapshot) {
          await callApi();
        } else {
          await onDeploy();
        }
      } catch (e) {
        main.longNotification.current.setError();
        main.longNotification.current.onShowNotification(
          "Something went wrong!"
        );
      }
      setLoading(false);
    }
  }

  async function onDeploy() {
    const blockchain = new BlockchainApi({
      wallet: "zilPay",
      protocol: main.blockchainInfo.protocol,
    });
    const [tx, contractInstance] = await blockchain.deploy(
      decision,
      main.curAcc
    );
    setSubmitted(true);
    main.jobsScheduler.checkDeployCall({
      id: tx.ID,
      name: `Deploy Transaction: ${tx.ID}`,
      status: "waiting",
      contractAddress: contractInstance.address,
      type: "Deploy",
    });
    main.longNotification.current.setLoading();
    main.longNotification.current.onShowNotification(
      "Waiting for transaction confirmation..."
    );
  }

  async function callApi() {
    const rate = await BlockchainApi.getCurrentTxBlockRate();
    const secRate = Math.round(1 / rate);
    const curBlock = await BlockchainApi.getCurrentBlockNumber();
    const qv = new QVoteZilliqa(null, main.blockchainInfo.protocol, secRate);
    const body: SnapshotDeployRequest = {
      net: main.blockchainInfo.name,
      name: decision.name,
      description: decision.description,
      options: decision.options.map((o) => o.optName),
      creditToTokenRatio: decision.creditToTokenRatio,
      registrationEndTime: qv.futureTxBlockNumber(curBlock, 60 * 7),
      expirationBlock: qv.futureTxBlockNumber(curBlock, 60 * 100),
      tokenId: decision.tokenId,
    };
    const response = await fetch("/api/deployWithSnapshot", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const resBody = (await response.json()) as SnapshotDeployResponse;
      console.log(resBody);
      setSubmitted(true);
      main.jobsScheduler.checkDeployCall({
        id: resBody.deployID,
        name: `Deploy Transaction: ${resBody.deployID}`,
        status: "waiting",
        contractAddress: resBody.contractAddress,
        type: "Deploy",
      });
      main.jobsScheduler.checkContractCall({
        id: resBody.registerID,
        name: `Register Transaction: ${resBody.registerID}`,
        status: "waiting",
        contractAddress: resBody.contractAddress,
        type: "Register",
      });
      main.longNotification.current.setLoading();
      main.longNotification.current.onShowNotification(
        "Waiting for deploy and register confirmation..."
      );
    } else {
      throw new Error("Failed");
    }
  }

  return submitted ? (
    <TransactionSubmitted
      onClick={() => reset()}
      txt="Create another?"
      buttonLabel="Go to create"
    />
  ) : !nextCard ? (
    <TwoCards
      Card1={
        <Box fill>
          <QHeading>{"Details"}</QHeading>
          <Box fill gap="small">
            <TextInput
              placeholder="Name"
              size="small"
              value={decision.name}
              maxLength={100}
              onChange={(e) => onChangeName(e.target.value)}
            />
            <TextArea
              resize={false}
              fill
              placeholder="Details"
              size="small"
              value={decision.description}
              maxLength={100}
              onChange={(e) => onChangeDescription(e.target.value)}
            />
          </Box>
        </Box>
      }
      Card2={
        <Box fill>
          <QHeading>{"Options"}</QHeading>
          <Box
            direction="row"
            margin={{ bottom: "small" }}
            height={{ min: "xxsmall" }}
          >
            <Keyboard onEnter={onAddNewOption}>
              <Box fill direction="row" gap="small">
                <Box fill>
                  <TextInput
                    placeholder="Option Name"
                    size="small"
                    value={tempOption}
                    onChange={(e) => {
                      setTempOption(e.target.value);
                      setIsTempOptionValid(
                        areUniqueOnKey(
                          [
                            ...decision.options,
                            { optName: e.target.value, uid: "tempOP" },
                          ],
                          "optName"
                        )
                      );
                    }}
                    maxLength={26}
                  />
                </Box>
                <Box align="center" justify="center" height="xxsmall">
                  <Button
                    icon={<Add />}
                    disabled={!isTempOptionValid}
                    onClick={onAddNewOption}
                  />
                </Box>
              </Box>
            </Keyboard>
          </Box>
          <ScrollBox props={{ gap: "small" }}>
            {decision.options.map((o, i) => {
              return (
                <Box
                  height={{ min: "50px" }}
                  justify="center"
                  key={`option${o.optName}`}
                  ref={lastOption}
                  margin={{ bottom: "small" }}
                  pad={{ left: "small" }}
                  background="white"
                  round="xsmall"
                  direction="row"
                >
                  <Box fill justify="center">
                    <Text truncate size="small">
                      {`${i + 1}. ${o.optName}`}
                    </Text>
                  </Box>
                  <Box align="center" justify="center">
                    <Button
                      onClick={() => onDeleteOption(o)}
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
          ></Box>
          <Box align="center" justify="center" fill pad="small">
            <Button
              disabled={
                !(
                  decisionValid.nameValid &&
                  decisionValid.descriptionValid &&
                  decisionValid.optionsValid
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
          <QHeading>{"Time"}</QHeading>
          <Box fill gap="small">
            <Text>Registration open:</Text>
            <TextInput
              icon={<Clock />}
              placeholder="Minutes for registration"
              size="small"
              type="number"
              value={decision.registerEndTime}
              onChange={(e) => onChangeRegisterEndTime(e.target.value)}
            />
            <Text>Voting open after registration:</Text>
            <TextInput
              icon={<InProgress />}
              placeholder="Minutes voting is open after registration"
              size="small"
              type="number"
              value={decision.endTime}
              onChange={(e) => onChangeEndTime(e.target.value)}
            />
          </Box>
        </Box>
      }
      Card2={
        <Box fill gap="small">
          <QHeading>{"Tokens"}</QHeading>
          <CheckBox
            checked={useTokenOwnershipSnapshot}
            label="Use token ownership snapshot?"
            onChange={() =>
              setUseTokenOwnershipSnapshot(!useTokenOwnershipSnapshot)
            }
          />
          {useTokenOwnershipSnapshot && (
            <Box fill gap="small">
              <Text>Credit to token ratio</Text>
              <TextInput
                icon={<Scorecard />}
                placeholder="Credit to token ratio"
                size="small"
                type="number"
                value={decision.creditToTokenRatio}
                maxLength={3}
                onChange={(e) => onChangeCreditToTokenRatio(e.target.value)}
              />
              <Text>Token ID</Text>
              <Select
                icon={<Money />}
                options={Object.entries(TOKENS[main.blockchainInfo.name]).map(
                  (e) => e[0]
                )}
                value={decision.tokenId}
                onChange={({ option }) =>
                  updateDecision({ ...decision, tokenId: option })
                }
              />
            </Box>
          )}
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
              disabled={loading || !decisionValid.isValid}
              label={loading ? "Waiting for confirmation" : "Deploy to zilliqa"}
              onClick={() => onTryToDeploy()}
            />
          </Box>
        </Box>
      }
    />
  );
}
