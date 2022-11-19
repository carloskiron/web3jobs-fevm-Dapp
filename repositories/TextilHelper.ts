
import { PrivateKey } from "@textile/hub";
import { Client, Identity, KeyInfo, ThreadID, Where } from "@textile/hub";
import { injectable } from "tsyringe";

@injectable()
export class TextilHelper {

  private key: KeyInfo = {
    key: process.env.NEXT_PUBLIC_TEXTILE
  };

  private jobPostingSchema = {
    title: "JobPosting",
    type: "object",
    required: ["_id"],
    properties: {
      _id: {
        type: "string",
        description: "The instance's id.",
      },
      title: {
        type: "string"
      },
      description: {
        type: "string"
      },
      company: {
        type: "string"
      },
      publishedId: {
        type: "string"
      },
      recruiterAddress: {
        type: "string"
      },
      location: {
        type: "string"
      },
      salaryRange: {
        type: "string"
      },
      positionsToFill: {
        type: "integer",
        minimum: 0,
      },
      bountyAmount: {
        type: "number",
        minimum: 0,
      },
      createdAt: {
        type: "string",
      },
      publishedAt: {
        type: "string"
      },
      closedAt: {
        type: "string"
      },
      isClosed: {
        type: "boolean"
      },
      isPublished: {
        type: "boolean"
      },
    },
  }

  private jobApplicationSchema = {
    title: "JobApplication",
    type: "object",
    required: ["_id"],
    properties: {
      _id: {
        type: "string",
        description: "The instance's id.",
      },
      applicantName: {
        type: "string"
      },
      jobPostingId: {
        type: "string"
      },
      title: {
        type: "string"
      },
      company: {
        type: "string"
      },
      publishedId: {
        type: "string"
      },
      applicantAddress: {
        type: "string"
      },
      recruiterAddress: {
        type: "string"
      },
      createdAt: {
        type: "string",
      }
    },
  }


  private client: Client;

  //database identifier for web3jobsDatabase
  threadId: ThreadID = new ThreadID(new Uint8Array([1, 85, 206, 156, 111, 8, 96, 207, 127, 58, 131, 33, 169, 84, 159, 15, 4, 179, 151, 124, 151, 19, 168, 163, 157, 128, 52, 252, 192, 37, 123, 229, 218, 29, 53]));

  private async getIdentity(): Promise<PrivateKey> {
    /** Restore any cached user identity first */
    const cached = localStorage.getItem("user-private-identity");
    if (cached !== null) {
      /** Convert the cached identity string to a PrivateKey and return */
      return PrivateKey.fromString(cached);
    }
    /** No cached identity existed, so create a new one */
    const identity = await PrivateKey.fromRandom();
    /** Add the string copy to the cache */
    localStorage.setItem("user-private-identity", identity.toString());
    /** Return the random identity */
    return identity;
  }

  private async getClient() {

    if (this.client) return this.client;

    this.client = await Client.withKeyInfo(this.key);
    await this.client.getToken(await this.getIdentity());
    return this.client;
  }

  async newToken(client: Client, user: PrivateKey) {
    const token = await client.getToken(user);
    return token;
  }

  async createDB(client: Client) {
    const thread: ThreadID = await client.newDB(this.threadId, 'web3jobsData');
    return thread;
  }

  async createjobPostingCollection() {
    const client = await this.getClient();
    return await (client).newCollection(this.threadId, { name: 'jobPosting', schema: this.jobPostingSchema })
  }

  async updatejobPostingCollection() {
    const client = await this.getClient();
    return await (client).updateCollection(this.threadId, { name: 'jobPosting', schema: this.jobPostingSchema })
  }

  async createJobApplicationCollection() {
    const client = await this.getClient();
    return await (client).newCollection(this.threadId, { name: 'JobApplication', schema: this.jobApplicationSchema })
  }

  async updateJobApplicationCollection() {
    const client = await this.getClient();
    return await (client).updateCollection(this.threadId, { name: 'JobApplication', schema: this.jobApplicationSchema })
  }

  async createJobPost(jobPosting: any) {
    const client = await this.getClient();
    return await client.create(this.threadId, 'jobPosting', [jobPosting]);
  }

  async updateJobPost(jobPosting: any) {
    const client = await this.getClient();
    return await client.save(this.threadId, 'jobPosting', [jobPosting]);
  }

  async createJobApplication(jobApplication: any) {
    const client = await this.getClient();
    return await client.create(this.threadId, 'JobApplication', [jobApplication]);
  }

  async updateJobApplication(jobApplication: any) {
    const client = await this.getClient();
    return await client.save(this.threadId, 'JobApplication', [jobApplication]);
  }

  async queryJobPostsByRecruiter (recruiterAddress: string) {
    const query = new Where('recruiterAddress').eq(recruiterAddress);
    const client = await this.getClient();
    return await client.find<any>(this.threadId, 'jobPosting', query)
  }

  async queryApplicantionsByRecruiter (recruiterAddress: string) {
    const query = new Where('recruiterAddress').eq(recruiterAddress);
    const client = await this.getClient();
    return await client.find<any>(this.threadId, 'JobApplication', query)
  }

  async queryMyApplications (applicantAddress: string) {
    const query = new Where('applicantAddress').eq(applicantAddress);
    const client = await this.getClient();
    return await client.find<any>(this.threadId, 'JobApplication', query)
  }

  async queryAllPublishedJobPosts () {
    const query = new Where('isPublished').eq(true);
    const client = await this.getClient();
    return await client.find<any>(this.threadId, 'jobPosting', query)
  }

}