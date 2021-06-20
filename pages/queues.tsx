import React from "react";
import { TwoCards } from "../components/TwoCards";
import { Box, Button, Text } from "grommet";
import { Add } from "grommet-icons";
import { QHeading } from "../components/QHeading";
import { QParagraph } from "../components/QParagraph";
import { ScrollBox } from "../components/ScrollBox";
import { Address } from "../components/Address";
import { useRouter } from "next/router";
import { onCopyText } from "../components/utill";
import { notArrPlz } from "../scripts";
import { blockchain } from "../helpers/Blockchain";

const PATHS = {
    queue: { path: "/q/[queueAddress]", as: "/q" },
};

export default function Queues() {
    const router = useRouter();

    /**
     * This is not ideal but this starts to fetch before going so that
     * loading is set on initial paint of the next page
     */
    function onClickAddress(a: string) {
        router.push(PATHS.queue.path, `${PATHS.queue.as}/${notArrPlz(a)}`);
    }

    return (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Recent queues"}</QHeading>
                    <QParagraph>
                        Here you can view your queues that hold references to
                        decisions.
                    </QParagraph>
                </Box>
            }
            Card2={
                <ScrollBox props={{ gap: "medium" }}>
                    <Button onClick={() => router.push("create-queue")}>
                        <Box
                            fill="horizontal"
                            height={{ min: "xxsmall" }}
                            background="dark-1"
                            round="xsmall"
                            align="center"
                            justify="center"
                            direction="row"
                            gap="small"
                        >
                            <Add />
                            <Text>{"Create"}</Text>
                        </Box>
                    </Button>
                    {blockchain.queues.value.arr.length == 0 && (
                        <QParagraph>You have no recent queues.</QParagraph>
                    )}
                    {blockchain.queues.value.arr.length > 0 &&
                        blockchain.queues.value.arr.map((a) => (
                            <Address
                                txt={a}
                                key={`contractqueue${a}`}
                                onClick={() => onClickAddress(a)}
                                onCopyTxt={() =>
                                    onCopyText(a, "Address Copied!")
                                }
                            />
                        ))}
                </ScrollBox>
            }
            NextButton={<Box fill />}
        />
    );
}
