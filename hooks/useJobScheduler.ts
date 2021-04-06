import { MutableRefObject, useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";
import { isSuccess } from "../scripts";
import type { useContractAddresses } from "./useContractAddresses";
import type { LongNotificationHandle } from "../components/MainFrame/LongNotification";
import { BlockchainApi } from "../helpers/BlockchainApi";

type JobTypes = "Deploy" | "Vote" | "Register";

type Job = {
  id: string;
  name: string;
  status: "waiting" | "inProgress" | "done" | "error";
  type: JobTypes;
  contractAddress: string;
};

type JobsCookie = { jobs: Job[]; someInProgress: boolean };

const init: JobsCookie = {
  jobs: [],
  someInProgress: false,
};

const _JOB_SUCCESS_EVENT: Partial<Record<JobTypes, string>> = {
  Register: "owner_register_success",
  Vote: "vote_success",
};

function logsHaveEvent(logs: { _eventname: string }[], eventName: string) {
  const logsContain = logs.filter((l) => l._eventname == eventName).length != 0;
  return logsContain;
}

function isContractCallReceiptSuccess(
  receipt: { event_logs?: { _eventname: string }[] },
  eventName: string
) {
  const success = isSuccess(receipt);
  if (receipt.event_logs && success) {
    return logsHaveEvent(receipt.event_logs, eventName);
  }
  return false;
}

export const useJobScheduler = (
  blockchainInfo: BlockchainInfo,
  contractAddressses: ReturnType<typeof useContractAddresses>,
  longNotification: MutableRefObject<LongNotificationHandle>,
  connected: boolean
) => {
  const [cookieState, setCookieState] = useState<JobsCookie>(init);

  async function runJob(job: Job) {
    pushJob(job);
    updateJob(job.id, { ...job, status: "inProgress" });
    //RETRY UNTIL WE HAVE A RECEIPT
    const receipt = await BlockchainApi.checkReceipt(job.id);
    return receipt;
  }

  /**
   * Run this only when the user is connected to wallet
   */
  async function checkDeployCall(
    job: Job,
    onSuccess: () => Promise<void>,
    onError: (e: any) => Promise<void>
  ) {
    try {
      const receipt = await runJob(job);
      if (isSuccess(receipt)) {
        contractAddressses.pushAddress(job.contractAddress);
        longNotification.current.setSuccess();
        longNotification.current.onShowNotification(
          "Success. QVote decision deployed!"
        );
        await onSuccess();
        updateJob(job.id, { ...job, status: "done" });
      } else {
        longNotification.current.setError();
        longNotification.current.onShowNotification("Failed to deploy!");
        throw new Error("Failed to confirm transaction");
      }
    } catch (e) {
      updateJob(job.id, { ...job, status: "error" });
      await onError(e);
    }
  }

  async function checkContractCall(
    job: Job,
    onSuccess: () => Promise<void>,
    onError: (e: any) => Promise<void>
  ) {
    try {
      const receipt = await runJob(job);
      if (isContractCallReceiptSuccess(receipt, _JOB_SUCCESS_EVENT[job.type])) {
        longNotification.current.setSuccess();
        longNotification.current.onShowNotification(
          `${job.type} call successful.`
        );
        await onSuccess();
        updateJob(job.id, { ...job, status: "done" });
      } else {
        longNotification.current.setError();
        longNotification.current.onShowNotification(`${job.type} call failed!`);
        throw new Error("Failed to confirm transaction");
      }
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
    return next.reduce(
      (prev, cur) => (cur.status == "inProgress" ? true : prev),
      false
    );
  }

  function pushJob(add: Job) {
    const cookie = getCookie();
    const isAlreadyIn = cookie.jobs.filter((j) => add.id == j.id).length == 1;
    if (!isAlreadyIn) {
      const jobs = cookie.jobs;
      //hold only most recent 9 transactions
      if (jobs.length > 8) {
        jobs.pop();
      }
      const next = [add, ...jobs];
      setCookie({ ...cookie, jobs: next });
    }
  }

  function onChange() {
    setCookie(getCookie());
  }

  /**
   * Essentially regenerate the jobs that were in progress but the site was
   * refreshed
   */
  useEffect(() => {
    if (connected) {
      getCookie().jobs.map((j) => {
        if (j.status == "waiting" || j.status == "inProgress") {
          if (j.type == "Deploy") {
            checkDeployCall(
              j,
              async () => {},
              async () => {}
            );
          } else if (j.type == "Register" || j.type == "Vote") {
            checkContractCall(
              j,
              async () => {},
              async () => {}
            );
          }
        }
      });
    }
  }, [connected]);

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

  return { ...cookieState, checkDeployCall, checkContractCall };
};
