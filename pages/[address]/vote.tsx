import React from "react";
import { useMainContext } from "../../hooks/useMainContext";
import { Vote } from "../../components/Vote";
import { AddressGet } from "../../components/AddressGet";

function VotePage({ main }: { main: ReturnType<typeof useMainContext> }) {
    return (
        <Vote
            decision={main.useContracts.contract.state}
            userAllowedCredits={
                main.useContracts.contract.info.userVoter != "NOT_REGISTERED"
                    ? main.useContracts.contract.state.voter_balances[
                          main.curAcc
                      ]
                    : 0
            }
            main={main}
        />
    );
}

export default AddressGet(VotePage);
