import React from "react";
import { Vote } from "../../components/Vote";
import { blockchain } from "../../helpers/Blockchain";
import { observer } from "mobx-react";
import { Loader } from "../../components/Loader";

function VotePage() {
    return blockchain.loading || !blockchain.contractState ? (
        <Loader />
    ) : (
        <Vote
            decision={blockchain.contractState}
            userAllowedCredits={
                blockchain.contractInfo.userVoter != "NOT_REGISTERED"
                    ? blockchain.contractState.voter_balances[
                          blockchain.currentAddress
                      ]
                    : 0
            }
        />
    );
}

export default observer(VotePage);
