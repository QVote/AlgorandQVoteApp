import React, { useEffect, useRef, RefObject } from "react";
import { Box } from "grommet";
import { appendChild } from "./utill";
import { getChart } from "./chart";
import { QVote } from "../../types";

export function BarChart({
  decision,
}: {
  decision: QVote.ContractDecisionProcessed;
}) {
  const CHART_BOX_ID = "BarChart-box";
  const chart = useRef<SVGSVGElement>();

  /**
   * Get the initial poll
   * Create chart
   * Append chart to the document
   * update the chart and show data
   */
  useEffect(() => {
    chart.current = getChart({ options: decision.option_to_votes });
    appendChild(CHART_BOX_ID, chart.current);
    //chart.current.update(2000);
  }, []);

  return (
    <Box fill align="center" gap="small">
      <Box fill={true} id={CHART_BOX_ID} pad="small" />
    </Box>
  );
}
