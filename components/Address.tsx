import React from "react";
import { useMainContext } from "../hooks/useMainContext";
import { networkNotSupported } from "./utill";
import { Box, Text, Button } from "grommet";
import { Cubes, Copy } from "grommet-icons";

export function Address({
    txt,
    bg,
    onClick,
    onCopyTxt,
    onViewBlock,
}: {
    txt: string;
    bg?: string;
    onClick?: () => void;
    onCopyTxt?: () => void;
    onViewBlock?: () => void;
}) {
    const main = useMainContext();
    function tryToViewBlockContract(address: string) {
        //Try to open a viewblock
        if (
            main.blockchainInfo.name == "testnet" ||
            main.blockchainInfo.name == "mainnet"
        ) {
            window.open(
                `https://viewblock.io/zilliqa/address/${address}?network=${main.blockchainInfo.name}`
            );
        } else {
            networkNotSupported();
        }
    }

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
                    <Button fill plain onClick={onClick ? onClick : null}>
                        <Box fill justify="center">
                            <Text
                                truncate
                                size={"xsmall"}
                                color={bg ? "white" : "dark-3"}
                            >
                                {txt}
                            </Text>
                        </Box>
                    </Button>
                </Box>

                <Box pad="xxsmall" margin={{ right: "small" }}>
                    <Button
                        fill
                        plain
                        icon={<Cubes color={bg && "white"} />}
                        onClick={
                            onViewBlock
                                ? onViewBlock
                                : () => tryToViewBlockContract(txt)
                        }
                    />
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
