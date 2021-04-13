import React from "react";
import { Box, BoxExtendedProps } from "grommet";

export function MenuModal(
  props: BoxExtendedProps & {
    top?: string;
    right?: string;
    modalHeight: string;
    modalMinHeight?: string;
    modalWidth: string;
  }
) {
  return (
    <Box
      style={{
        position: "absolute",
        zIndex: 19,
        top: props.top,
        right: props.right,
      }}
      height={{ min: props.modalMinHeight, max: props.modalHeight }}
      width={{ max: props.modalWidth }}
      background="light-1"
      round="xsmall"
      elevation="small"
      pad="medium"
      {...props}
    >
      {props.children}
    </Box>
  );
}
