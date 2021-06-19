import React from "react";
import { Vote } from "../../components/Vote";
import { zilliqaApi } from "../../helpers/Zilliqa";
import { observer } from "mobx-react";
import { Loader } from "../../components/Loader";

function VotePage() {
    return zilliqaApi.loading || !zilliqaApi.contractState ? (
        <Loader />
    ) : (
        <Vote
            decision={zilliqaApi.contractState}
            userAllowedCredits={
                zilliqaApi.contractInfo.userVoter != "NOT_REGISTERED"
                    ? zilliqaApi.contractState.voter_balances[
                          zilliqaApi.currentAddress
                      ]
                    : 0
            }
        />
    );
}

export default observer(VotePage);
