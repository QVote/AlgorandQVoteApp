import React, { useState } from "react";
import { Box, Heading, Button } from "grommet";
import { ShareOption } from "grommet-icons";
import { QParagraph } from "../../components/QParagraph";
import { QHeading } from "../../components/QHeading";
import { TwoCards } from "../../components/TwoCards";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { Address } from "../../components/Address";
import { onCopyText } from "../../components/utill";
import { useRouter } from "next/router";
import { onGoToAs } from "../../components/utill";
import { MenuModal } from "../../components/MainFrame/MenuModal";
import { ScrollBox } from "../../components/ScrollBox";
import { zilliqaApi } from "../../helpers/Zilliqa";
import { Loader } from "../../components/Loader";
import { observer } from "mobx-react";

const PATHS = {
    vote: { path: "/[address]/vote", as: "/vote" },
    register: { path: "/[address]/register", as: "/register" },
    results: { path: "/[address]/results", as: "/results" },
};

function Preview() {
    const responsiveContext = useResponsiveContext();
    const router = useRouter();
    const { address } = router.query;
    const [loading, setLoading] = useState(false);
    const [showQueues, setShowQueues] = useState(false);

    async function onAddToQueue(queueAddress: string) {
        if (!loading) {
            try {
                setLoading(true);
                await zilliqaApi.onlyOwnerPushQueue(queueAddress);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
            setShowQueues(false);
        }
    }

    return zilliqaApi.loading || !zilliqaApi.contractState ? (
        <Loader />
    ) : (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Decision"}</QHeading>
                    <QParagraph>{`Here is the preview of the decision with the address:`}</QParagraph>
                    <Address
                        txt={zilliqaApi.contractState._this_address}
                        onCopyTxt={() =>
                            onCopyText(
                                zilliqaApi.contractState._this_address,
                                "Address Copied!"
                            )
                        }
                    />
                    <Box justify="center" align="start">
                        <Button
                            label="Share"
                            icon={<ShareOption color="brand" />}
                            onClick={() =>
                                onCopyText(window.location.href, "URL copied!")
                            }
                        />
                    </Box>
                    <QParagraph
                        size="small"
                        color={
                            zilliqaApi.isOwnerOfCurrentContract
                                ? "status-ok"
                                : "status-critical"
                        }
                    >
                        {zilliqaApi.isOwnerOfCurrentContract
                            ? "You are the owner of this decision."
                            : `You are not the owner of this decision.`}
                    </QParagraph>
                    {zilliqaApi.contractInfo.timeState ==
                    "REGISTRATION_IN_PROGRESS" ? (
                        <QParagraph
                            size="small"
                            color={
                                zilliqaApi.contractInfo.timeState ==
                                "REGISTRATION_IN_PROGRESS"
                                    ? "status-ok"
                                    : "status-critical"
                            }
                        >
                            {zilliqaApi.contractInfo.timeState ==
                            "REGISTRATION_IN_PROGRESS"
                                ? `Registration ends in ${zilliqaApi.contractInfo.time.registrationEnds.blocks} blocks, ~${zilliqaApi.contractInfo.time.registrationEnds.minutes} minutes.`
                                : `Registration period ended.`}
                        </QParagraph>
                    ) : (
                        <QParagraph
                            size="small"
                            color={
                                zilliqaApi.contractInfo.timeState ==
                                "VOTING_IN_PROGRESS"
                                    ? "status-ok"
                                    : "status-critical"
                            }
                        >
                            {zilliqaApi.contractInfo.timeState ==
                            "VOTING_IN_PROGRESS"
                                ? `Voting ends in ${zilliqaApi.contractInfo.time.voteEnds.blocks} blocks, ~${zilliqaApi.contractInfo.time.voteEnds.minutes} minutes.`
                                : "Voting period ended."}
                        </QParagraph>
                    )}
                    {zilliqaApi.contractInfo.userVoter == "NOT_REGISTERED" &&
                        zilliqaApi.contractInfo.timeState ==
                            "VOTING_IN_PROGRESS" && (
                            <QParagraph size="small" color={"status-critical"}>
                                {"You were not registered to vote."}
                            </QParagraph>
                        )}
                </Box>
            }
            Card2={
                <Box fill>
                    <Heading
                        style={{ wordBreak: "break-word" }}
                        level={responsiveContext == "small" ? "3" : "2"}
                    >
                        {zilliqaApi.contractState.name}
                    </Heading>
                    <QParagraph>
                        {zilliqaApi.contractState.description}
                    </QParagraph>
                    <QParagraph>{`Token: ${zilliqaApi.contractState.token_id}, Credit to token ratio: ${zilliqaApi.contractState.credit_to_token_ratio}`}</QParagraph>
                    <Box
                        fill="horizontal"
                        align="start"
                        justify="start"
                        gap="small"
                    >
                        {zilliqaApi.queues.value.arr.length > 0 && (
                            <Box align="center">
                                <Button
                                    label={"Add to Queue"}
                                    onClick={() => setShowQueues(true)}
                                />
                                {showQueues && (
                                    <MenuModal
                                        modalHeight="38vh"
                                        modalWidth="35vw"
                                        gap="small"
                                    >
                                        <ScrollBox props={{ gap: "medium" }}>
                                            {zilliqaApi.queues.value.arr.map(
                                                (a) => (
                                                    <Address
                                                        txt={a}
                                                        key={`queue to choose${a}`}
                                                        onClick={() =>
                                                            onAddToQueue(a)
                                                        }
                                                    />
                                                )
                                            )}
                                        </ScrollBox>
                                        <Button
                                            label={"Close"}
                                            onClick={() => setShowQueues(false)}
                                        />
                                    </MenuModal>
                                )}
                            </Box>
                        )}
                        {zilliqaApi.isOwnerOfCurrentContract &&
                            zilliqaApi.contractInfo.timeState ==
                                "REGISTRATION_IN_PROGRESS" && (
                                <Box align="center">
                                    <Button
                                        label={"Go to Register"}
                                        onClick={() =>
                                            onGoToAs(
                                                PATHS.register.path,
                                                PATHS.register.as,
                                                router,
                                                address
                                            )
                                        }
                                    />
                                </Box>
                            )}
                        {zilliqaApi.contractInfo.timeState ==
                            "VOTING_IN_PROGRESS" &&
                            zilliqaApi.contractInfo.userVoter ==
                                "REGISTERED_NOT_VOTED" && (
                                <Box align="center">
                                    <Button
                                        label={"Go to Vote"}
                                        onClick={() =>
                                            onGoToAs(
                                                PATHS.vote.path,
                                                PATHS.vote.as,
                                                router,
                                                address
                                            )
                                        }
                                    />
                                </Box>
                            )}
                        {zilliqaApi.contractInfo.timeState ==
                            "VOTING_ENDED" && (
                            <Box align="center">
                                <Button
                                    label={"Go to Results"}
                                    onClick={() =>
                                        onGoToAs(
                                            PATHS.results.path,
                                            PATHS.results.as,
                                            router,
                                            address
                                        )
                                    }
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            }
            NextButton={<Box fill></Box>}
        />
    );
}

export default observer(Preview);
