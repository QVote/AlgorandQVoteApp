import React, { useContext } from "react";
import { Box, ResponsiveContext, BoxExtendedProps } from "grommet";
import { ScrollBox } from "./ScrollBox";

export function TwoCardsContainerWrapper({
  children,
}: {
  children: JSX.Element;
}) {
  return (
    <Box fill align="center" justify="center" pad="large">
      {children}
    </Box>
  );
}

export function TwoCardsContainer({
  children,
  ...rest
}: {
  children: JSX.Element;
  rest?: BoxExtendedProps;
}) {
  return (
    <TwoCardsContainerWrapper>
      <Box fill background="white" round="xsmall" overflow="hidden" {...rest}>
        {children}
      </Box>
    </TwoCardsContainerWrapper>
  );
}

export function TwoCards({
  Card1,
  Card2,
  NextButton,
}: {
  Card1: JSX.Element;
  Card2: JSX.Element;
  NextButton: JSX.Element;
}) {
  const responsiveContext = useContext(ResponsiveContext);
  return (
    <TwoCardsContainer>
      <Box fill>
        <Box
          fill
          pad="medium"
          direction={responsiveContext == "small" ? "column" : "row"}
        >
          <ScrollBox props={{ pad: "medium" }}>{Card1}</ScrollBox>
          <ScrollBox
            props={{
              background: "light-1",
              pad: "medium",
              round: "xsmall",
            }}
          >
            {Card2}
          </ScrollBox>
        </Box>
        <Box height={{ min: "60px" }}>{NextButton}</Box>
      </Box>
    </TwoCardsContainer>
  );
}
