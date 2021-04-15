import * as d3 from "d3";
import { QVote } from "../../types";
import { trimStr } from "./utill";

const width = 700;
const height = 700;
const margin = { top: 80, right: 30, bottom: 34, left: 0 };
const delay = 500;

const _MAX_NAME_LENGTH = 15;

type Options = QVote.ContractDecisionProcessed["option_to_votes"];

export function getChart({ options }: { options: Options }) {
  options.sort((a, b) => b.vote - a.vote);
  options = options.map((o, i) => ({
    ...o,
    index: i,
    name: trimStr(o.name, _MAX_NAME_LENGTH),
  }));
  const color = d3
    .scaleOrdinal()
    .domain(options.map((d) => d.name))
    .range(
      d3
        .quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), options.length)
        .reverse()
    );

  const x = d3
    .scaleBand()
    .domain(options.map((o) => o.name))
    .rangeRound([width - margin.right, margin.left]);

  const voteMin = d3.min(options, (d) => d.vote);

  const y = d3
    .scaleLinear()
    .domain([voteMin > 0 ? 0 : voteMin, d3.max(options, (d) => d.vote)])
    .rangeRound([height - margin.bottom, margin.top]);

  const xAxis = (g: d3.Selection<SVGGElement, undefined, null, undefined>) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", margin.right + 40)
          .attr("y", margin.bottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("Option names")
      );
  const yAxis = (g) =>
    g
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(y).ticks(null, "s"))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", margin.right - 10)
          .attr("y", margin.top - 20)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("Votes")
      );
  const svg = d3
    .create("svg")
    //@ts-ignore chill
    .attr("viewBox", [0, 0, width, height]);

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);

  const group = svg.append("g");

  const dx = x.step();
  let rect = group.selectAll(".bars");

  rect = rect.data(options).join(
    (enter) =>
    //@ts-ignore
      enter
        .append("rect")
        .attr("class", ".bars")
        .attr("fill", (d) => color(d.name))
        .attr("x", (d) => x(d.name) + dx)
        .attr("y", (d) => y(0))
        .attr("width", x.bandwidth() - 1)
        .attr("height", 0),
    (update) => update,
    (exit) =>
      exit.call((rect) =>
        rect.transition(t).remove().attr("y", y(0)).attr("height", 0)
      )
  );

  const t = svg.transition().duration(delay);

  rect
    .transition(t)
    .attr("y", (d: Options[0]) => (d.vote > 0 ? y(d.vote) : y(0)))
    .attr("height", (d: Options[0]) => y(0) - y(Math.abs(d.vote)));
  group.transition(t).attr("transform", `translate(${-dx},0)`);

  return svg.node();
}
