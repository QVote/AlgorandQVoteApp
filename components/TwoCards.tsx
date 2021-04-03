import React, { useContext } from "react";
import { Box, ResponsiveContext } from "grommet";
import { ScrollBox } from "./ScrollBox";

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
    <Box fill background="white" round="xsmall" overflow="hidden">
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
  );
}
