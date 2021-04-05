import React from "react";
import { ParagraphExtendedProps, Paragraph } from "grommet";
/**
 * Q is from qvote as in this paragraph is our custom paragraph now
 */
export function QParagraph(props: ParagraphExtendedProps) {
  return (
    <Paragraph
      style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
      {...props}
    >
      {props.children}
    </Paragraph>
  );
}
