import React from "react";
import { Box, Text } from "grommet";

export function Notice({ txt }: { txt: string }) {
  return (
    <Box
      height={{ min: "xxsmall" }}
      justify="center"
      pad={{ left: "xsmall", right: "xsmall" }}
    >
      <Text weight={"bold"} truncate size={"xsmall"} color={"dark-3"}>
        {txt}
      </Text>
    </Box>
  );
}
