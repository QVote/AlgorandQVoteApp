import { Box, Heading, Button, ResponsiveContext } from "grommet";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { intPls } from "../../scripts";
import { createSlidersState } from "./utill";
import { PosWithMeters } from "./PosWithMeters";
import SliderModal from "./SliderModal";
import Meters from "./Meters";
import { onSliderConfirm } from "./utill";
import { QVote } from "../../types";
import { ScrollBox } from "../ScrollBox";
import { QParagraph } from "../QParagraph";
import { QHeading } from "../QHeading";
import { TwoCards } from "../TwoCards";
import { TransactionSubmitted } from "../TransactionSubmitted";
import { useRouter } from "next/router";
import { blockchain } from "../../helpers/Blockchain";

const sliderInit = {
    max: 0,
    min: 0,
    cur: 0,
    name: "",
};

export function Vote({
    decision,
    userAllowedCredits,
}: {
    decision: QVote.ContractDecisionProcessed;
    userAllowedCredits: number;
}) {
    const router = useRouter();
    const responsiveContext = useContext(ResponsiveContext);
    const [loading, setLoading] = useState(false);
    const [curCredDist, setCurCredDist] = useState(
        createSlidersState(decision, userAllowedCredits)
    );
    const [showSlider, setShowSlider] = useState(false);
    const [sliderState, setSliderState] = useState<QVote.SliderDs>(sliderInit);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setCurCredDist(createSlidersState(decision, userAllowedCredits));
    }, [decision]);

    //update all except one option
    function updateByExcept(
        ds: QVote.CreditDist,
        curName: string,
        diff: number
    ) {
        ds.options = ds.options.map((o) => {
            if (curName != o.name) {
                return {
                    ...o,
                    max: o.max - diff,
                };
            } else {
                return o;
            }
        });
    }

    //return number of credits used
    function getUsed(ds: QVote.CreditDist): number {
        return ds.options.reduce((prev, o) => {
            return prev + Math.abs(intPls(o.cur));
        }, 0);
    }

    const setSlider: onSliderConfirm = (name: string, newVal: number) => {
        const used = getUsed(curCredDist);
        const curIndex = curCredDist.options.findIndex((o) => o.name == name);
        const prevVal = Math.abs(intPls(curCredDist.options[curIndex].cur));
        const diff = Math.abs(newVal) - prevVal;
        updateByExcept(curCredDist, name, diff);
        curCredDist.options[curIndex].cur = newVal;
        curCredDist.creditsRemaining = userAllowedCredits - (diff + used);
        setCurCredDist(curCredDist);
        setShowSlider(false);
    };

    function showGivenSlider(name: string): void {
        const curIndex = curCredDist.options.findIndex((o) => o.name == name);
        if (
            curCredDist.creditsRemaining === 0 &&
            curCredDist.options[curIndex].cur === 0
        ) {
            return;
        }
        setSliderState(curCredDist.options[curIndex]);
        setShowSlider(true);
    }

    const canSubmit = () =>
        !loading &&
        curCredDist.creditsRemaining === 0 &&
        getUsed(curCredDist) !== 0;

    async function onVoteSubmit() {
        if (canSubmit()) {
            setLoading(true);
            try {
                await blockchain().vote({
                    creditsToOption: curCredDist.options.map((o) => `${o.cur}`),
                });
                setSubmitted(true);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
    }

    return submitted ? (
        <TransactionSubmitted
            onClick={() => router.push("/")}
            txt=""
            buttonLabel="Go to preview"
        />
    ) : (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Vote"}</QHeading>
                    <Heading
                        style={{ wordBreak: "break-word" }}
                        level={responsiveContext == "small" ? "3" : "2"}
                    >
                        {decision.name}
                    </Heading>
                    <QParagraph>{decision.description}</QParagraph>
                    <QParagraph
                        size="small"
                        color={
                            blockchain().contractInfo.timeState ==
                            "REGISTRATION_IN_PROGRESS"
                                ? "status-critical"
                                : blockchain().contractInfo.timeState ==
                                  "VOTING_IN_PROGRESS"
                                ? "status-ok"
                                : "status-critical"
                        }
                    >
                        {blockchain().contractInfo.timeState ==
                        "REGISTRATION_IN_PROGRESS"
                            ? `Registration period for this hasn't ended yet, ends in ~${
                                  blockchain().contractInfo.time
                                      .registrationEnds.minutes
                              } minutes.`
                            : blockchain().contractInfo.timeState ==
                              "VOTING_IN_PROGRESS"
                            ? `Voting ends in ~${
                                  blockchain().contractInfo.time.voteEnds
                                      .minutes
                              } minutes.`
                            : "The voting period of this decision has ended."}
                    </QParagraph>
                </Box>
            }
            Card2={
                <Box fill={true} gap="small">
                    <CreditsLeft
                        left={curCredDist.creditsRemaining}
                        max={userAllowedCredits}
                    />
                    <ScrollBox props={{ gap: "small", pad: "medium" }}>
                        {curCredDist.options.map((o, index) => {
                            return (
                                <PosWithMeters
                                    key={"poswithmeters" + o.name}
                                    {...{
                                        onClick: () => showGivenSlider(o.name),
                                        credits: intPls(
                                            curCredDist.options[index].cur
                                        ),
                                        maxCredits: userAllowedCredits,
                                        optionName: o.name,
                                        key: `posWithMeters ${o.name}`,
                                    }}
                                />
                            );
                        })}
                    </ScrollBox>
                    {showSlider && (
                        <SliderModal
                            {...{
                                sliderState,
                                setSlider,
                                onClickOutside: () => setShowSlider(false),
                                globalMax: userAllowedCredits,
                            }}
                        />
                    )}
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
                            disabled={!canSubmit()}
                            onClick={() => onVoteSubmit()}
                            label={"Submit"}
                        />
                    </Box>
                </Box>
            }
        />
    );
}

function CreditsLeft({ left, max }: { left: number; max: number }) {
    return (
        <Box
            round="xsmall"
            height={{ min: "100px", max: "100px" }}
            align="center"
            justify="end"
            background="white"
            margin={{ left: "medium", right: "medium" }}
            pad={{ horizontal: "large" }}
        >
            <Heading
                responsive={false}
                textAlign="center"
                level="4"
                size="small"
            >{`Credits Left: ${left}`}</Heading>
            <Meters credits={left} maxCredits={max} onlyPos />
        </Box>
    );
}
