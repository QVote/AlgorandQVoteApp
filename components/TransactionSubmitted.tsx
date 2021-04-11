import React from "react";
import { TwoCardsContainer } from "./TwoCards";
import { Box, Heading, Text, Button } from "grommet";
import { useResponsiveContext } from "../hooks/useResponsiveContext";

export function TransactionSubmitted(props: {
  txt:string;
  onClick: () => void;
  buttonLabel: string;
}) {
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
          <Text truncate>{props.txt}</Text>
        </Box>
        <Box align="center" justify="center" gap="medium">
          <Button label={props.buttonLabel} onClick={props.onClick} />
        </Box>
      </Box>
    </TwoCardsContainer>
  );
}
