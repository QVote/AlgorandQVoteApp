import React, { useContext, useState } from "react";
import { Box, Text, ResponsiveContext, Button, Stack } from "grommet";
import type { NextRouter } from "next/router";
import { QVoteLogo } from "../QVoteLogo";
import { MenuButton } from "./MenuButton";
import {
  Add,
  List,
  FormEdit,
  MoreVertical,
  Copy,
  Connect,
  Integration,
  Transaction,
  Update,
} from "grommet-icons";
import { ScrollBox } from "../ScrollBox";
import { MainFrameContext } from "./MainFrameContext";
import { onCopy } from "../../scripts";

const _COMPANY_SITE = "https://qvote.co.uk";

const _LOGO_STRONG = "#333333";
const _LOGO_WEAK = "#666666";

const PATHS = {
  create: "/",
  vote: "/vote",
  results: "/results",
};

export function MenuBar({
  router,
  connected,
  loading,
  onStart,
}: {
  router: NextRouter;
  connected: boolean;
  loading: boolean;
  onStart: () => Promise<void>;
}) {
  const responsiveContext = useContext(ResponsiveContext);
  const main = useContext(MainFrameContext);
  const [open, setOpen] = useState<"none" | "contracts" | "transactions">(
    "none"
  );

  async function onGoTo(path: string) {
    await router.push(path);
  }

  function onCopyText(txt: string, notification: string) {
    onCopy(txt);
    main.notification.current.onShowNotification(notification);
  }

  function tryToViewBlock(id: string) {
    //Try to open a viewblock
    if (
      main.blockchainInfo.name == "testnet" ||
      main.blockchainInfo.name == "mainnet"
    ) {
      window.open(
        `https://viewblock.io/zilliqa/tx/0x${id}?network=${main.blockchainInfo.name}`
      );
    } else {
      main.longNotification.current.setError();
      main.longNotification.current.onShowNotification(
        "Viewblock not supported on current network."
      );
    }
  }

  return (
    <Box
      style={{ top: 0, left: 0 }}
      height={{ min: "7vh", max: "7vh" }}
      width={{ min: "100vw", max: "100vw" }}
      background={"white"}
      align="center"
      justify="start"
      direction="row"
      elevation="small"
      pad={{ left: "small", right: "small" }}
    >
      <Box fill="horizontal" direction="row" align="center" justify="start">
        <Box
          margin={{
            left: "small",
            right: responsiveContext == "small" ? "medium" : "large",
          }}
          onClick={() => router.push(_COMPANY_SITE)}
          direction="row"
          align="end"
          gap="small"
        >
          <QVoteLogo color={_LOGO_STRONG} size={"5vh"} />
          <Box margin={{ bottom: "0.2vh" }}>
            <Text
              color={_LOGO_STRONG}
              size={responsiveContext == "small" ? "medium" : "large"}
              //@ts-ignore
              style={{ fontWeight: "500" }}
            >
              QVote
            </Text>
          </Box>
        </Box>
        <MenuButton
          txt={"Create"}
          IconToDisp={Add}
          onClick={() => onGoTo(PATHS.create)}
          isCurrent={router.pathname == PATHS.create}
        />
        <MenuButton
          txt={"Vote"}
          IconToDisp={FormEdit}
          onClick={() => onGoTo(PATHS.vote)}
          isCurrent={router.pathname == PATHS.vote}
        />
        <MenuButton
          txt={"Results"}
          IconToDisp={List}
          onClick={() => onGoTo(PATHS.results)}
          isCurrent={router.pathname == PATHS.results}
        />
      </Box>
      <Box width="50%" direction="row" align="center" justify="end">
        {connected && (
          <Box height="7vh" width={"10vw"}>
            <MenuButton
              txt={"Decisions"}
              IconToDisp={MoreVertical}
              onClick={() =>
                setOpen(open == "contracts" ? "none" : "contracts")
              }
              isCurrent={false}
            />
            {open == "contracts" && (
              <Box
                style={{
                  position: "absolute",
                  zIndex: 19,
                  top: "8vh",
                  right: "26vw",
                }}
                height={{ min: "38vh", max: "38vh" }}
                width={{ max: "71vw" }}
                background="light-1"
                round="xsmall"
                elevation="small"
                pad="medium"
              >
                {main.contractAddressses.addresses.length == 0 ? (
                  <ScrollBox
                    props={{
                      pad: {
                        left: "xxsmall",
                        right: "xxsmall",
                        bottom: "xxsmall",
                      },
                      gap: "xsmall",
                    }}
                  >
                    <Notice txt={"You haven't deployed any decisions yet."} />
                    <Button
                      label={"Go to create"}
                      onClick={() => {
                        router.push("/");
                        setOpen("none");
                      }}
                    />
                  </ScrollBox>
                ) : (
                  <ScrollBox
                    props={{
                      pad: {
                        left: "xxsmall",
                        right: "xxsmall",
                        bottom: "xxsmall",
                      },
                      gap: "xsmall",
                    }}
                  >
                    <Notice txt={"Your selected decision:"} />
                    <Address
                      txt={main.contractAddressses.addresses[0]}
                      bg={"status-ok"}
                      onClick={() =>
                        main.contractAddressses.makeFirst(
                          main.contractAddressses.addresses[0]
                        )
                      }
                      onCopyTxt={() =>
                        onCopyText(
                          main.contractAddressses.addresses[0],
                          "Address Copied!"
                        )
                      }
                    />
                    {main.contractAddressses.addresses.length > 1 && (
                      <Notice txt={"Your other decisions:"} />
                    )}
                    {main.contractAddressses.addresses.length > 1 &&
                      main.contractAddressses.addresses
                        .slice(1)
                        .map((a) => (
                          <Address
                            txt={a}
                            key={`contact${a}`}
                            onClick={() => main.contractAddressses.makeFirst(a)}
                            onCopyTxt={() => onCopyText(a, "Address Copied!")}
                          />
                        ))}
                  </ScrollBox>
                )}
              </Box>
            )}
          </Box>
        )}
        {connected && (
          <Box height="7vh" width={"10vw"}>
            <MenuButton
              txt={"Transactions"}
              IconToDisp={
                main.jobsScheduler.someInProgress ? Update : Transaction
              }
              onClick={() =>
                setOpen(open == "transactions" ? "none" : "transactions")
              }
              isCurrent={false}
              spin={main.jobsScheduler.someInProgress}
            />
            {open == "transactions" && (
              <Box
                style={{
                  position: "absolute",
                  zIndex: 19,
                  top: "8vh",
                  right: "26vw",
                }}
                height={{ min: "38vh", max: "38vh" }}
                width={{ max: "71vw" }}
                background="light-1"
                round="xsmall"
                elevation="small"
                pad="medium"
              >
                {main.jobsScheduler.jobs.length == 0 ? (
                  <ScrollBox
                    props={{
                      pad: {
                        left: "xxsmall",
                        right: "xxsmall",
                        bottom: "xxsmall",
                      },
                      gap: "xsmall",
                    }}
                  >
                    <Notice txt={"There is no recent transactions history."} />
                  </ScrollBox>
                ) : (
                  <ScrollBox
                    props={{
                      pad: {
                        left: "xxsmall",
                        right: "xxsmall",
                        bottom: "xxsmall",
                      },
                      gap: "xsmall",
                    }}
                  >
                    <Notice txt={"Your recent transactions:"} />
                    {main.jobsScheduler.jobs.map((a) => (
                      <Address
                        txt={a.name}
                        bg={
                          a.status == "done"
                            ? "status-ok"
                            : a.status == "error"
                            ? "status-error"
                            : "status-unknown"
                        }
                        key={`transaction${a.id}`}
                        onClick={() => tryToViewBlock(a.id)}
                        onCopyTxt={() =>
                          onCopyText(`0x${a.id}`, "Transaction hash copied!")
                        }
                      />
                    ))}
                  </ScrollBox>
                )}
              </Box>
            )}
          </Box>
        )}
        <MenuButton
          IconToDisp={connected ? Integration : Connect}
          iconColor={connected ? "status-ok" : undefined}
          txtColor={connected ? "status-ok" : undefined}
          txt={loading ? "" : connected ? "Connected" : "Connect"}
          onClick={() => onStart()}
          isCurrent={false}
        />
      </Box>
    </Box>
  );
}

function Notice({ txt, top }: { txt: string; top?: boolean }) {
  return (
    <Box
      height={{ min: "xxsmall" }}
      justify="center"
      pad={{ left: "xsmall", right: "xsmall" }}
    >
      <Text weight={"bold"} truncate size={"xsmall"} color={_LOGO_WEAK}>
        {txt}
      </Text>
    </Box>
  );
}
function Address({
  txt,
  bg,
  onClick,
  onCopyTxt,
}: {
  txt: string;
  bg?: string;
  onClick?: () => void;
  onCopyTxt?: () => void;
}) {
  return (
    <Box
      height={{ min: "xxsmall" }}
      round="xsmall"
      background={bg ? bg : "white"}
      justify="center"
      pad={{ left: "xsmall", right: "xsmall" }}
    >
      <Box fill direction="row" justify="between" align="center">
        <Box fill>
          <Button fill plain onClick={onClick}>
            <Box fill>
              <Text truncate size={"xsmall"} color={bg ? "white" : _LOGO_WEAK}>
                {txt}
              </Text>
            </Box>
          </Button>
        </Box>
        {onCopyTxt && (
          <Box pad="xxsmall">
            <Button
              fill
              plain
              icon={<Copy color={bg && "white"} />}
              onClick={onCopyTxt}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
