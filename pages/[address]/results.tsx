import React from "react";
import { Box, Heading } from "grommet";
import { QParagraph } from "../../components/QParagraph";
import { QHeading } from "../../components/QHeading";
import { TwoCards } from "../../components/TwoCards";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { BarChart } from "../../components/BarChart";
import { observer } from "mobx-react";
import { zilliqaApi } from "../../helpers/Zilliqa";
import { Loader } from "../../components/Loader";

function Results() {
    const responsiveContext = useResponsiveContext();

    return zilliqaApi.loading || !zilliqaApi.contractState ? (
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
                        {zilliqaApi.contractState.name}
                    </Heading>
                    <QParagraph>
                        {zilliqaApi.contractState.description}
                    </QParagraph>
                </Box>
            }
            Card2={<BarChart decision={zilliqaApi.contractState} />}
            NextButton={<Box fill></Box>}
        />
    );
}

export default observer(Results);
