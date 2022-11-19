import { ethers, providers } from "ethers";
import {
  ChangeApplicationStatus,
  IJobApplicationService,
} from "./IJobApplicationService";
import { injectable } from "tsyringe";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./constants";

@injectable()
export class JobApplicationService implements IJobApplicationService {
  // init
  provider: ethers.providers.Provider;
  jobsContract: ethers.Contract;
  jobsSignedContract: ethers.Contract;

  constructor() {
    this.provider = new providers.EtherscanProvider("goerli", process.env.NEXT_PUBLIC_PROVIDER);

    this.jobsContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.provider
    );
  }
  async newApplication(signer: ethers.Signer, jobId: string) {
    const signedContract = this.jobsContract.connect(signer);
    const tx = await signedContract.newApplication(jobId);
    const receipt = await tx.wait();
    return receipt;
  }
  async getMyApplicants(jobId: string) {
    const result = await this.jobsContract.getMyApplicants(jobId);
    return result;
  }
  async claimBounty(signer: ethers.Signer, jobId: string) {
    const signedContract = this.jobsContract.connect(signer);
    const tx = await signedContract.claimBounty(jobId);
    const receipt = await tx.wait();
    return receipt;
  }
  async changeApplicationStatus(
    signer: ethers.Signer,
    payload: ChangeApplicationStatus
  ) {
    const signedContract = this.jobsContract.connect(signer);
    const tx = await signedContract.changeApplicationStatus(
      payload.applicantAddress,
      payload.jobId,
      payload.status
    );
    const receipt = await tx.wait();
    return receipt;
  }
  async getMyApplications(signer: ethers.Signer) {
    const signedContract = this.jobsContract.connect(signer);
    const value = await signedContract.getMyApplications();
    return value;
  }
  async getApplicants(applicantAddress: string, jobId: string, index: number) {
    const value = await this.jobsContract.Applicants(
      applicantAddress,
      jobId,
      index
    );
    return value;
  }
  async canClaimBounty(
    applicantAddress: string,
    jobId: string
  ): Promise<boolean> {
    const value = await this.jobsContract.canClaimBounty(
      applicantAddress,
      jobId
    );
    return Boolean(value);
  }
}
