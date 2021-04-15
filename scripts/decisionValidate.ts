import { QVote } from "../types";

export function areUniqueOnKey(d: { [key: string]: string | number }[], key:string) {
  const res: { [key: string]: { [key: string]: string | number } } = {};
  d.forEach((o) => {
    res[o[key]] = o;
  });
  const size = d.length;
  const areUnique = Object.entries(res).length == size;
  return areUnique;
}

export function areOptionsValid(d: QVote.Decision) {
  const areUnique = areUniqueOnKey(d.options, "optName");
  return d.options.length > 1 && areUnique;
}

export function decisionValidate(
  d: QVote.Decision
): {
  nameValid: boolean;
  descriptionValid: boolean;
  optionsValid: boolean;
  registerEndTimeValid: boolean;
  endTimeValid: boolean;
  creditToTokenRatioValid: boolean;
  tokenIdValid: boolean;
  isValid: boolean;
} {
  const res = {
    nameValid: d.name.length > 0,
    descriptionValid: d.description.length > 0,
    optionsValid: areOptionsValid(d),
    registerEndTimeValid: d.registerEndTime >= 0,
    endTimeValid: d.endTime > 0,
    creditToTokenRatioValid: true,
    tokenIdValid: d.tokenId.length > 0,
  };
  const isValid = Object.entries(res).reduce((prev, cur) => {
    if (cur[1] == false) {
      return false;
    } else {
      return prev;
    }
  }, true);
  return { ...res, isValid };
}

export function addMinutes(passToConstructor: any, m: number) {
  const res = new Date(passToConstructor);
  res.setTime(res.getTime() + m * 60 * 1000); // NOTE what's this number?
  return res;
}

export function getInitDecision(): QVote.Decision {
  return {
    name: "",
    description: "",
    options: [],
    registerEndTime: 5,
    endTime: 60,
    tokenId: "REDC",
    creditToTokenRatio: "1",
  };
}
