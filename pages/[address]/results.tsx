import React from "react";
import { Box, Heading } from "grommet";
import { QParagraph } from "../../components/QParagraph";
import { QHeading } from "../../components/QHeading";
import { TwoCards } from "../../components/TwoCards";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { BarChart } from "../../components/BarChart";
import { observer } from "mobx-react";
import { blockchain } from "../../helpers/Blockchain";
import { Loader } from "../../components/Loader";

function Results() {
    const responsiveContext = useResponsiveContext();

    return blockchain.loading || !blockchain.contractState ? (
        <Loader />
    ) : (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Results"}</QHeading>
                    <QParagraph>
                        Here you can view the current state of the contract
                        results.
                    </QParagraph>
                    <Heading
                        style={{ wordBreak: "break-word" }}
                        level={responsiveContext == "small" ? "3" : "2"}
                    >
                        {blockchain.contractState.name}
                    </Heading>
                    <QParagraph>
                        {blockchain.contractState.description}
                    </QParagraph>
                </Box>
            }
            Card2={<BarChart decision={blockchain.contractState} />}
            NextButton={<Box fill></Box>}
        />
    );
}

export default observer(Results);
