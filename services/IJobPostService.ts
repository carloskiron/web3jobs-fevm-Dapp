import { BigNumber, ethers } from "ethers";
export interface PublishJobPayload {
  jobId: string;
  bountyAmount: number;
  token?: string;
}

export interface IJobPostService {
  publishJob: (signer: ethers.Signer, payload: PublishJobPayload) => Promise<string>;
  unpublishJob: (signer: ethers.Signer, jobId: string) => void;
  closeJobOffer: (signer: ethers.Signer, jobId: string) => void;
  getMyJobs: (signer: ethers.Signer) => void;
  getAaveWethBalance: (signer: ethers.Signer) => Promise<string>;
  getHiredCount: (signer: ethers.Signer, jobId: string) => Promise<number>;
}
