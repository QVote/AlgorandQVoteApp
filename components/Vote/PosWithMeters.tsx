import React from "react";
import { Text, Box } from "grommet";
import { FormNextLink } from "grommet-icons";
import { getVotesFromCredits } from "./utill";
import Meters from "./Meters";

export function CreditToVote({ credits }: { credits: number }) {
  return (
    <Box direction="row">
      <Text>{`${Math.abs(credits)} credits`}</Text>
      <FormNextLink color="neutral-2" />
      <Text>{`${getVotesFromCredits(credits)} votes`}</Text>
    </Box>
  );
}

export function PosWithMeters({
  onClick,
  optionName,
  credits,
  maxCredits,
  noElevate,
}: {
  onClick?: () => void;
  optionName: string;
  credits: number;
  maxCredits: number;
  noElevate?: boolean;
}) {
  return (
    <Box
      background="white"
      elevation={noElevate ? null : "small"}
      round="xsmall"
      height={{ min: "150px" }}
      pad="medium"
      gap="xsmall"
      onClick={onClick ? onClick : null}
      align="center"
      overflow="hidden"
    >
      <Text>{optionName} </Text>
      <CreditToVote credits={credits} />
      <Meters credits={credits} maxCredits={maxCredits} onlyPos={false} />
    </Box>
  );
}
