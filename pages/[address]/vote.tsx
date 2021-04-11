import React from "react";
import { Text } from "grommet";
import { useMainContext } from "../../hooks/useMainContext";
import { Vote } from "../../components/Vote";

export default function VotePage() {
  const main = useMainContext();

  return main.useContracts.contract.isDefined && !main.useContracts.loading ? (
    <Vote
      decision={main.useContracts.contract.state}
      userAllowedCredits={
        main.useContracts.contract.info.userVoter != "NOT_REGISTERED"
          ? main.useContracts.contract.state.voter_balances[main.curAcc]
          : 0
      }
      main={main}
    />
  ) : (
    <Text>{"Loading..."}</Text>
  );
}
