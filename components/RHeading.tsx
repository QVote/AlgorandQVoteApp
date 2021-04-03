import React from "react";
import { Heading } from "grommet";

export function RHeading({
  txt,
  responsiveContext,
}: {
  txt: string;
  responsiveContext: string;
}) {
  return (
    <Heading level={responsiveContext == "small" ? "2" : "1"}>{txt}</Heading>
  );
}
