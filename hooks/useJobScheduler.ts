import { MutableRefObject, useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";
import { retryLoop, isSuccess } from "../scripts";
import type { useContractAddresses } from "./useContractAddresses";
import type { LongNotificationHandle } from "../components/MainFrame/LongNotification";

type Job = {
  id: string;
  name: string;
  status: "waiting" | "inProgress" | "done" | "error";
  type: "Deploy" | "Vote";
  contractAddress: string;
};

type JobsCookie = { jobs: Job[]; someInProgress: boolean };

const init: JobsCookie = {
  jobs: [],
  someInProgress: false,
};

export const useJobScheduler = (
  blockchainInfo: BlockchainInfo,
  contractAddressses: ReturnType<typeof useContractAddresses>,
  longNotification: MutableRefObject<LongNotificationHandle>,
  connected: boolean
) => {
  const [cookieState, setCookieState] = useState<JobsCookie>(init);

  /**
   * Run this only when the user is connected to wallet
   */
  async function checkReceiptDeploy(
    job: Job,
    onSuccess: () => Promise<void>,
    onError: (e: any) => Promise<void>
  ) {
    pushJob(job);
    try {
      const zilPay = window.zilPay;
      const zilPayBlockchainApi = zilPay.blockchain;
      updateJob(job.id, { ...job, status: "inProgress" });
      //RETRY UNTIL WE HAVE A RECEIPT
      const receipt = await retryLoop(15, 5000, async () => {
        const resTx = await zilPayBlockchainApi.getTransaction(job.id);
        if (resTx.receipt) {
          return { res: resTx.receipt, shouldRetry: false };
        }
        return { res: undefined, shouldRetry: true };
      });
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
      const next = [add, ...cookie.jobs];
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
            checkReceiptDeploy(
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

  return { ...cookieState, checkReceiptDeploy };
};
