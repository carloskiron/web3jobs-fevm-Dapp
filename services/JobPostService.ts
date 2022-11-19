import { BigNumber, ethers, providers } from "ethers";
import { IJobPostService, PublishJobPayload } from "./IJobPostService";
import { injectable } from "tsyringe";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./constants";

@injectable()
export class JobPostService implements IJobPostService {
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

  async publishJob(signer: ethers.Signer, payload: PublishJobPayload) {
    const signedContract = this.jobsContract.connect(signer);
    const publishedId = ethers.utils.formatBytes32String(
      payload.jobId.substring(0, 10)
    );
    const tx = await signedContract.publishJob(
      publishedId,
      payload.token
        ? ethers.utils.parseEther(`${payload.bountyAmount}`)
        : ethers.utils.parseEther("0"),
      payload.token ??
        ethers.utils.getAddress("0x0000000000000000000000000000000000000000"),
      {
        value: !payload.token
          ? ethers.utils.parseEther(`${payload.bountyAmount}`)
          : undefined,
      }
    );
    await tx.wait();
    return publishedId;
  }
  async unpublishJob(signer: ethers.Signer, jobId: string) {
    const signedContract = this.jobsContract.connect(signer);
    const tx = await signedContract.unpublishJob(jobId);
    const receipt = await tx.wait();
    return receipt;
  }
  async closeJobOffer(signer: ethers.Signer, jobId: string) {
    const signedContract = this.jobsContract.connect(signer);
    const tx = await signedContract.closeJobOffer(jobId);
    const receipt = await tx.wait();
    return receipt;
  }
  async getMyJobs(signer: ethers.Signer) {
    const signedContract = this.jobsContract.connect(signer);
    const value = await signedContract.getMyJobs();
    return value;
  }
  async getAaveWethBalance() {
    const balanceBN = await this.jobsContract.getAaveBalance();
    return ethers.utils.formatEther(balanceBN);
  }
  async getHiredCount(jobId: string): Promise<number> {
    const countBN: BigNumber = await this.jobsContract.Hired(jobId);
    return countBN.toNumber();
  }
}
