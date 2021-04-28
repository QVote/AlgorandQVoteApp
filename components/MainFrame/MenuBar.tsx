import React, {
    useState,
    MutableRefObject,
    useImperativeHandle,
    forwardRef,
    useEffect,
} from "react";
import { Box, Text, Button } from "grommet";
import type { NextRouter } from "next/router";
import { QVoteLogo } from "../QVoteLogo";
import { MenuButton } from "./MenuButton";
import {
    Capacity,
    MoreVertical,
    Connect,
    Integration,
    Transaction,
    Update,
    Info,
} from "grommet-icons";
import { ScrollBox } from "../ScrollBox";
import { useResponsiveContext } from "../../hooks/useResponsiveContext";
import { useMainContext } from "../../hooks/useMainContext";
import { networkNotSupported, onCopyText, onGoToAs } from "../utill";
import { Address } from "../Address";
import { Notice } from "../Notice";
import { MenuModal } from "./MenuModal";
import Image from "next/image";

const _COMPANY_SITE = "https://github.com/QVote";

const PATHS = {
    decisions: "/",
    create: "/create",
    queues: "/queues",
    vote: "/vote",
    register: "/register",
    results: "/results",
    preview: { path: "/[address]/preview", as: "/preview" },
};

type OpenTypes = "none" | "connect" | "transactions";

export type MenuHandle = {
    setOpen: (t: OpenTypes) => void;
    open: OpenTypes;
};

function MenuBarComponent(
    {
        router,
        connected,
        loading,
        onStart,
    }: {
        router: NextRouter;
        connected: boolean;
        loading: boolean;
        onStart: (arg: () => void) => Promise<void>;
    },
    ref: MutableRefObject<MenuHandle>
) {
    const responsiveContext = useResponsiveContext();
    const main = useMainContext();
    const [open, setOpen] = useState<OpenTypes>("none");

    useImperativeHandle(ref, () => ({
        setOpen,
        open,
    }));

    useEffect(() => {
        setOpen("none");
    }, [router.pathname]);

    async function onGoTo(path: string) {
        await router.push(path);
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
            networkNotSupported(main);
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
            <Box
                fill="horizontal"
                direction="row"
                align="center"
                justify="start"
            >
                <Box
                    margin={{
                        left: "small",
                        right:
                            responsiveContext == "small" ? "medium" : "large",
                    }}
                    direction="row"
                    align="end"
                    gap="small"
                >
                    <QVoteLogo color={"dark-1"} size={"5vh"} />

                    <Box margin={{ bottom: "0.2vh" }}>
                        <Text
                            color={"dark-1"}
                            size={
                                responsiveContext == "small"
                                    ? "medium"
                                    : "large"
                            }
                            //@ts-ignore
                            style={{ fontWeight: "500" }}
                        >
                            QVote
                        </Text>
                    </Box>
                </Box>
                <MenuButton
                    txt={"Decisions"}
                    IconToDisp={MoreVertical}
                    onClick={() => onGoTo(PATHS.decisions)}
                    isCurrent={router.pathname == PATHS.decisions}
                />
                <MenuButton
                    txt={"Queues"}
                    IconToDisp={Capacity}
                    onClick={() => onGoTo(PATHS.queues)}
                    isCurrent={router.pathname == PATHS.queues}
                />
                <MenuButton
                    txt={"About"}
                    IconToDisp={Info}
                    onClick={() => {
                        router.push(_COMPANY_SITE);
                    }}
                    isCurrent={false}
                />
            </Box>
            <Box width="50%" direction="row" align="center" justify="end">
                {connected && (
                    <Box height="7vh" width={"10vw"}>
                        <MenuButton
                            txt={"Transactions"}
                            IconToDisp={
                                main.jobsScheduler.someInProgress
                                    ? Update
                                    : Transaction
                            }
                            onClick={() =>
                                setOpen(
                                    open == "transactions"
                                        ? "none"
                                        : "transactions"
                                )
                            }
                            isCurrent={false}
                            spin={main.jobsScheduler.someInProgress}
                        />
                        {open == "transactions" && (
                            <MenuModal
                                top={"8vh"}
                                right={"12.5vw"}
                                modalHeight="38vh"
                                modalMinHeight="38vh"
                                modalWidth="71vw"
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
                                        <Notice
                                            txt={
                                                "There is no recent transactions history."
                                            }
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
                                        <Notice
                                            txt={"Your recent transactions:"}
                                        />
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
                                                onCopyTxt={() =>
                                                    onCopyText(
                                                        `0x${a.id}`,
                                                        "Transaction hash copied!",
                                                        main
                                                    )
                                                }
                                                onViewBlock={() =>
                                                    tryToViewBlock(a.id)
                                                }
                                            />
                                        ))}
                                    </ScrollBox>
                                )}
                            </MenuModal>
                        )}
                    </Box>
                )}
                {open == "connect" && (
                    <MenuModal
                        top={"8vh"}
                        right={"2.5vw"}
                        modalHeight="38vh"
                        modalWidth="71vw"
                        gap="small"
                        modalMinHeight="small"
                    >
                        <SVGButton
                            svgPath={"/zilpay.svg"}
                            onClick={() => onStart(() => setOpen("none"))}
                        />
                    </MenuModal>
                )}
                <MenuButton
                    IconToDisp={connected ? Integration : Connect}
                    iconColor={connected ? "status-ok" : undefined}
                    txtColor={connected ? "status-ok" : undefined}
                    txt={loading ? "" : connected ? "Connected" : "Connect"}
                    onClick={() => {
                        if (!main.connected) {
                            setOpen(open == "connect" ? "none" : "connect");
                        }
                    }}
                    isCurrent={false}
                />
            </Box>
        </Box>
    );
}

function SVGButton(props: {
    onClick: () => void;
    svgPath: string;
    notSupported?: boolean;
}) {
    return (
        <Button onClick={props.onClick}>
            <Box
                width={{ min: "small" }}
                height="xsmall"
                align="center"
                justify="center"
                background="dark-1"
                round="xsmall"
                pad="small"
            >
                <Text>
                    {typeof props.notSupported != "undefined"
                        ? "Not supported yet"
                        : "Connect"}
                </Text>
                <img src={props.svgPath} style={{ height: "40px" }} />
            </Box>
        </Button>
    );
}

export const MenuBar = forwardRef(MenuBarComponent);
