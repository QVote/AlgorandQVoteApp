import React from "react";
import { Box, Text } from "grommet";
import { QVoteLogo } from "./QVoteLogo";

export function Loader() {
  const str = "20px";
  const size = { min: str, max: str };
  return (
    <Box
      fill
      align="center"
      justify="center"
      gap="medium"
      animation={[{ type: "fadeIn", duration: 300 }]}
      background={"qvBg"}
    >
      <QVoteLogo color={"dark-1"} size={"10vh"} />

      <Box margin={{ bottom: "0.2vh" }}>
        <Text
          color={"dark-1"}
          size={"xlarge"}
          //@ts-ignore
          style={{ fontWeight: "500" }}
        >
          QVote
        </Text>
      </Box>
      <Box direction="row" gap="medium">
        {[1, 2, 3, 4].map((i) => {
          return (
            <Box
              key={`box${i}`}
              height={size}
              width={size}
              round="xxsmall"
              background="dark-4"
              animation={[
                //@ts-ignore
                { type: "rotateRight", duration: i * 1000 },
                { type: "fadeIn", duration: i * 2000 },
              ]}
            />
          );
        })}
      </Box>
    </Box>
  );
}
