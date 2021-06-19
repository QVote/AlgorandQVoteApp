import React, { useState, useEffect, useRef } from "react";
import { Box } from "grommet";
import { useRouter } from "next/router";
import { MenuBar, MenuHandle } from "./MenuBar";
import { useContracts } from "../../hooks/useContracts";
import { useQueues } from "../../hooks/useQueues";
import { useJobScheduler } from "../../hooks/useJobScheduler";
import { MainFrameContext } from "./MainFrameContext";
import { Notification, LongNotification } from "../Notifications";
import { zilliqaApi } from "../../helpers/Zilliqa";
import { observer } from "mobx-react";

export const MainFrame = observer(({ children }: { children: JSX.Element }) => {
    const router = useRouter();
    // const useQueuesHook = useQueues(blockchainInfo, connected, curAcc);
    const menuRef = useRef<MenuHandle>();
    // const jobsScheduler = useJobScheduler(
    //     blockchainInfo,
    //     useQueuesHook,
    //     connected
    // );

    useEffect(() => {
        zilliqaApi.connect();
    }, []);

    useEffect(() => {
        if (zilliqaApi.connected) {
            const { address, queueAddress } = router.query;
            zilliqaApi.tryToGetContract(address);
            zilliqaApi.tryToGetQueueState(queueAddress);
        }
    }, [router.query, zilliqaApi.currentAddress, zilliqaApi.connected]);

    /**
     * Essentially regenerate the jobs that were in progress but the site was
     * refreshed
     */
    useEffect(() => {
        if (zilliqaApi.connected) {
            zilliqaApi.regenerateJobs();
        }
    }, [zilliqaApi.connected]);

    return (
        <Box
            height={{ min: "100vh", max: "100vh" }}
            width={{ min: "100vw", max: "100vw" }}
            overflow="hidden"
            fill={true}
            background={"light-2"}
        >
            {/* <MainFrameContext.Provider
                value={{
                    useQueues: useQueuesHook,
                    jobsScheduler,
                    menu: menuRef,
                }}
            > */}
            <MenuBar ref={menuRef} />
            {children}
            <Notification />
            <LongNotification />
            {/* </MainFrameContext.Provider> */}
        </Box>
    );
});
