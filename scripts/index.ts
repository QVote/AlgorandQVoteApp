import { v4 as uuidv4 } from "uuid";
import type { MutableRefObject } from "react";
import {
  addMinutes,
  decisionValidate,
  areUniqueOnKey,
  areOptionsValid,
  getInitDecision,
} from "./decisionValidate";

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

export async function sleep(milis: number): Promise<void> {
  await new Promise<void>((res) => setTimeout(() => res(), milis));
}

export function onCopy(toCopy: string) {
  const x = document.createElement("INPUT");
  x.setAttribute("type", "text");
  x.setAttribute("value", toCopy);
  // @ts-ignore it works it is a txt input
  x.select();
  // @ts-ignore
  x.setSelectionRange(0, 99999);
  document.execCommand("copy");
  // @ts-ignore
  navigator.clipboard.writeText(toCopy);
}

export async function retryLoop(
  maxRetries: number,
  intervalMs: number,
  func: () => Promise<{ shouldRetry: boolean; res: any }>
): Promise<any> {
  for (let x = 1; x < maxRetries + 1; x++) {
    await sleep(x * intervalMs);
    try {
      const temp = await func();
      if (!temp.shouldRetry) {
        return temp.res;
      }
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  throw new Error("Function didnt manage to run in time");
}

export function isSuccess(receipt: any): boolean {
  return receipt.success;
}

//my codebase my rules @MszBednarski
export function intPls(sOrN: string | number): number {
  let resVal = 0;
  if (typeof sOrN == "string") {
    resVal = parseInt(sOrN);
  } else if (typeof sOrN == "number") {
    resVal = sOrN;
  }
  return resVal;
}

export function scrollTo(someRef: MutableRefObject<any>) {
  try {
    setTimeout(
      () =>
        someRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50
    );
  } catch (e) {
    console.error(e);
  }
}

export {
  concatStrings,
  unConcatStrings,
  makeStringUniq,
  areOptionsValid,
  areUniqueOnKey,
  addMinutes,
  decisionValidate,
  getInitDecision,
};
