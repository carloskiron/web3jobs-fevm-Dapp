import { useEffect, useState } from "react";
import JobPostings from "./jobsPostings";
import MyApplicantPool from "./myApplicantPool";

export default function RecruiterView({ signer, jobApplicationServiceInstance, jobPostServiceInstance, jobPostingsOptionSelected = true, onChangeOption }) {

    const newJobPost = () => {
        fetch("/api/jobs/jobPost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: "J01",
                title: "Software Engineer",
                description: "This is a job post for a software engineer",
                location: "Remote",
                salary: 100000,
                bounty: 10000,
                recruiter: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
            })
        }).then((res) => res.json()).then((res) => console.log("saviong a new job post", res));
    }

    const toggleOption = (e) => {
        e.preventDefault();
        onChangeOption('recruit', !jobPostingsOptionSelected ? 'jobPostings' : 'myApplicantPool');
    }

    return (<div className="px-4 py-8 sm:px-0">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 pb-3 pl-3"> {jobPostingsOptionSelected ? "Job Postings" : "My Applicant Pool"}</h1>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <a className="whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-700 pr-4" href="#" onClick={toggleOption}> {jobPostingsOptionSelected ? "My Applicant Pool" : "Job Postings"}</a>
            </div>
        </div>
        <div className="rounded-lg border-2 border-gray-200" >
            {jobPostingsOptionSelected ? <JobPostings signer={signer} jobPostServiceInstance={jobPostServiceInstance} /> : <MyApplicantPool signer={signer} jobApplicationServiceInstance={jobApplicationServiceInstance} />}
        </div>
    </div>)
}