import React from "react";
import { Heading, HeadingExtendedProps } from "grommet";
import { useResponsiveContext } from "../hooks/useResponsiveContext";

export function QHeading(props: HeadingExtendedProps) {
  const responsiveContext = useResponsiveContext();
  return (
    <Heading level={responsiveContext == "small" ? "2" : "1"}>
      {props.children}
    </Heading>
  );
}
