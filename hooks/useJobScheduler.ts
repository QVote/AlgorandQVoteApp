import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";
import { isSuccess } from "../scripts";
import type { useContracts } from "./useContracts";
import { BlockchainApi } from "../helpers/BlockchainApi";
import { useQueues } from "./useQueues";
import { longNotification } from "../components/Notifications/LongNotification";

type JobTypes = "Deploy" | "Vote" | "Register" | "DeployQueue" | "Push";

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
    Push: "push_success",
};

function logsHaveEvent(logs: { _eventname: string }[], eventName: string) {
    const logsContain =
        logs.filter((l) => l._eventname == eventName).length != 0;
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
    contractAddressses: ReturnType<typeof useContracts>,
    queueAddresses: ReturnType<typeof useQueues>,
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
        onSuccess?: () => Promise<void>,
        onError?: (e: any) => Promise<void>
    ) {
        try {
            const receipt = await runJob(job);
            if (isSuccess(receipt)) {
                contractAddressses.makeFirst(job.contractAddress);
                longNotification.showNotification(
                    "Success. QVote decision deployed!",
                    "success"
                );
                onSuccess && (await onSuccess());
                updateJob(job.id, { ...job, status: "done" });
            } else {
                longNotification.showNotification("Failed to deploy!", "error");
                throw new Error("Failed to confirm transaction");
            }
        } catch (e) {
            updateJob(job.id, { ...job, status: "error" });
            onError && (await onError(e));
        }
    }

    /**
     * those should be templated
     */
    async function checkDeployQueueCall(
        job: Job,
        onSuccess?: () => Promise<void>,
        onError?: (e: any) => Promise<void>
    ) {
        try {
            const receipt = await runJob(job);
            if (isSuccess(receipt)) {
                queueAddresses.makeFirst(job.contractAddress);
                longNotification.showNotification(
                    "Success. Queue deployed!",
                    "success"
                );
                onSuccess && (await onSuccess());
                updateJob(job.id, { ...job, status: "done" });
            } else {
                longNotification.showNotification(
                    "Failed to deploy queue!",
                    "error"
                );
                throw new Error("Failed to confirm transaction");
            }
        } catch (e) {
            updateJob(job.id, { ...job, status: "error" });
            onError && (await onError(e));
        }
    }

    async function checkContractCall(
        job: Job,
        onSuccess?: () => Promise<void>,
        onError?: (e: any) => Promise<void>
    ) {
        try {
            const receipt = await runJob(job);
            if (
                isContractCallReceiptSuccess(
                    receipt,
                    _JOB_SUCCESS_EVENT[job.type]
                )
            ) {
                longNotification.showNotification(
                    `${job.type} call successful.`,
                    "success"
                );
                onSuccess && (await onSuccess());
                updateJob(job.id, { ...job, status: "done" });
            } else {
                longNotification.showNotification(
                    `${job.type} call failed!`,
                    "error"
                );
                throw new Error("Failed to confirm transaction");
            }
        } catch (e) {
            updateJob(job.id, { ...job, status: "error" });
            onError && (await onError(e));
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
        const isAlreadyIn =
            cookie.jobs.filter((j) => add.id == j.id).length == 1;
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
                        checkDeployCall(j);
                    } else if (j.type == "DeployQueue") {
                        checkDeployQueueCall(j);
                    } else if (
                        j.type == "Register" ||
                        j.type == "Vote" ||
                        j.type == "Push"
                    ) {
                        checkContractCall(j);
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

    return {
        ...cookieState,
        checkDeployCall,
        checkContractCall,
        checkDeployQueueCall,
    };
};
