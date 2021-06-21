import React, { useState, useRef } from "react";
import { Box, Button, Text, Keyboard, TextInput, Heading } from "grommet";
import { TwoCards } from "../../components/TwoCards";
import { QHeading } from "../../components/QHeading";
import { ScrollBox } from "../../components/ScrollBox";
import { Trash, Add } from "grommet-icons";
import { scrollTo, areUniqueOnKey, formatAddress } from "../../scripts";
import { validation } from "@zilliqa-js/util";
import { QParagraph } from "../../components/QParagraph";
import { TransactionSubmitted } from "../../components/TransactionSubmitted";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { blockchain } from "../../helpers/Blockchain";
import { Loader } from "../../components/Loader";
import { longNotification } from "../../components/Notifications";

type VoterToAdd = { address: string; credits: number };
const initVoterToAdd = {
    address: "",
    credits: 100,
};

function Register() {
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
                await blockchain().ownerRegister({
                    addresses: votersToAdd.map((v) => formatAddress(v.address)),
                    creditsForAddresses: votersToAdd.map((v) => v.credits),
                });
                setSubmitted(true);
            } catch (e) {
                console.error(e);
                longNotification.showNotification(
                    e.message ? e.message : "Error",
                    "error"
                );
            }
            setLoading(false);
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
    //i hate this algorand zilliqa interface does not work semantically
    return blockchain().loading || !blockchain().contractState ? (
        <Loader />
    ) : submitted ? (
        <TransactionSubmitted
            onClick={() => router.push("/")}
            txt=""
            buttonLabel="Go to preview"
        />
    ) : (
        !nextCard && (
            <TwoCards
                Card1={
                    <Box fill>
                        <QHeading>{"Register"}</QHeading>
                    </Box>
                }
                Card2={
                    <Box fill justify="start">
                        <Heading
                            style={{ wordBreak: "break-word" }}
                            level={"3"}
                        >
                            {blockchain().contractState.name}
                        </Heading>
                        <QParagraph size="small">
                            {blockchain().contractState.description}
                        </QParagraph>
                        <QParagraph
                            size="small"
                            color={
                                blockchain().contractInfo.timeState ==
                                "REGISTRATION_IN_PROGRESS"
                                    ? "status-ok"
                                    : "status-critical"
                            }
                        >
                            {blockchain().contractInfo.timeState ==
                            "REGISTRATION_IN_PROGRESS"
                                ? `Registration ends in ~${
                                      blockchain().contractInfo.time
                                          .registrationEnds.minutes
                                  } minutes.`
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
                                disabled={loading}
                                label={"Register me"}
                                onClick={() => onOwnerRegister()}
                            />
                        </Box>
                    </Box>
                }
            />
        )
    );
}

export default observer(Register);
