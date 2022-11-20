import { ethers } from "ethers";
import {
  ChangeApplicationStatus,
  IJobApplicationService,
} from "./IJobApplicationService";
import { injectable } from "tsyringe";
import { CONTRACT_ABI, CONTRACT_ADDRESS, callRpc } from "./helpers";
import fa from "@glif/filecoin-address";

@injectable()
export class JobApplicationService implements IJobApplicationService {

  async newApplication(signer: ethers.Signer, jobId: string) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const maxPriorityFeePerGas = (await callRpc("eth_maxPriorityFeePerGas", undefined)).result;
    const f4Address = fa.delegatedFromEthAddress(await signer.getAddress()).toString();
    const nonce = await (await callRpc("Filecoin.MpoolGetNonce", [f4Address])).result;
    const tx = await signedContract.newApplication(jobId, {
      maxPriorityFeePerGas,
      maxFeePerGas: "0x2E90EDD000",
      gasLimit: 1000000000, // BlockGasLimit / 10
      nonce,
    });
    await tx.wait();
  }

  async getMyApplicants(signer: ethers.Signer, jobId: string) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const result = await signedContract.getMyApplicants(jobId);
    return result;
  }
  async claimBounty(signer: ethers.Signer, jobId: string) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const maxPriorityFeePerGas = (await callRpc("eth_maxPriorityFeePerGas", undefined)).result;
    const f4Address = fa.delegatedFromEthAddress(await signer.getAddress()).toString();
    const nonce = await (await callRpc("Filecoin.MpoolGetNonce", [f4Address])).result;
    const tx = await signedContract.claimBounty(jobId, {
      maxPriorityFeePerGas,
      maxFeePerGas: "0x2E90EDD000",
      gasLimit: 1000000000, // BlockGasLimit / 10
      nonce,
    });
    await tx.wait();
  }
  async changeApplicationStatus(
    signer: ethers.Signer,
    payload: ChangeApplicationStatus
  ) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const maxPriorityFeePerGas = (await callRpc("eth_maxPriorityFeePerGas", undefined)).result;
    const f4Address = fa.delegatedFromEthAddress(await signer.getAddress()).toString();
    const nonce = await (await callRpc("Filecoin.MpoolGetNonce", [f4Address])).result;
    const tx = await signedContract.changeApplicationStatus(
      payload.applicantAddress,
      payload.jobId,
      payload.status, {
      maxPriorityFeePerGas,
      maxFeePerGas: "0x2E90EDD000",
      gasLimit: 1000000000, // BlockGasLimit / 10
      nonce,
    });
    await tx.wait();
  }
  async getMyApplications(signer: ethers.Signer) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const value = await signedContract.getMyApplications();
    return value;
  }
  async getApplicants(signer: ethers.Signer, applicantAddress: string, jobId: string, index: number) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const value = await signedContract.Applicants(
      applicantAddress,
      jobId,
      index
    );
    return value;
  }
  async canClaimBounty(
    signer: ethers.Signer,
    applicantAddress: string,
    jobId: string
  ): Promise<boolean> {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const value = await signedContract.canClaimBounty(
      applicantAddress,
      jobId
    );
    return Boolean(value);
  }
}
