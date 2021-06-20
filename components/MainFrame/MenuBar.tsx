import React, {
    useState,
    MutableRefObject,
    useImperativeHandle,
    forwardRef,
    useEffect,
} from "react";
import { Box, Text, Button } from "grommet";
import { useRouter } from "next/router";
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
import { onCopyText } from "../utill";
import { Address } from "../Address";
import { Notice } from "../Notice";
import { MenuModal } from "./MenuModal";
import { blockchain } from "../../helpers/Blockchain";
import { observer } from "mobx-react";

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

function MenuBarComponent(props: {}, ref: MutableRefObject<MenuHandle>) {
    const responsiveContext = useResponsiveContext();
    const [open, setOpen] = useState<OpenTypes>("none");
    const router = useRouter();

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
                {blockchain.connected && (
                    <Box height="7vh" width={"10vw"}>
                        <MenuButton
                            txt={"Transactions"}
                            IconToDisp={
                                blockchain.someJobsInProgress
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
                            spin={blockchain.someJobsInProgress}
                        />
                        {open == "transactions" && (
                            <MenuModal
                                top={"8vh"}
                                right={"12.5vw"}
                                modalHeight="38vh"
                                modalMinHeight="38vh"
                                modalWidth="71vw"
                            >
                                {blockchain.jobs.value.arr.length == 0 ? (
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
                                        {blockchain.jobs.value.arr.map((a) => (
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
                                                        "Transaction hash copied!"
                                                    )
                                                }
                                                onViewBlock={() =>
                                                    blockchain.txLink(a.id)
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
                            onClick={() => {
                                setOpen("none");
                                blockchain.connect();
                            }}
                        />
                    </MenuModal>
                )}
                <MenuButton
                    IconToDisp={blockchain.connected ? Integration : Connect}
                    iconColor={blockchain.connected ? "status-ok" : undefined}
                    txtColor={blockchain.connected ? "status-ok" : undefined}
                    txt={
                        blockchain.loading
                            ? ""
                            : blockchain.connected
                            ? "Connected"
                            : "Connect"
                    }
                    onClick={() => {
                        if (!blockchain.connected) {
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

export const MenuBar = observer(forwardRef(MenuBarComponent));
