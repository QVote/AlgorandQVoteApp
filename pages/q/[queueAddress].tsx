import React from "react";
import { TwoCards } from "../../components/TwoCards";
import { Box, Button } from "grommet";
import { QHeading } from "../../components/QHeading";
import { QParagraph } from "../../components/QParagraph";
import { Address } from "../../components/Address";
import { ScrollBox } from "../../components/ScrollBox";
import { onGoToAs, onCopyText } from "../../components/utill";
import { useRouter } from "next/router";
import { ShareOption } from "grommet-icons";
import { zilliqaApi } from "../../helpers/Zilliqa";
import { Loader } from "../../components/Loader";
import { observer } from "mobx-react";

const PATHS = {
    preview: { path: "/[address]/preview", as: "/preview" },
};

export default observer(() => {
    const router = useRouter();
    function onClickAddress(a: string) {
        onGoToAs(PATHS.preview.path, PATHS.preview.as, router, a);
    }
    return zilliqaApi.loading || !zilliqaApi.queueState ? (
        <Loader />
    ) : (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Queue"}</QHeading>
                    <QParagraph>{`Here are the contents of the queue with the address:`}</QParagraph>
                    <Address txt={zilliqaApi.queueState._this_address} />
                    <Box justify="center" align="start">
                        <Button
                            label="Share"
                            icon={<ShareOption color="brand" />}
                            onClick={() =>
                                onCopyText(window.location.href, "URL copied!")
                            }
                        />
                    </Box>
                </Box>
            }
            Card2={
                <ScrollBox props={{ gap: "medium" }}>
                    {zilliqaApi.queueState.queue.length == 0 && (
                        <QParagraph>
                            There are no decisions in this queue.
                        </QParagraph>
                    )}
                    {zilliqaApi.queueState.queue.length > 0 &&
                        zilliqaApi.queueState.queue.map((a) => (
                            <Address
                                txt={a}
                                key={`contractqueueDecision${a}`}
                                onClick={() => onClickAddress(a)}
                                onCopyTxt={() =>
                                    onCopyText(a, "Address Copied!")
                                }
                            />
                        ))}
                </ScrollBox>
            }
            NextButton={<Box fill></Box>}
        />
    );
});
