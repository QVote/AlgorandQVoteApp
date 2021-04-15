import React, { useState } from "react";
import { Box, Heading, Text, Button } from "grommet";
import { ShareOption } from "grommet-icons";
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
import { Loader } from "../../components/Loader";
import { BlockchainApi } from "../../helpers/BlockchainApi";
import { MenuModal } from "../../components/MainFrame/MenuModal";
import { ScrollBox } from "../../components/ScrollBox";
import { formatAddress } from "../../scripts";

const PATHS = {
  vote: { path: "/[address]/vote", as: "/vote" },
  register: { path: "/[address]/register", as: "/register" },
  results: { path: "/[address]/results", as: "/results" },
};

export default function PreviewPage() {
  const main = useMainContext();

  return main.useContracts.contract.isDefined && !main.useContracts.loading ? (
    <Preview
      {...{
        main,
        curDecision: main.useContracts.contract.state,
      }}
    />
  ) : (
    <Loader />
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
  const [loading, setLoading] = useState(false);
  const [showQueues, setShowQueues] = useState(false);

  function addressIn(a: string, arr: string[]) {
    return arr.map((adr) => formatAddress(adr)).includes(formatAddress(a));
  }

  async function onAddToQueue(queueAddress: string) {
    if (!loading) {
      try {
        setLoading(true);
        const blockchainApi = new BlockchainApi({
          wallet: "zilPay",
          protocol: main.blockchainInfo.protocol,
        });
        const state = await blockchainApi.getQueueState(queueAddress);
        if (addressIn(curDecision._this_address, state.queue)) {
          main.longNotification.current.setError();
          main.longNotification.current.onShowNotification(
            "This decision is already in the queue!"
          );
        } else {
          const tx = await blockchainApi.onlyOwnerPushQueue(
            curDecision._this_address,
            queueAddress
          );
          main.jobsScheduler.checkContractCall(
            {
              id: tx.ID,
              name: `Push Queue Transaction: ${tx.ID}`,
              status: "waiting",
              contractAddress: curDecision._this_address,
              type: "Push",
            },
            async () => {},
            async () => {}
          );
          main.longNotification.current.setLoading();
          main.longNotification.current.onShowNotification(
            "Waiting for transaction confirmation..."
          );
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
      setShowQueues(false);
    }
  }

  return (
    <TwoCards
      Card1={
        <Box fill>
          <QHeading>{"Decision"}</QHeading>
          <QParagraph>{`Here is the preview of the decision with the address:`}</QParagraph>
          <Address
            txt={contract.state._this_address}
            onCopyTxt={() =>
              onCopyText(contract.state._this_address, "Address Copied!", main)
            }
          />
          <Box justify="center" align="start">
            <Button
              label="Share"
              icon={<ShareOption color="brand" />}
              onClick={() =>
                onCopyText(window.location.href, "URL copied!", main)
              }
            />
          </Box>
          <QParagraph
            size="small"
            color={
              curDecision.owner == main.curAcc ? "status-ok" : "status-critical"
            }
          >
            {curDecision.owner == main.curAcc
              ? "You are the owner of this decision."
              : `You are not the owner of this decision.`}
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
          <QParagraph>{`Token: ${curDecision.token_id}, Credit to token ratio: ${curDecision.credit_to_token_ratio}`}</QParagraph>
          <Box fill="horizontal" align="start" justify="start" gap="small">
            {main.useQueues.addresses.length > 0 && (
              <Box align="center">
                <Button
                  label={"Add to Queue"}
                  onClick={() => setShowQueues(true)}
                />
                {showQueues && (
                  <MenuModal modalHeight="38vh" modalWidth="35vw" gap="small">
                    <ScrollBox props={{ gap: "medium" }}>
                      {main.useQueues.addresses.map((a) => (
                        <Address
                          txt={a}
                          key={`queue to choose${a}`}
                          onClick={() => onAddToQueue(a)}
                        />
                      ))}
                    </ScrollBox>
                    <Button
                      label={"Close"}
                      onClick={() => setShowQueues(false)}
                    />
                  </MenuModal>
                )}
              </Box>
            )}
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
