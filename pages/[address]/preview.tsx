import React from "react";
import { Box, Heading, Text, Button } from "grommet";
import { QParagraph } from "../../components/QParagraph";
import { QHeading } from "../../components/QHeading";
import { TwoCards } from "../../components/TwoCards";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { useMainContext } from "../../hooks/useMainContext";
import { QVote } from "../../types";
import { Address } from "../../components/Address";
import { onCopyText } from "../../components/utill";
import { useRouter } from "next/router";
import { onGoToAs } from "../../components/utill";

const PATHS = {
  vote: { path: "/[address]/vote", as: "/vote" },
  register: { path: "/[address]/register", as: "/register" },
  results: { path: "/[address]/results", as: "/results" },
};

export default function PreviewPage() {
  const main = useMainContext();

  return main.useContracts.contract.isDefined ? (
    <Preview
      {...{
        main,
        curDecision: main.useContracts.contract.state,
      }}
    />
  ) : (
    <Text>Loading.</Text>
  );
}

function Preview({
  main,
  curDecision,
}: {
  curDecision: QVote.ContractDecisionProcessed;
  main: ReturnType<typeof useMainContext>;
}) {
  const responsiveContext = useResponsiveContext();
  const contract = main.useContracts.contract;
  const router = useRouter();
  const { address } = router.query;

  return (
    <TwoCards
      Card1={
        <Box fill>
          <QHeading>{"Preview"}</QHeading>
          <QParagraph>{`Here is the preview of the decision with the address:`}</QParagraph>
          <Address
            txt={contract.state._this_address}
            onCopyTxt={() =>
              onCopyText(contract.state._this_address, "Address Copied!", main)
            }
          />
          <QParagraph
            size="small"
            color={
              curDecision.owner == main.curAcc ? "status-ok" : "status-critical"
            }
          >
            {curDecision.owner == main.curAcc
              ? "You are the owner of this decision."
              : `You are not the owner of this decision!`}
          </QParagraph>
          {contract.info.timeState == "REGISTRATION_IN_PROGRESS" ? (
            <QParagraph
              size="small"
              color={
                contract.info.timeState == "REGISTRATION_IN_PROGRESS"
                  ? "status-ok"
                  : "status-critical"
              }
            >
              {contract.info.timeState == "REGISTRATION_IN_PROGRESS"
                ? `Registration ends in ${contract.info.time.registrationEnds.blocks} blocks, ~${contract.info.time.registrationEnds.minutes} minutes.`
                : `Registration period ended.`}
            </QParagraph>
          ) : (
            <QParagraph
              size="small"
              color={
                contract.info.timeState == "VOTING_IN_PROGRESS"
                  ? "status-ok"
                  : "status-critical"
              }
            >
              {contract.info.timeState == "VOTING_IN_PROGRESS"
                ? `Voting ends in ${contract.info.time.voteEnds.blocks} blocks, ~${contract.info.time.voteEnds.minutes} minutes.`
                : "Voting period ended."}
            </QParagraph>
          )}
          {contract.info.userVoter == "NOT_REGISTERED" &&
            contract.info.timeState == "VOTING_IN_PROGRESS" && (
              <QParagraph size="small" color={"status-critical"}>
                {"You were not registered to vote."}
              </QParagraph>
            )}
        </Box>
      }
      Card2={
        <Box fill>
          <Heading
            style={{ wordBreak: "break-word" }}
            level={responsiveContext == "small" ? "3" : "2"}
          >
            {curDecision.name}
          </Heading>
          <QParagraph>{curDecision.description}</QParagraph>
          <Box fill="horizontal" direction="row" align="center" justify="start">
            {contract.info.userIsOwner &&
              contract.info.timeState == "REGISTRATION_IN_PROGRESS" && (
                <Box align="center">
                  <Button
                    label={"Go to Register"}
                    onClick={() =>
                      onGoToAs(
                        PATHS.register.path,
                        PATHS.register.as,
                        router,
                        address
                      )
                    }
                  />
                </Box>
              )}
            {contract.info.timeState == "VOTING_IN_PROGRESS" &&
              contract.info.userVoter == "REGISTERED_NOT_VOTED" && (
                <Box align="center">
                  <Button
                    label={"Go to Vote"}
                    onClick={() =>
                      onGoToAs(PATHS.vote.path, PATHS.vote.as, router, address)
                    }
                  />
                </Box>
              )}
            {contract.info.timeState == "VOTING_ENDED" && (
              <Box align="center">
                <Button
                  label={"Go to Results"}
                  onClick={() =>
                    onGoToAs(
                      PATHS.results.path,
                      PATHS.results.as,
                      router,
                      address
                    )
                  }
                />
              </Box>
            )}
          </Box>
        </Box>
      }
      NextButton={<Box fill></Box>}
    />
  );
}
