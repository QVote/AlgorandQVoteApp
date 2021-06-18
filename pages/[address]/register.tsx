import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Text, Keyboard, TextInput, Heading } from "grommet";
import { useMainContext } from "../../hooks/useMainContext";
import { TwoCards } from "../../components/TwoCards";
import { QHeading } from "../../components/QHeading";
import { ScrollBox } from "../../components/ScrollBox";
import { Trash, Add } from "grommet-icons";
import { scrollTo, areUniqueOnKey, formatAddress } from "../../scripts";
import { validation } from "@zilliqa-js/util";
import { QParagraph } from "../../components/QParagraph";
import { BlockchainApi } from "../../helpers/BlockchainApi";
import { TransactionSubmitted } from "../../components/TransactionSubmitted";
import { useRouter } from "next/router";
import { AddressGet } from "../../components/AddressGet";
import { longNotification } from "../../components/Notifications/LongNotification";

type VoterToAdd = { address: string; credits: number };
const initVoterToAdd = {
    address: "",
    credits: 100,
};

function Register({ main }: { main: ReturnType<typeof useMainContext> }) {
    const curDecision = main.useContracts.contract.state;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [votersToAdd, setVotersToAdd] = useState<VoterToAdd[]>([]);
    const [tempVoterValid, setTempVoterValid] = useState(false);
    const [tempVoter, setTempVoter] = useState<VoterToAdd>(initVoterToAdd);
    const lastVoterToAdd = useRef(null);
    const [nextCard, setNextCard] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
                        addresses: votersToAdd.map((v) =>
                            formatAddress(v.address)
                        ),
                        creditsForAddresses: votersToAdd.map((v) => v.credits),
                    }
                );
                setSubmitted(true);
                main.jobsScheduler.checkContractCall({
                    id: tx.ID,
                    name: `Register Transaction: ${tx.ID}`,
                    status: "waiting",
                    contractAddress: curDecision._this_address,
                    type: "Register",
                });
                longNotification.showNotification(
                    "Waiting for transaction confirmation...",
                    "loading"
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
            validation.isAddress(formatAddress(v.address)) &&
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
        <TransactionSubmitted
            onClick={() => router.push("/")}
            txt=""
            buttonLabel="Go to preview"
        />
    ) : !nextCard ? (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Register voters"}</QHeading>
                    <QParagraph>
                        As an owner of a decision contract you can register
                        voters and the number of credits they can vote with.
                    </QParagraph>
                    <QParagraph>
                        If you call register multiple times only the last
                        registration will be valid!
                    </QParagraph>
                </Box>
            }
            Card2={
                <Box fill justify="start">
                    <Heading style={{ wordBreak: "break-word" }} level={"3"}>
                        {curDecision.name}
                    </Heading>
                    <QParagraph size="small">
                        {curDecision.description}
                    </QParagraph>
                    <QParagraph
                        size="small"
                        color={
                            main.useContracts.contract.info.timeState ==
                            "REGISTRATION_IN_PROGRESS"
                                ? "status-ok"
                                : "status-critical"
                        }
                    >
                        {main.useContracts.contract.info.timeState ==
                        "REGISTRATION_IN_PROGRESS"
                            ? `Registration ends in ${main.useContracts.contract.info.time.registrationEnds.blocks} blocks, ~${main.useContracts.contract.info.time.registrationEnds.minutes} minutes.`
                            : `Registration period ended.`}
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
                                main.useContracts.contract.info.timeState !=
                                "REGISTRATION_IN_PROGRESS"
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
                                        onChange={(e) =>
                                            onAddressChange(e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            onChangeCredits(e.target.value)
                                        }
                                    />
                                </Box>
                                <Box
                                    align="center"
                                    justify="center"
                                    height="xxsmall"
                                >
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
                                            onClick={() =>
                                                onDeleteVoter(v.address)
                                            }
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
    );
}

export default AddressGet(Register, "useContracts");
