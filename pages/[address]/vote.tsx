import React from "react";
import { Text } from "grommet";
import { useMainContext } from "../../hooks/useMainContext";
import { Vote } from "../../components/Vote";

export default function VotePage() {
  const main = useMainContext();

  return main.contractAddressses.currentContract.owner != "" ? (
    <Vote
      decision={main.contractAddressses.currentContract}
      userAllowedCredits={
        main.contractAddressses.currentContract.voter_balances &&
        main.curAcc &&
        parseInt(
          main.contractAddressses.currentContract.voter_balances[main.curAcc]
            ? main.contractAddressses.currentContract.voter_balances[
                main.curAcc
              ]
            : "0"
        )
      }
      change={main.contractAddressses.change}
      main={main}
    />
  ) : (
    <Text>{"no decision"}</Text>
  );
}
