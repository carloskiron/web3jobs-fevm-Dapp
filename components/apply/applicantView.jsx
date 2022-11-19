import { useEffect, useState } from "react";
import Jobs from "./jobs";
import MyApplications from "./myApplications";

export default function ApplicantView({ signer, jobApplicationServiceInstance, jobPostServiceInstance, searchOptionSelected = true, onChangeOption }) {

    const toggleOption = (e) => {
        e.preventDefault();
        onChangeOption('apply', !searchOptionSelected ? 'search' : 'myApplications');
    }

    return (<div className="px-4 py-8 sm:px-0">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 pb-3 pl-3"> {searchOptionSelected ? "Search" : "My Applications"}</h1>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <a className="whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-700 pr-4" href="#" onClick={toggleOption}> {searchOptionSelected ? "My Applications" : "Search"}</a>
            </div>
        </div>
        <div className="rounded-lg border-2 border-gray-200" >
            {searchOptionSelected ? <Jobs signer={signer} jobApplicationServiceInstance={jobApplicationServiceInstance} /> : <MyApplications signer={signer} jobApplicationServiceInstance={jobApplicationServiceInstance} />}
        </div>
    </div>)
}