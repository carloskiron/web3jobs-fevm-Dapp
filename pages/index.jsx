import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import { container } from "tsyringe";
import ApplicantView from "../components/apply/applicantView";
import Header from "../components/header";
import RecruiterView from "../components/recruit/recruiterView";
import { JobApplicationService } from "../services/JobApplicationService";
import { JobPostService } from "../services/JobPostService";

export default function Home() {

  //get the service instance
  const jobApplicationServiceInstance = container.resolve(JobApplicationService);
  const [contractLendingBalance, setContractLendingBalance] = useState(undefined);
  const jobPostServiceInstance = container.resolve(JobPostService);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState("");
  const [provider, setProvider] = useState(undefined);
  const [isSupportedNetwork, setIsSupportedNetwork] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isApplicant, setIsApplicant] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(true);
  const [selectedOption, setSelectedOption] = useState({
    view: "apply",
    option: "search"
  });

  const onChainChanged = (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    setIsConnected(false);
    window.location.reload();
  }

  const onaAccountsChanged = (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    setIsConnected(false);
    window.location.reload();
  }

  async function connect() {

    if (!window?.ethereum?.isMetaMask) setHasMetaMask(false);

    console.info("connecting to metamask");
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const supportedNetwork = chainId === "0x5"; //Goerli
        setIsSupportedNetwork(supportedNetwork);
        if (supportedNetwork) {
          await ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setIsConnected(true);
          setProvider(provider);
          setSigner(provider.getSigner());
          setSignerAddress(await provider.getSigner().getAddress());
          setContractLendingBalance(await jobPostServiceInstance.getAaveWethBalance());
        }

        ethereum.on('accountsChanged', onaAccountsChanged);
        ethereum.on('chainChanged', onChainChanged);

      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
  }

  useEffect(() => {
    connect();
    return () => {
      ethereum.removeListener('accountsChanged', onaAccountsChanged);
      ethereum.removeListener('chainChanged', onChainChanged);
    };

  }, []);

  const onChangeOption = (view, option) => {
    setSelectedOption({ view, option });
  }

  return (
    <>
      <Head>
        <title>Web3 Jobs</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <>
        <Header onChangeOption={onChangeOption} onConnect={connect} connectedAddress={signerAddress} isConnected={isConnected} />
        <main className="pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
            {<div className="mx-auto max-w-4xl">
              {selectedOption.view === "apply" ?
                <ApplicantView onChangeOption={onChangeOption} searchOptionSelected={selectedOption.option === 'search'} signer={signer} jobApplicationServiceInstance={jobApplicationServiceInstance} jobPostServiceInstance={jobPostServiceInstance} /> :
                <RecruiterView onChangeOption={onChangeOption} jobPostingsOptionSelected={selectedOption.option === 'jobPostings'} signer={signer} jobApplicationServiceInstance={jobApplicationServiceInstance} jobPostServiceInstance={jobPostServiceInstance} />}
            </div>}
            {!hasMetaMask && <div className="alert alert-danger" role="alert"> You need Metamask to use this app.</div>}
            {!isSupportedNetwork && <div className="alert alert-danger" role="alert"> Web3 jobs is currently in beta. Only available on Goerli Tesnet. Change your metamask network!</div>}
            <footer className="bg-white">
              <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                <div className="flex space-x-6 md:order-2">
                  <div className="text-sm text-gray-500">
                    <p className="text-base leading-6 text-indigo-400">
                      Aave Balance: <span className="text-base leading-6 text-gray-500">{`${contractLendingBalance ? parseFloat(contractLendingBalance).toFixed(4) + " Ether" : "..."}`}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
                  &copy; 2022 Web3Jobs, Inc. All rights reserved.
                </p>
              </div>
            </footer>
          </div>

        </main>


      </>
    </>
  );
}
