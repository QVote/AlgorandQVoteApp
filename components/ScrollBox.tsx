import React, { ReactNode } from "react";
import { BoxProps } from "grommet";
import { NBox } from "../UI";

export function ScrollBox({
  children,
  elevate,
  props,
}: {
  children: ReactNode;
  elevate?: boolean;
  props?: BoxProps &
    React.ClassAttributes<HTMLDivElement> &
    React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <NBox
      fill
      overflow="auto"
      elevation={elevate ? "small" : null}
      round={elevate ? "small" : null}
      {...props}
    >
      {children}
    </NBox>
  );
}
