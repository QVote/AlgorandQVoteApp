import React, { useState, useEffect, useRef } from "react";
import { Box, ResponsiveContext, Button, Text } from "grommet";
import { useRouter } from "next/router";
import { BlockchainInfo, BLOCKCHAINS } from "../../config";
import { MenuBar, MenuHandle } from "./MenuBar";
import { useContractAddresses } from "../../hooks/useContractAddresses";
import { useJobScheduler } from "../../hooks/useJobScheduler";
import { MainFrameContext } from "./MainFrameContext";
import { Notification, NotificationHandle } from "./Notification";
import { LongNotification, LongNotificationHandle } from "./LongNotification";

export { MainFrameContext };

export function MainFrame({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const [curAcc, setCurAcc] = useState<string | undefined>();
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo>({
    name: "none__",
    protocol: { chainId: 0, msgVersion: 1 },
    url: "",
  });
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const contractAddressses = useContractAddresses(blockchainInfo, connected);
  const notificationRef = useRef<NotificationHandle>();
  const longNotificationRef = useRef<LongNotificationHandle>();
  const menuRef = useRef<MenuHandle>();
  const jobsScheduler = useJobScheduler(
    blockchainInfo,
    contractAddressses,
    longNotificationRef,
    connected
  );

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

  async function connect(): Promise<boolean> {
    return window.zilPay.wallet.connect();
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
      <MainFrameContext.Provider
        value={{
          connected,
          curAcc,
          blockchainInfo,
          contractAddressses,
          notification: notificationRef,
          jobsScheduler,
          longNotification: longNotificationRef,
          menu: menuRef,
        }}
      >
        <MenuBar
          ref={menuRef}
          {...{
            router,
            connected,
            loading,
            onStart: () => onStart(),
          }}
        />
        {children}
        <Notification ref={notificationRef} />
        <LongNotification ref={longNotificationRef} />
      </MainFrameContext.Provider>
    </Box>
  );
}
