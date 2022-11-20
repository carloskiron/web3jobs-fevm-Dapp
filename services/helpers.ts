import web3JobsJson from "../assets/web3Jobs.json";

export const CONTRACT_ADDRESS = "0x7241819761460d723fEAE423AcabE04Aee34c9c3"; // Jobs contract
export const CONTRACT_ABI = web3JobsJson.abi; // Jobs contract ABI

export const callRpc = async (method: any, params: any) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        method,
        params
      }),
    };
    const result = await fetch(process.env.NEXT_PUBLIC_API_URL, options);
    return await result.json();
};