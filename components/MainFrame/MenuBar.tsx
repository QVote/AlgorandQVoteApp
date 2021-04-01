import React, { useContext, useState } from "react";
import { Box, Text, ResponsiveContext, Button, Stack } from "grommet";
import type { NextRouter } from "next/router";
import { QVoteLogo } from "../QVoteLogo";
import { MenuButton } from "./MenuButton";
import { Add, List, FormEdit, MoreVertical, Copy } from "grommet-icons";
import { useContractAddresses } from "../../hooks/useContractAddresses";
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
  const [contractMenu, setContractMenu] = useState(false);

  async function onGoTo(path: string) {
    await router.push(path);
  }

  function onCopyAddress(txt: string) {
    onCopy(txt);
    main.notification.current.onShowNotification("Address copied!");
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
      <Box width="70%" direction="row" align="center" justify="end">
        {connected && (
          <Box height="7vh" width={"9vw"}>
            <MenuButton
              txt={"Decisions"}
              IconToDisp={MoreVertical}
              iconColor={
                main.contractAddressses.addresses.length != 0
                  ? "status-ok"
                  : undefined
              }
              txtColor={
                main.contractAddressses.addresses.length != 0
                  ? "status-ok"
                  : undefined
              }
              onClick={() => setContractMenu(!contractMenu)}
              isCurrent={false}
            />
            {contractMenu && (
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
                animation={[{ type: "fadeIn", duration: 100 }]}
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
                        setContractMenu(false);
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
                        onCopyAddress(main.contractAddressses.addresses[0])
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
                            onCopyTxt={() => onCopyAddress(a)}
                          />
                        ))}
                  </ScrollBox>
                )}
              </Box>
            )}
          </Box>
        )}
        <MenuButton
          txtColor={connected ? "status-ok" : undefined}
          txt={loading ? "" : connected ? "Connected" : "Connect to Wallet"}
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
