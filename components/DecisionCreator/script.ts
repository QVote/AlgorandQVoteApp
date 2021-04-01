import { QVote } from "../../types";

function decisionValidate(createDS: QVote.Decision) {
  if (!checkName()) {
    return false;
  } else if (!checkDesc()) {
    return false;
  } else if (!checkPosition()) {
    return false;
  } else if (!checkEndTime()) {
    return false;
  } else if (!checkRegisterTime()) {
    return false;
  }
  return true;
  function checkRegisterTime() {
    return createDS.registerEndTime > Date.now();
  }
  function checkEndTime() {
    return createDS.endTime > Date.now();
  }
  function checkName() {
    return createDS.name.length > 0;
  }
  function checkDesc() {
    return createDS.description.length > 0;
  }
  function checkPosition() {
    if (createDS.options.length > 1) {
      return true;
    } else {
      return false;
    }
  }
}

function addMinutes(passToConstructor: any, m: number) {
  const res = new Date(passToConstructor);
  res.setTime(res.getTime() + m * 60 * 1000); // NOTE what's this number?
  return res;
}

function getInitDecision(): QVote.Decision {
  const register = addMinutes(new Date(Date.now()), 5);
  const end = addMinutes(new Date(Date.now()), 10);
  return {
    name: "",
    description: "",
    options: [],
    registerEndTime: register.getTime(),
    endTime: end.getTime(),
  };
}

export { addMinutes, decisionValidate, getInitDecision };
