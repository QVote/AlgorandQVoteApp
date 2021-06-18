import { useState } from "react";
import { Box, Button } from "grommet";
import { useMainContext } from "../hooks/useMainContext";
import { TwoCards } from "../components/TwoCards";
import { QHeading } from "../components/QHeading";
import { BlockchainApi } from "../helpers/BlockchainApi";
import { TransactionSubmitted } from "../components/TransactionSubmitted";
import { QParagraph } from "../components/QParagraph";
import { longNotification } from "../components/MainFrame/LongNotification";

export default function DecisionCreator() {
    const main = useMainContext();
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
                const blockchain = new BlockchainApi({
                    wallet: "zilPay",
                    protocol: main.blockchainInfo.protocol,
                });
                const [tx, contractInstance] = await blockchain.deployQueue(
                    "20",
                    main.curAcc
                );
                setSubmitted(true);
                main.jobsScheduler.checkDeployQueueCall({
                    id: tx.ID,
                    name: `Deploy Queue Transaction: ${tx.ID}`,
                    status: "waiting",
                    contractAddress: contractInstance.address,
                    type: "DeployQueue",
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
