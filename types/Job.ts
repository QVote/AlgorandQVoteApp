export type JobTypes = "Deploy" | "Vote" | "Register" | "DeployQueue" | "Push";
export type Job = {
    id: string;
    name: string;
    status: "waiting" | "inProgress" | "done" | "error";
    type: JobTypes;
    contractAddress: string;
};
