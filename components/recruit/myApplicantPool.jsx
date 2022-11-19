import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { container } from "tsyringe";
import { TextilHelper } from "../../repositories/TextilHelper";
import { ApplicationStatus } from "../../services/IJobApplicationService"

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MyApplicantPool({ signer, jobApplicationServiceInstance }) {

    const [applicants, setApplicants] = useState([]);
    const [processing, setProcessing] = useState(undefined);
    const [loadingStatuses, setLoadingStatuses] = useState(false);
    const textilHelper = container.resolve(TextilHelper);
    const [currentTab, setCurrentTab] = useState(-1);

    const queryMyApplicants = async () => {
        try {
            console.log('Loading applications...');
            const result = await textilHelper.queryApplicantionsByRecruiter(await signer.getAddress());
            console.log('Loading applications...', result);

            let newList = result.map(applicant => {
                return { ...applicant, status: -1 };
            });

            setApplicants(newList);
            setLoadingStatuses(true);
            for (let i = 0; i < newList.length; i++) {
                let status = ApplicationStatus.SCREENING;
                try {
                    status = await jobApplicationServiceInstance.getApplicants(newList[i].applicantAddress, newList[i].publishedId, 0);
                    console.log('status', status);
                } catch (error) {
                    console.log("Not found");
                }
                newList[i].status = status;
            }
            setApplicants(newList);

        } catch (e) {
            console.error(e);
        }

        setLoadingStatuses(false);
    }

    const onChangStatus = async (application, newStatus) => {
        try {
            console.log(application);
            setProcessing(application._id);
            await jobApplicationServiceInstance.changeApplicationStatus(signer, {
                jobId: application.publishedId,
                applicantAddress: application.applicantAddress,
                status: parseInt(newStatus)
            });
            let newApplicantsList = [...applicants.filter(applicant => applicant._id === application._id)];
            const newApplication = { ...application, status: parseInt(newStatus) };
            setApplicants([newApplication, ...newApplicantsList]);
        } catch (e) {
            console.error(e);
        }
        setProcessing(undefined);
    }

    useEffect(() => {

        if (textilHelper && signer) queryMyApplicants();

    }, []);

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {signer ? <>
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <span className="isolate inline-flex rounded-md shadow-sm">
                            <button
                                type="button"
                                onClick={() => setCurrentTab(-1)}
                                className={currentTab !== -1 ? "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentTab(0)}
                                disabled={loadingStatuses}
                                className={currentTab !== 0 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                            >
                                Screening
                            </button>
                            <button
                                type="button"
                                disabled={loadingStatuses}
                                onClick={() => setCurrentTab(1)}
                                className={currentTab !== 1 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                            >
                                Interview
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentTab(2)}
                                disabled={loadingStatuses}
                                className={currentTab !== 2 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}>
                                Assessment
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentTab(3)}
                                disabled={loadingStatuses}
                                className={currentTab !== 3 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}>
                                Final Interview
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentTab(4)}
                                disabled={loadingStatuses}
                                className={currentTab !== 4 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}>
                                Hired
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentTab(5)}
                                disabled={loadingStatuses}
                                className={currentTab !== 5 ? "relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                    "relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                            >
                                Rejected
                            </button>
                        </span>
                    </div>
                    <div className="mt-4 mr-2 sm:mt-0 sm:ml-16 sm:flex-none">

                    </div>
                </div>
                <div className="-mx-4 mt-6 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Address
                                </th>
                                <th
                                    scope="col"
                                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                    Position
                                </th>
                                <th
                                    scope="col"
                                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                    Applied
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.filter(element => currentTab === -1 || element.status === currentTab).map((applicant, applicantIdx) => (
                                <tr key={`${applicantIdx}_${applicant._id}`}>
                                    <td
                                        className={classNames(
                                            applicantIdx === 0 ? '' : 'border-t border-transparent',
                                            'relative py-4 pl-4 sm:pl-6 pr-3 text-smˇˇ'
                                        )}
                                    >
                                        <div className="font-medium text-gray-900">
                                            <span title='applicant.applicantAddress'>...{applicant.applicantAddress.substring(applicant.applicantAddress.length - 15, applicant.applicantAddress.length)}</span>
                                        </div>
                                        {applicantIdx !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
                                    </td>
                                    <td
                                        className={classNames(
                                            applicantIdx === 0 ? '' : 'border-t border-gray-200',
                                            'hidden px-3 py-3.5 text-sm text-left text-gray-500 lg:table-cell'
                                        )}
                                    >
                                        {applicant.title}
                                    </td>
                                    <td
                                        className={classNames(
                                            applicantIdx === 0 ? '' : 'border-t border-gray-200',
                                            'hidden px-3 py-3.5 text-sm text-left text-gray-500 lg:table-cell'
                                        )}
                                    >
                                        <Moment date={applicant.createdAt} fromNow={true} />
                                    </td>

                                    <td
                                        className={classNames(
                                            applicantIdx === 0 ? '' : 'border-t border-transparent',
                                            'relative py-3.5 pl-3 pr-4 sm:pr-6 text-center text-sm font-medium'
                                        )}
                                    >
                                        {applicant.status === -1 ? <span>Loading...</span> : processing === applicant._id ? <span>Updating...</span> :
                                            <select
                                                id="location"
                                                name="location"
                                                className="mt-1 block w-full text-center rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                defaultValue={applicant.status}
                                                disabled={processing === applicant._id}
                                                onChange={e => onChangStatus(applicant, e.target.value)}
                                            >
                                                <option value={ApplicationStatus.SCREENING}>SCREENING</option>
                                                <option value={ApplicationStatus.FIRST_INTERVIEW}>FIRST INTERVIEW</option>
                                                <option value={ApplicationStatus.TECHNICAL_TEST}>TECHNICAL TEST</option>
                                                <option value={ApplicationStatus.FINAL_INTERVIEW}>FINAL INTERVIEW</option>
                                                <option value={ApplicationStatus.HIRED}>HIRED</option>
                                                <option value={ApplicationStatus.REJECTED}>REJECTED</option>
                                            </select>}
                                        {applicantIdx !== 0 ? <div className="absolute right-6 left-0 -top-px h-px bg-gray-200" /> : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </> : <div className="alert alert-danger" role="alert"> You need a connection to use this feature.</div>}
        </div>
    )
}
