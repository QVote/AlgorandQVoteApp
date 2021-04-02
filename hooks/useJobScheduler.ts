import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";

type Job = {
  id: string;
  name: string;
  status: "waiting" | "inProgress" | "done" | "error";
  details: string;
};

type JobsCookie = { jobs: Job[]; someInProgress: boolean };

const init: JobsCookie = {
  jobs: [],
  someInProgress: false,
};

export const useJobScheduler = (blockchainInfo: BlockchainInfo) => {
  const [cookieState, setCookieState] = useState<JobsCookie>(init);

  async function runJob(
    job: Job,
    jobFunction: () => Promise<void>,
    onError: (e: any) => Promise<void>
  ) {
    pushJob(job);
    try {
      updateJob(job.id, { ...job, status: "inProgress" });
      await jobFunction();
      updateJob(job.id, { ...job, status: "done" });
    } catch (e) {
      updateJob(job.id, { ...job, status: "error" });
      await onError(e);
    }
  }

  function updateJob(id: string, newVal: Job) {
    const next = getCookie().jobs.map((j) => (j.id == id ? newVal : j));
    setCookie({ jobs: next, someInProgress: false });
  }

  function thereAreInProgress(next: Job[]) {
    console.log(next);
    return next.reduce(
      (prev, cur) => (cur.status == "inProgress" ? true : prev),
      false
    );
  }

  function pushJob(add: Job) {
    const cookie = getCookie();
    const next = [add, ...cookie.jobs];
    setCookie({ ...cookie, jobs: next });
  }

  function onChange() {
    setCookie(getCookie());
  }

  useEffect(() => {
    onChange();
  }, [blockchainInfo.name]);

  function getCookieName() {
    const baseName = "ZilliqaQvoteContractJobs-";
    return baseName + blockchainInfo.name;
  }

  function setCookie(val: JobsCookie) {
    const toSet: JobsCookie = {
      ...val,
      someInProgress: thereAreInProgress(val.jobs),
    };
    Cookie.set(getCookieName(), toSet, { path: "/" });
    setCookieState(toSet);
  }

  function getCookie(): JobsCookie {
    return Cookie.getJSON(getCookieName()) || init;
  }

  return { ...cookieState, runJob };
};
