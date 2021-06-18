import React from "react";
import { useMainContext } from "../../hooks/useMainContext";
import { TwoCards } from "../../components/TwoCards";
import { Box, Button } from "grommet";
import { QHeading } from "../../components/QHeading";
import { QParagraph } from "../../components/QParagraph";
import { Address } from "../../components/Address";
import { ScrollBox } from "../../components/ScrollBox";
import { onGoToAs, onCopyText } from "../../components/utill";
import { useRouter } from "next/router";
import { ShareOption } from "grommet-icons";
import { AddressGet } from "../../components/AddressGet";

const PATHS = {
    preview: { path: "/[address]/preview", as: "/preview" },
};

function Preview({ main }: { main: ReturnType<typeof useMainContext> }) {
    const curQueue = main.useQueues.contract.state;
    const contract = main.useQueues.contract.state;
    const router = useRouter();

    /**
     * This is not ideal but this starts to fetch before going so that
     * loading is set on initial paint of the next page
     */
    function onClickAddress(a: string) {
        main.useContracts.makeFirst(a);
        onGoToAs(PATHS.preview.path, PATHS.preview.as, router, a);
    }

    return (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Queue"}</QHeading>
                    <QParagraph>{`Here are the contents of the queue with the address:`}</QParagraph>
                    <Address txt={curQueue._this_address} />
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
                    {contract.queue.length == 0 && (
                        <QParagraph>
                            There are no decisions in this queue.
                        </QParagraph>
                    )}
                    {contract.queue.length > 0 &&
                        contract.queue.map((a) => (
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
}

export default AddressGet(Preview, "useQueues");
