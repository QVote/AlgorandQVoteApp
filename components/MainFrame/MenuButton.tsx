import React, { useContext } from "react";
import { Box, Button, Text, ResponsiveContext } from "grommet";
import { Icon } from "grommet-icons";

export function MenuButton({
  txt,
  txtColor,
  IconToDisp,
  iconColor,
  onClick,
  isCurrent,
  spin,
  notResponsive,
}: {
  txtColor?: string;
  txt: string;
  IconToDisp?: Icon;
  onClick: () => void | Promise<void>;
  isCurrent?: boolean;
  iconColor?: string;
  spin?: boolean;
  notResponsive?: boolean;
}) {
  const responsiveContext = notResponsive
    ? "not responsive"
    : useContext(ResponsiveContext);

  return (
    <Box height="7vh" width={IconToDisp ? "11vw" : "25vw"}>
      <Button fill plain onClick={onClick}>
        <Box
          fill
          align="center"
          justify="center"
          border={"bottom"}
          style={{
            borderWidth: isCurrent ? "2px" : "0px",
            borderColor: "dark-1",
          }}
        >
          {IconToDisp && (
            <Box animation={spin ? "rotateRight" : null}>
              <IconToDisp
                color={iconColor ? iconColor : isCurrent ? "dark-1" : "dark-3"}
              />
            </Box>
          )}
          {(responsiveContext != "small" || !IconToDisp) && (
            <Text
              weight={IconToDisp ? "normal" : "bold"}
              size={IconToDisp ? "xsmall" : "small"}
              color={txtColor ? txtColor : isCurrent ? "dark-1" : "dark-3"}
            >
              {txt}
            </Text>
          )}
        </Box>
      </Button>
    </Box>
  );
}
