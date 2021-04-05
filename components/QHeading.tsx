import React from "react";
import { Heading, HeadingExtendedProps } from "grommet";
import { useReponsiveContext } from "../hooks/useReponsiveContext";

export function QHeading(props: HeadingExtendedProps) {
  const responsiveContext = useReponsiveContext();
  return (
    <Heading level={responsiveContext == "small" ? "2" : "1"}>
      {props.children}
    </Heading>
  );
}
