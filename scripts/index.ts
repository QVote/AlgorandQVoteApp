import { v4 as uuidv4 } from "uuid";
import { QVote } from "../types";

function concatStrings(name: string, desc: string) {
  const mark = uuidv4().substr(0, 6);
  return `${mark}_${name}${mark}${desc}`;
}

function unConcatStrings(concat: string) {
  const markIndex = concat.indexOf("_");
  const mark = concat.substr(0, markIndex);
  const splitted = concat.split(mark);
  const nameWithUnderscore = splitted[1];
  const name = nameWithUnderscore.substring(1, nameWithUnderscore.length);
  return [name, splitted[2]];
}

function makeStringUniq(s: string) {
  const mark = uuidv4().substr(0, 5);
  return `${mark}_${s}`;
}

function areOptionsValid(d: QVote.Decision) {
  const areUnique = areOptionsUnique(d.options);
  return d.options.length > 1 && areUnique;
}

function areOptionsUnique(d: QVote.Option[]) {
  const res: { [key: string]: QVote.Option } = {};
  d.forEach((o) => {
    res[o.optName] = o;
  });
  const optionsSize = d.length;
  const areUnique = Object.entries(res).length == optionsSize;
  return areUnique;
}

export function getDateTime(milis: number) {
  const date = new Date(milis);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  let pmOrAm = "";
  if (hours > 12) {
    hours = hours % 12;
    pmOrAm = "pm";
  } else {
    pmOrAm = "am";
  }
  let timeString = "";
  if (minutes < 10) {
    timeString = `${hours}:0${minutes} ${pmOrAm}`;
  } else {
    timeString = `${hours}:${minutes} ${pmOrAm}`;
  }

  return { date: date, time: timeString };
}

export {
  concatStrings,
  unConcatStrings,
  makeStringUniq,
  areOptionsValid,
  areOptionsUnique,
};
