import React, { useContext } from "react";
import { Box, Button, Text, ResponsiveContext } from "grommet";
import { Icon } from "grommet-icons";

const _LOGO_STRONG = "#333333";
const _LOGO_WEAK = "#666666";

export function MenuButton({
  txt,
  txtColor,
  IconToDisp,
  iconColor,
  onClick,
  isCurrent,
}: {
  txtColor?: string;
  txt: string;
  IconToDisp?: Icon;
  onClick: () => void | Promise<void>;
  isCurrent: boolean;
  iconColor?: string;
}) {
  const responsiveContext = useContext(ResponsiveContext);

  return (
    <Box height="7vh" width={IconToDisp ? "9vw" : "25vw"}>
      <Button fill plain onClick={onClick}>
        <Box
          fill
          align="center"
          justify="center"
          border={"bottom"}
          style={{
            borderWidth: isCurrent ? "2px" : "0px",
            borderColor: _LOGO_STRONG,
          }}
        >
          {IconToDisp && (
            <IconToDisp
              color={
                iconColor ? iconColor : isCurrent ? _LOGO_STRONG : _LOGO_WEAK
              }
            />
          )}
          {(responsiveContext != "small" || !IconToDisp) && (
            <Text
              weight={IconToDisp ? "normal" : "bold"}
              size={IconToDisp ? "xsmall" : "small"}
              color={
                txtColor ? txtColor : isCurrent ? _LOGO_STRONG : _LOGO_WEAK
              }
            >
              {txt}
            </Text>
          )}
        </Box>
      </Button>
    </Box>
  );
}
