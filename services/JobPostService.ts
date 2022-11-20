import { BigNumber, ethers } from "ethers";
import { IJobPostService, PublishJobPayload } from "./IJobPostService";
import { injectable } from "tsyringe";
import { CONTRACT_ABI, CONTRACT_ADDRESS, callRpc } from "./helpers";
import fa from "@glif/filecoin-address";

@injectable()
export class JobPostService implements IJobPostService {

  async publishJob(signer: ethers.Signer, payload: PublishJobPayload) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const publishedId = ethers.utils.formatBytes32String(
      payload.jobId.substring(0, 10)
    );

    const maxPriorityFeePerGas = (await callRpc("eth_maxPriorityFeePerGas", undefined)).result;
    const f4Address = fa.delegatedFromEthAddress(await signer.getAddress()).toString();
    const nonce = await (await callRpc("Filecoin.MpoolGetNonce", [f4Address])).result;

    const tx = await signedContract.publishJob(
      publishedId,
      payload.token
        ? ethers.utils.parseEther(`${payload.bountyAmount}`)
        : ethers.utils.parseEther("0"),
      payload.token ??
      ethers.utils.getAddress("0x0000000000000000000000000000000000000000"),
      {
        maxPriorityFeePerGas,
        maxFeePerGas: "0x2E90EDD000",
        gasLimit: 1000000000, // BlockGasLimit / 10
        nonce,
        value: !payload.token
          ? ethers.utils.parseEther(`${payload.bountyAmount}`)
          : undefined,
      }
    );

    await tx.wait();
    return publishedId;
  }
  async unpublishJob(signer: ethers.Signer, jobId: string) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const maxPriorityFeePerGas = (await callRpc("eth_maxPriorityFeePerGas", undefined)).result;
    const f4Address = fa.delegatedFromEthAddress(await signer.getAddress()).toString();
    const nonce = await (await callRpc("Filecoin.MpoolGetNonce", [f4Address])).result;
    const tx = await signedContract.unpublishJob(jobId, {
      maxPriorityFeePerGas,
      maxFeePerGas: "0x2E90EDD000",
      gasLimit: 1000000000, // BlockGasLimit / 10
      nonce,
    });
    await tx.wait();

  }
  async closeJobOffer(signer: ethers.Signer, jobId: string) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const maxPriorityFeePerGas = (await callRpc("eth_maxPriorityFeePerGas", undefined)).result;
    const f4Address = fa.delegatedFromEthAddress(await signer.getAddress()).toString();
    const nonce = await (await callRpc("Filecoin.MpoolGetNonce", [f4Address])).result;
    const tx = await signedContract.closeJobOffer(jobId, {
      maxPriorityFeePerGas,
      maxFeePerGas: "0x2E90EDD000",
      gasLimit: 1000000000, // BlockGasLimit / 10
      nonce,
    });
    await tx.wait();
  }
  async getMyJobs(signer: ethers.Signer) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const value = await signedContract.getMyJobs();
    return value;
  }
  async getAaveWethBalance(signer: ethers.Signer) {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const balanceBN = await signedContract.getAaveBalance();
    return ethers.utils.formatEther(balanceBN);
  }
  async getHiredCount(signer: ethers.Signer, jobId: string): Promise<number> {
    const signedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const countBN: BigNumber = await signedContract.Hired(jobId);
    return countBN.toNumber();
  }
}
