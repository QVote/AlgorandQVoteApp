import React from "react";
import { TwoCardsContainer } from "./TwoCards";
import { Box, Heading, Text, Button } from "grommet";
import { useResponsiveContext } from "../hooks/useResponsiveContext";

export function TransactionSubmitted() {
  const responsiveContext = useResponsiveContext();
  return (
    <TwoCardsContainer>
      <Box fill justify="center" align="center">
        <Heading
          textAlign="center"
          level={responsiveContext == "small" ? "2" : "1"}
        >
          {"Transaction submitted!"}
        </Heading>
        <Box height="20%" justify="center" align="center">
          <Text truncate>{"Create another decision?"}</Text>
        </Box>
        <Box align="center" justify="center" gap="medium">
          <Button label={"Go to create"} onClick={() => {}} />
        </Box>
      </Box>
    </TwoCardsContainer>
  );
}
