import React from "react";
import { Text } from "grommet";
import { useMainContext } from "../hooks/useMainContext";
import { Vote } from "../components/Vote";

export default function VotePage() {
  const main = useMainContext();

  return main.contractAddressses.currentContract.owner != "" ? (
    <Vote
      decision={main.contractAddressses.currentContract}
      userAllowedCredits={100}
    />
  ) : (
    <Text>{"no decision"}</Text>
  );
}
