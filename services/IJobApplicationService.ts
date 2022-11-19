import { ethers } from "ethers";

export enum ApplicationStatus {
  SCREENING,
  FIRST_INTERVIEW,
  TECHNICAL_TEST,
  FINAL_INTERVIEW,
  HIRED,
  REJECTED,
}
export interface ChangeApplicationStatus {
  applicantAddress: string;
  jobId: string;
  status: ApplicationStatus;
}

export interface IJobApplicationService {
  newApplication: (signer: ethers.Signer, jobId: string) => void;
  getMyApplications: (signer: ethers.Signer) => void;

  getMyApplicants: (jobId: string) => void;
  canClaimBounty: (applicantAddress: string, jobId: string) => Promise<boolean>;
  claimBounty: (signer: ethers.Signer, jobId: string) => void;
  changeApplicationStatus: (
    signer: ethers.Signer,
    payload: ChangeApplicationStatus
  ) => void;
  getApplicants: (
    applicantAddress: string,
    jobId: string,
    index: number
  ) => void;
}
