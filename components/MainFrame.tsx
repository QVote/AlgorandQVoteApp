import React, { useState, useEffect, useContext } from "react";
import { Box, ResponsiveContext, Button, Text } from "grommet";
import { useRouter } from "next/router";
import { Add, List, Close, Icon, FormEdit } from "grommet-icons";
import { QVoteLogo } from "./QVoteLogo";
import { MenuButton } from "./MenuButton";

const _COMPANY_SITE = "https://qvote.co.uk";

const _LOGO_STRONG = "#333333";
const _LOGO_WEAK = "#666666";

const PATHS = {
  create: "/",
  vote: "/vote",
  results: "/results",
};

export function MainFrame({ children }: { children: JSX.Element }) {
  const router = useRouter();

  async function onGoTo(path: string) {
    await router.push(path);
  }

  return (
    <Box
      height={{ min: "100vh", max: "100vh" }}
      width={{ min: "100vw", max: "100vw" }}
      overflow="hidden"
      fill={true}
      background={"light-2"}
    >
      <Box
        style={{ top: 0, left: 0, zIndex: 999 }}
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
            margin={{ left: "small", right: "large" }}
            onClick={() => router.push(_COMPANY_SITE)}
            direction="row"
            align="end"
            gap="small"
          >
            <QVoteLogo color={_LOGO_STRONG} size={"5vh"} />
            <Box margin={{ bottom: "0.2vh" }}>
              <Text
                color={_LOGO_STRONG}
                size="large"
                //@ts-ignore
                style={{ fontWeight: "500" }}
              >
                QVote x Zilliqa
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
        <Box width="30%" direction="row" align="center" justify="end">
          <MenuButton
            txt={"Connect to Wallet"}
            onClick={() => console.log("yeet")}
            isCurrent={false}
          />
        </Box>
      </Box>
      {children}
    </Box>
  );
}
