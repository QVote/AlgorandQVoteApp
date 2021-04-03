import { QVote } from "../../types";
import { useState, useRef } from "react";
import {
  Box,
  TextInput,
  TextArea,
  Button,
  Heading,
  Keyboard,
  Text,
} from "grommet";
import { v4 as uuidv4 } from "uuid";
import { decisionValidate, getInitDecision } from "../../scripts";
import { ScrollBox } from "../ScrollBox";
import { Money, Clock, InProgress, Scorecard, Trash, Add } from "grommet-icons";
import { areOptionsUnique } from "../../scripts";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { useMainContext } from "../../hooks/useMainContext";
import { TwoCards } from "../TwoCards";
import { RHeading } from "../RHeading";
import { useReponsiveContext } from "../../hooks/useReponsiveContext";

export function DecisionCreator({
  initDecision,
}: {
  initDecision: QVote.Decision;
}) {
  const responsiveContext = useReponsiveContext();
  const main = useMainContext();
  const [decision, setDecision] = useState(initDecision);
  const [tempOption, setTempOption] = useState("");
  const [isTempOptionValid, setIsTempOptionValid] = useState(false);
  const [decisionValid, setDecisionValid] = useState(
    decisionValidate(initDecision)
  );
  const [loading, setLoading] = useState(false);
  const lastOption = useRef(null);
  const [nextCard, setNextCard] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canAddOption = () =>
    tempOption != "" && areOptionsUnique(decision.options);

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
      try {
        setTimeout(
          () =>
            lastOption.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          50
        );
      } catch (e) {
        console.log(e);
      }
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

  async function onDeploy() {
    if (!loading && decisionValid.isValid) {
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

  return submitted ? (
    <Box fill align="center" justify="center" pad="large">
      <Box height="small" />
      <Heading
        textAlign="center"
        level={responsiveContext == "small" ? "2" : "1"}
      >
        {"Transaction submitted!"}
      </Heading>
      <Box height="20%" justify="center" align="center">
        <Text truncate>{"Create another decision?"}</Text>
      </Box>
      <Box align="center" justify="center" gap="medium">
        <Button
          label={"Go to create"}
          onClick={() => {
            updateDecision(getInitDecision());
            setNextCard(false);
            setSubmitted(false);
          }}
        />
      </Box>
      <Box fill />
    </Box>
  ) : (
    <Box fill align="center" justify="center" pad="large">
      {!nextCard ? (
        <TwoCards
          Card1={
            <Box fill>
              <RHeading {...{ responsiveContext, txt: "Details" }} />
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
              <RHeading {...{ responsiveContext, txt: "Options" }} />
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
                            areOptionsUnique([
                              ...decision.options,
                              { optName: e.target.value, uid: "tempOP" },
                            ])
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
              <RHeading {...{ responsiveContext, txt: "Time" }} />
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
            <Box fill>
              <RHeading {...{ responsiveContext, txt: "Tokens" }} />
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
                <TextInput
                  icon={<Money />}
                  placeholder="Token ID"
                  size="small"
                  value={decision.tokenId}
                  maxLength={100}
                  onChange={(e) => onChangeTokenId(e.target.value)}
                />
              </Box>
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
                  label={"Deploy to zilliqa"}
                  onClick={() => onDeploy()}
                />
              </Box>
            </Box>
          }
        />
      )}
    </Box>
  );
}
