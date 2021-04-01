import { QVote } from "../../types";
import { useState, useContext, useRef, useEffect } from "react";
import {
  Box,
  TextInput,
  TextArea,
  Button,
  Heading,
  Keyboard,
  Text,
  ResponsiveContext,
} from "grommet";
import { v4 as uuidv4 } from "uuid";
import { DateTimeDrop } from "../DateTimeDrop";
import { decisionValidate } from "./script";
import { GlobalContext } from "../GlobalContext";
import { ScrollBox } from "../ScrollBox";
import { Checkmark } from "grommet-icons";
import { areOptionsUnique, sleep } from "../../scripts";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { Contract } from "@zilliqa-js/contract";
import { Transaction } from "@zilliqa-js/account";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import Cookie from "js-cookie";
import { BLOCKCHAINS } from "../../config";
import { useMainContext } from "../../hooks/useMainContext";

export function DecisionCreator({
  initDecision,
}: {
  initDecision: QVote.Decision;
}) {
  const responsiveContext = useContext(ResponsiveContext);
  const main = useMainContext();
  const [decision, setDecision] = useState(initDecision);
  const [isAddOption, setIsAddOption] = useState(true);
  const [tempOption, setTempOption] = useState("");
  const [isTempOptionValid, setIsTempOptionValid] = useState(false);
  const [decisionValid, setDecisionValid] = useState(
    decisionValidate(initDecision)
  );
  const [loading, setLoading] = useState(false);
  const [deployingToTxt, setDeployingToTxt] = useState("");
  const [success, setSuccess] = useState<[string, string]>(["", ""]);
  const [errTxt, setErrTxt] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const lastOption = useRef(null);

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

  function getDateTime(milis: number) {
    const date = new Date(milis);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let pmOrAm = "";
    if (hours > 12) {
      hours = hours % 12;
      pmOrAm = "pm";
    } else {
      pmOrAm = "am";
    }
    let timeString = "";
    if (minutes < 10) {
      timeString = `${hours}:0${minutes} ${pmOrAm}`;
    } else {
      timeString = `${hours}:${minutes} ${pmOrAm}`;
    }

    return { date: date, time: timeString };
  }

  function onChangeRegisterEndTime(time: number) {
    updateDecision({ ...decision, registerEndTime: time });
  }

  function onChangeEndTime(time: number) {
    updateDecision({ ...decision, endTime: time });
  }

  // function onDeleteOption(o: QVote.Option) {
  //   const newOptions = decision.options.filter((x) => x.uid != o.uid);
  //   updateDecision({ ...decision, options: newOptions });
  // }

  async function retryLoop(
    maxRetries: number,
    intervalMs: number,
    func: () => Promise<{ shouldRetry: boolean; res: any }>
  ): Promise<any> {
    for (let x = 0; x < maxRetries; x++) {
      await sleep(x * intervalMs);
      try {
        const temp = await func();
        if (!temp.shouldRetry) {
          return temp.res;
        }
      } catch (e) {
        console.error(e);
        continue;
      }
    }
    throw new Error("Function didnt manage to run in time");
  }

  function isSuccess(receipt: any): boolean {
    return receipt.success;
  }

  async function onDeploy() {
    if (!loading && decisionValid) {
      try {
        setLoading(true);
        setSuccess(["", ""]);
        setDeployingToTxt("");
        setIsDeploying(true);
        setErrTxt("");

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
              name: "Test hi",
              description: "Hello hi",
              options: ["opt1", "opt2", "opt3", "opt4"],
              creditToTokenRatio: "1000",
              //can register for next 0 min
              registrationEndTime: qv.futureTxBlockNumber(
                curBlockNumber,
                60 * 0
              ),
              //can vote in 0 min and voting is open for 15 min
              expirationBlock: qv.futureTxBlockNumber(curBlockNumber, 60 * 15),
              tokenId: "DogeCoinZilToken",
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
        //RETRY UNTIL WE HAVE A RECEIPT
        const receipt = await retryLoop(15, 5000, async () => {
          const resTx = await zilPayBlockchainApi.getTransaction(tx.ID);
          if (resTx.receipt) {
            return { res: resTx.receipt, shouldRetry: false };
          }
          return { res: undefined, shouldRetry: true };
        });
        console.log({ receipt });
        if (isSuccess(receipt)) {
          main.contractAddressses.pushAddress(contractInstance.address);
        }
        //setSuccess(["Success! QVote address:", contract.address]);
        //g.setQvoteAddress(contractInstance.address);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setErrTxt(e.message);
      }
    }
  }

  return (
    <Box
      fill
      animation={[{ type: "fadeIn", duration: 500 }]}
      align="center"
      justify="center"
      pad="large"
    >
      <Box fill background="white" round="xsmall">
        <Box
          fill
          pad="medium"
          direction={responsiveContext == "small" ? "column" : "row"}
        >
          <ScrollBox props={{ pad: "medium" }}>
            <Heading level={responsiveContext == "small" ? "2" : "1"}>
              Details
            </Heading>
            <Box fill gap="small">
              <TextInput
                placeholder="Name"
                size="small"
                value={decision.name}
                maxLength={100}
                onChange={(e) => onChangeName(e.target.value)}
              />
              <TextInput
                placeholder="Details"
                size="small"
                value={decision.description}
                maxLength={100}
                onChange={(e) => onChangeDescription(e.target.value)}
              />
              <DateTimeDrop
                placeholder="Register by:"
                dt={getDateTime(decision.registerEndTime)}
                onChange={(v) => onChangeRegisterEndTime(v)}
              />
              <DateTimeDrop
                placeholder="Start on:"
                dt={getDateTime(decision.endTime)}
                onChange={(v) => onChangeEndTime(v)}
              />
            </Box>
          </ScrollBox>
          <ScrollBox
            props={{
              background: "light-1",
              pad: "medium",
              round: "xsmall",
            }}
          >
            <Heading level={responsiveContext == "small" ? "2" : "1"}>
              Options
            </Heading>
            <Box direction="row" margin={{ bottom: "medium" }}>
              <Keyboard onEnter={onAddNewOption}>
                <Box fill direction="row">
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
                  <Box align="center">
                    <Button
                      disabled={!isTempOptionValid}
                      icon={<Checkmark />}
                      onClick={onAddNewOption}
                    />
                  </Box>
                </Box>
              </Keyboard>
            </Box>
            <ScrollBox props={{ pad: "small" }}>
              {decision.options.map((o, i) => {
                return (
                  <Box
                    height={{ min: "30px" }}
                    justify="center"
                    key={`option${o.optName}`}
                    ref={lastOption}
                    margin={{ bottom: "small" }}
                  >
                    <Text truncate size="small">
                      {`${i + 1}. ${o.optName}`}
                    </Text>
                  </Box>
                );
              })}
            </ScrollBox>
          </ScrollBox>
        </Box>
        <Box height={{ min: "60px" }}>
          <Box align="center" justify="center" fill>
            <Button
              disabled={loading || !decisionValid}
              label={"Deploy"}
              onClick={() => onDeploy()}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
