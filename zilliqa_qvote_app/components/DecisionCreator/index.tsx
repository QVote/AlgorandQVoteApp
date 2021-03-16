import { QVote } from "../../types";
import { useState, useContext } from 'react';
import { Box, TextInput, TextArea, Button, Keyboard, Text } from 'grommet';
import { DecisionPreview } from './DecisionPreview';
import { v4 as uuidv4 } from 'uuid';
import { DateTimeDrop } from '../DateTimeDrop';
import { decisionValidate } from './script';
// import { ContractFactory, ethers } from 'ethers';
// import { abi, bytecode } from '../../config';
import { GlobalContext } from '../GlobalContext'
import { concatStrings, makeStringUniq, uniqStringToString } from '../../scripts';
import { CopyOnly } from '../WithMetamask/CopyOnly';
import { QVoteZilliqa } from '@qvote/zilliqa-sdk'; 

export function DecisionCreator({ initDecision }: { initDecision: QVote.Decision }) {
    const [decision, setDecision] = useState(initDecision);
    const [isAddOption, setIsAddOption] = useState(false);
    const [tempOption, setTempOption] = useState("");
    const [decisionValid, setDecisionValid] = useState(decisionValidate(initDecision))
    const [loading, setLoading] = useState(false);
    const [deployingToTxt, setDeployingToTxt] = useState("");
    const [success, setSuccess] = useState<[string, string]>(["", ""]);
    const [errTxt, setErrTxt] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);
    const g = useContext(GlobalContext);

    const canAddOption = () => tempOption != "";

    function updateDecision(d: QVote.Decision) {
        setDecision(d);
        setDecisionValid(decisionValidate(d));
    }

    function onChangeName(n: string) {
        updateDecision({ ...decision, name: n })
    }

    function onChangeDescription(d: string) {
        updateDecision({ ...decision, description: d })
    }

    function onAddNewOption() {
        if (canAddOption()) {
            const toAdd: QVote.Option = {
                optName: tempOption,
                uid: uuidv4()
            }
            updateDecision({ ...decision, options: [...decision.options, toAdd] })
            setTempOption("");
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

    function onChangeEndTime(time: number) {
        updateDecision({ ...decision, endTime: time });
    }

    function onDeleteOption(o: QVote.Option) {
        const newOptions = decision.options.filter(x => x.uid != o.uid);
        updateDecision({ ...decision, options: newOptions })
    }

    /*async function onDeployOLD() {
        if (!loading && decisionValid) {
            try {
                setLoading(true);
                setSuccess(["", ""]);
                setDeployingToTxt("");
                setErrTxt("");
                const provider = new ethers.providers.Web3Provider(g.eth.current)
                const factory = new ContractFactory(abi, bytecode, provider.getSigner());
                const payload: [string, string, string[], number] = [
                    "QVote",
                    concatStrings(decision.name, decision.description),
                    decision.options.map(o => {
                        const uniqOption = makeStringUniq(o.optName);
                        return ethers.utils.formatBytes32String(uniqOption)
                    }),
                    Math.round(decision.endTime / (1000 * 60))
                ]
                const contract = await factory.deploy(...payload);
                setIsDeploying(true);
                setDeployingToTxt(`Deploying to: ${contract.address} ...`);
                const receipt = await contract.deployTransaction.wait();
                if (receipt.status == 1) {
                    setSuccess(["Success! QVote address:", contract.address])
                    g.setQvoteAddress(contract.address)
                }
                setLoading(false);
            } catch (e) {
                setLoading(false);
                setErrTxt(e.message);
            }
        }
    }*/ 

	async function onDeploy() {
        if (!loading && decisionValid) {
            try {
                setLoading(true);
                setSuccess(["", ""]);
                setDeployingToTxt("");
                setErrTxt("");
				const qv = new QVoteZilliqa(); 
				const isConnected = await window.zilPay.connect(); 
				if (!isConnected) {
					throw new Error('user rejected');
				}
				const zil = window.zilPay;
				// set up config 
				const txblock = await zil.blockchain.getLatestTxBlock();
				const curBlockNumber = parseInt(txblock.result!.header!.BlockNum);
				const gasPrice = await qv.handleMinGas(zil.blockchain.getMinimumGasPrice());

				// zil.wallet.setDefault(deployerAddress);    // this should be taken care of by zilpay 
				// TODO could set this by subscribing to the event (check zilpay api) 
				const deployerAddress = zil.wallet.defaultAccount.base16;    
				const contract = zil.contracts.new(...qv.payloadQv({
					payload: {
						name: "Test hi",
						description: "Hello hi",
						options: ["opt1", "opt2", "opt3", "opt4"],
						creditToTokenRatio: "1000",
						//can register for next 0 min
						// TODO make times variable 
						registrationEndTime: qv.futureTxBlockNumber(curBlockNumber, 60 * 0),
						//can vote in 0 min and voting is open for 15 min
						expirationBlock: qv.futureTxBlockNumber(curBlockNumber, 60 * 15),
						tokenId: "DogeCoinZilToken"
					}, 
					ownerAddress: deployerAddress,
				}));
				
                setIsDeploying(true);
                setDeployingToTxt(`Deploying to: ${contract.address} ...`);
				const [qvotingAddress, instance, deployTx] = await qv.handleDeploy(
					contract.deploy(...qv.payloadDeploy({ gasPrice }))
				);
				setSuccess(["Success! QVote address:", contract.address])
              	g.setQvoteAddress(contract.address)
				setLoading(false); 
				console.log(qvotingAddress); 
            } catch (e) {
                setLoading(false);
                setErrTxt(e.message);
            }
        }
    }


    return (
        !isDeploying ?
            <Box fill direction="row" gap="large"
                animation={[
                    { type: "fadeIn", duration: 1000 },
                    { type: "slideLeft", duration: 1000 },
                ]}>
                <DecisionPreview d={decision} onDeleteOption={onDeleteOption} />
                <Box flex round="small" pad="medium" gap="small">
                    <TextInput
                        placeholder="Name"
                        value={decision.name}
                        maxLength={100}
                        onChange={(e) => onChangeName(e.target.value)}
                    />
                    <TextArea
                        placeholder="Details"
                        value={decision.description}
                        resize="vertical"
                        maxLength={100}
                        onChange={(e) => onChangeDescription(e.target.value)}
                    />
                    <DateTimeDrop
                        placeholder="End time"
                        dt={getDateTime(decision.endTime)}
                        onChange={(v) => onChangeEndTime(v)}
                    />
                    <Keyboard onEnter={onAddNewOption}>
                        <Box align="start">
                            {
                                isAddOption ?
                                    <Box fill gap="small">
                                        <TextInput
                                            placeholder="Option Name"
                                            value={tempOption}
                                            onChange={(e) => setTempOption(e.target.value)}
                                            maxLength={26}
                                        />
                                        <Box align="start">
                                            <Button disabled={!canAddOption()} label={"Confirm"} onClick={onAddNewOption} />
                                        </Box>
                                    </Box>
                                    :
                                    <Button label={"Add option"} onClick={() => setIsAddOption(true)} />
                            }
                        </Box>
                    </Keyboard>
                    <Box align="start">
                        <Button
                            disabled={loading || !decisionValid} label={"Deploy"} onClick={onDeploy} />
                    </Box>
                </Box>
            </Box >
            :
            <Box fill direction="row" gap="large">
                <Box flex elevation="small" round="small" pad="medium" gap="large">
                    {deployingToTxt != "" &&
                        <Box>
                            <Text color="status-warning" wordBreak="break-all">
                                {deployingToTxt}
                            </Text>
                        </Box>
                    }
                    {success[0] != "" &&
                        <Box>
                            <CopyOnly arr={[success]} />
                        </Box>
                    }
                    {errTxt != "" &&
                        <Box>
                            <Text truncate={true} color={"status-error"}>
                                {errTxt}
                            </Text>
                        </Box>
                    }
                    {
                        success[0] != "" &&
                        <Box align="center">
                            <Button
                                label={"Deploy another?"} onClick={() => {
                                    setIsDeploying(false);
                                    setDecision(initDecision)
                                }} />
                        </Box>
                    }
                </Box>
            </Box>
    )
}
