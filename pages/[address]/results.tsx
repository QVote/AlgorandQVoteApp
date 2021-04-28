import React from "react";
import { Box, Heading, Text } from "grommet";
import { QParagraph } from "../../components/QParagraph";
import { QHeading } from "../../components/QHeading";
import { TwoCards } from "../../components/TwoCards";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { useMainContext } from "../../hooks/useMainContext";
import { BarChart } from "../../components/BarChart";
import { Loader } from "../../components/Loader";
import { AddressGet } from "../../components/AddressGet";

function Results({ main }: { main: ReturnType<typeof useMainContext> }) {
    const responsiveContext = useResponsiveContext();
    const curDecision = main.useContracts.contract.state;

    return (
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
                        {curDecision.name}
                    </Heading>
                    <QParagraph>{curDecision.description}</QParagraph>
                </Box>
            }
            Card2={<BarChart decision={curDecision} />}
            NextButton={<Box fill></Box>}
        />
    );
}

export default AddressGet(Results, "useContracts");
