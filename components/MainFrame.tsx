import React, { useState, useEffect, createContext } from "react";
import { Box, ResponsiveContext, Button, Text } from "grommet";
import { useRouter } from "next/router";
import { Add, List, Close, Icon, FormEdit } from "grommet-icons";
import { QVoteLogo } from "./QVoteLogo";
import { MenuButton } from "./MenuButton";
import { BlockchainInfo, BLOCKCHAINS } from "../config";

const _COMPANY_SITE = "https://qvote.co.uk";

const _LOGO_STRONG = "#333333";
const _LOGO_WEAK = "#666666";

const PATHS = {
  create: "/",
  vote: "/vote",
  results: "/results",
};

export const MainFrameContext = createContext<{
  curAcc: string | undefined;
  connected: boolean;
  blockchainInfo: BlockchainInfo
}>({
  curAcc: undefined,
  connected: false,
  blockchainInfo: BLOCKCHAINS.private
});

export function MainFrame({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const [curAcc, setCurAcc] = useState<string | undefined>();
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo>();
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  async function onGoTo(path: string) {
    await router.push(path);
  }

  useEffect(() => {
    if (curAcc) {
      setConnected(true);
    } else {
      setConnected(false);
    }
    setLoading(false);
  }, [curAcc]);

  function setNet(net: string) {
    if (Object.keys(BLOCKCHAINS).includes(net)) {
      setBlockchainInfo(BLOCKCHAINS[net]);
    } else {
      setBlockchainInfo(BLOCKCHAINS.private);
    }
  }

  async function connect():Promise<boolean> {
    return window.zilPay.wallet.connect()
  }

  async function onStart() {
    if (window.zilPay) {
      const isConnect = await connect();
      if (isConnect) {
        setCurAcc(window.zilPay.wallet.defaultAccount.base16);
        window.zilPay.wallet.observableAccount().subscribe((account) => {
          setCurAcc(account.base16);
        });
        setNet(window.zilPay.wallet.net);
        window.zilPay.wallet
          .observableNetwork()
          .subscribe((net: "mainnet" | "testnet" | "private") => setNet(net));
      } else {
        setConnected(false);
      }
    }
  }

  useEffect(() => {
    onStart();
  }, []);

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
            txtColor={connected ? "status-ok" : undefined}
            txt={loading ? "" : connected ? "Connected" : "Connect to Wallet"}
            onClick={() => onStart()}
            isCurrent={false}
          />
        </Box>
      </Box>
      <MainFrameContext.Provider value={{ connected, curAcc, blockchainInfo }}>
        {children}
      </MainFrameContext.Provider>
    </Box>
  );
}
