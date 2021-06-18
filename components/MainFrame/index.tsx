import React, { useState, useEffect, useRef } from "react";
import { Box } from "grommet";
import { useRouter } from "next/router";
import { BlockchainInfo, BLOCKCHAINS } from "../../config";
import { MenuBar, MenuHandle } from "./MenuBar";
import { useContracts } from "../../hooks/useContracts";
import { useQueues } from "../../hooks/useQueues";
import { useJobScheduler } from "../../hooks/useJobScheduler";
import { MainFrameContext } from "./MainFrameContext";
import { Notification, NotificationHandle } from "./Notification";
import { LongNotification } from "./LongNotification";
import { BlockchainApi } from "../../helpers/BlockchainApi";
import { formatAddress } from "../../scripts";

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
    const useContractsHook = useContracts(blockchainInfo, connected, curAcc);
    const useQueuesHook = useQueues(blockchainInfo, connected, curAcc);
    const notificationRef = useRef<NotificationHandle>();
    const menuRef = useRef<MenuHandle>();
    const jobsScheduler = useJobScheduler(
        blockchainInfo,
        useContractsHook,
        useQueuesHook,
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
        return BlockchainApi.getZilPay().wallet.connect();
    }

    async function onStart(callback?: () => void) {
        if (!(await onInitial(callback))) {
            //open extension window
            window.open("https://zilpay.io/");
        }
    }

    async function onInitial(callback?: () => void) {
        const thereIsZilPay = BlockchainApi.thereIsZilPay();
        if (thereIsZilPay) {
            const isConnect = await connect();
            if (isConnect) {
                setCurAcc(
                    formatAddress(
                        BlockchainApi.getZilPay().wallet.defaultAccount.base16
                    )
                );
                BlockchainApi.getZilPay()
                    .wallet.observableAccount()
                    .subscribe((account) => {
                        setCurAcc(formatAddress(account.base16));
                    });
                setNet(BlockchainApi.getZilPay().wallet.net);
                BlockchainApi.getZilPay()
                    .wallet.observableNetwork()
                    .subscribe((net: "mainnet" | "testnet" | "private") =>
                        setNet(net)
                    );
                setConnected(true);
                callback && callback();
            } else {
                setConnected(false);
            }
        }
        return thereIsZilPay;
    }

    useEffect(() => {
        onInitial();
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
                    useContracts: useContractsHook,
                    useQueues: useQueuesHook,
                    notification: notificationRef,
                    jobsScheduler,
                    menu: menuRef,
                }}
            >
                <MenuBar
                    ref={menuRef}
                    {...{
                        router,
                        connected,
                        loading,
                        onStart,
                    }}
                />
                {children}
                <Notification ref={notificationRef} />
                <LongNotification />
            </MainFrameContext.Provider>
        </Box>
    );
}
