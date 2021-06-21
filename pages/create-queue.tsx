import { useState } from "react";
import { Box, Button } from "grommet";
import { TwoCards } from "../components/TwoCards";
import { QHeading } from "../components/QHeading";
import { TransactionSubmitted } from "../components/TransactionSubmitted";
import { QParagraph } from "../components/QParagraph";
import { blockchain } from "../helpers/Blockchain";

export default function DecisionCreator() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    function reset() {
        setLoading(false);
        setSubmitted(false);
    }

    async function onDeploy() {
        if (!loading) {
            try {
                setLoading(true);
                await blockchain().deployQueue("20");
                setSubmitted(true);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
    }

    return submitted ? (
        <TransactionSubmitted
            onClick={() => reset()}
            txt="Create another queue?"
            buttonLabel="Go to create"
        />
    ) : (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Deploy Queue"}</QHeading>
                    <QParagraph>
                        {
                            "Here you can deploy a queue that will hold up to 20 recent decisions that you can share with others!"
                        }
                    </QParagraph>
                    <QParagraph>
                        {
                            "As an owner of the queue you will be able to add decisions to the queue."
                        }
                    </QParagraph>
                </Box>
            }
            Card2={
                <Box align="center" justify="center" fill pad="small">
                    <Button
                        disabled={loading}
                        label={"Deploy Queue"}
                        onClick={() => onDeploy()}
                    />
                </Box>
            }
            NextButton={<Box fill />}
        />
    );
}
