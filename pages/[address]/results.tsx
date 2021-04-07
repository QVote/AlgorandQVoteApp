import React from "react";
import { Box, Heading, Text } from "grommet";
import { QParagraph } from "../../components/QParagraph";
import { QHeading } from "../../components/QHeading";
import { TwoCards } from "../../components/TwoCards";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { useMainContext } from "../../hooks/useMainContext";
import { BarChart } from "../../components/BarChart";

export default function ResultsPage() {
  const main = useMainContext();

  return main.useContracts.contract.info.userIsOwner ? (
    <Results
      {...{
        curDecision: main.useContracts.contract.state,
      }}
    />
  ) : (
    <Text>Choose a decision contract you own to register voters.</Text>
  );
}

function Results({ curDecision }) {
  const responsiveContext = useResponsiveContext();

  return (
    <Box fill align="center" justify="center" pad="large">
      <TwoCards
        Card1={
          <Box fill>
            <QHeading>{"Results"}</QHeading>
            <QParagraph>
              Here you can view the current state of the contract results.
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
    </Box>
  );
}
