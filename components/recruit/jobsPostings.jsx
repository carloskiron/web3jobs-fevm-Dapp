import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import NewJobPost from './newJobPost';
import { container } from "tsyringe";
import { TextilHelper } from "../../repositories/TextilHelper";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function JobPostings({ signer, jobPostServiceInstance }) {

    const [newJobPost, setNewJobPost] = useState(false);
    const [jobPostings, setJobPostings] = useState([]);
    const [currentTab, setCurrentTab] = useState(1);
    const textilHelper = container.resolve(TextilHelper);
    const [processing, setProcessing] = useState(false);

    const onSave = async (jobPost) => {
        try {
            console.log('saving a new job post', jobPost);
            const result = await textilHelper.createJobPost(jobPost);
            setJobPostings([jobPost, ...jobPostings]);
        } catch (e) {
            console.error(e);
        }
        setNewJobPost(false);
    }

    const onPublish = async (jobPost) => {
        try {
            setProcessing(true);
            const newJobPost = { ...jobPost };

            const publishedId = await jobPostServiceInstance.publishJob(signer, {
                jobId: newJobPost._id,
                bountyAmount: newJobPost.bountyAmount,
            });

            newJobPost.publishedId = publishedId;
            newJobPost.publishedAt = new Date().toISOString();
            newJobPost.isPublished = true;
            console.log('updating job post', newJobPost);
            const result = await textilHelper.updateJobPost(newJobPost);
            queryJobPosts();
            setCurrentTab(1);
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
    }

    const onClose = async (jobPost) => {
        try {
            setProcessing(true);
            const newJobPost = { ...jobPost };
            //TODO call smart contract method tp publish and setup the publishedId
            await jobPostServiceInstance.closeJobOffer(signer, jobPost.publishedId);
            newJobPost.closedAt = new Date().toISOString();
            newJobPost.isClosed = true;
            newJobPost.isPublished = false;
            console.log('updating job post', newJobPost);
            const result = await textilHelper.updateJobPost(newJobPost);
            queryJobPosts();
            setCurrentTab(2);
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
    }

    const queryJobPosts = async () => {
        try {
            console.log('Loading jobs...');
            const address = await signer.getAddress();
            const result = await textilHelper.queryJobPostsByRecruiter(address);
            setJobPostings(result);

            let newList = result.map(jobPost => {
                return { ...jobPost, hired: -1 };
            });

            for (let i = 0; i < newList.length; i++) {
                let hired = 0;
                try {
                    hired = await jobPostServiceInstance.getHiredCount(newList[i].publishedId);
                } catch (error) {
                    console.log("Not found");
                }
                newList[i].hired = hired;
            }
            setJobPostings(newList);

        } catch (e) {
            console.error(e);
        }

    }

    useEffect(() => {

        if (textilHelper && signer) queryJobPosts();

    }, []);

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {signer ? <>
                {!newJobPost && <>
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <span className="isolate inline-flex rounded-md shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setCurrentTab(0)}
                                    className={currentTab !== 0 ? "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                        "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                                >
                                    Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentTab(1)}
                                    className={currentTab !== 1 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                        "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                                >
                                    Published
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentTab(2)}
                                    className={currentTab !== 2 ? "relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                        "relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                                >
                                    Past
                                </button>
                            </span>
                        </div>
                        <div className="mt-4 mr-2 sm:mt-0 sm:ml-16 sm:flex-none">
                            <button
                                type="button"
                                onClick={() => setNewJobPost(true)}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                New
                            </button>
                        </div>
                    </div>
                    <div className="-mx-4 mt-6 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">

                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Position
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                    >
                                        Company
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 lg:table-cell"
                                    >
                                        Openings
                                    </th>
                                    {currentTab !== 0 &&
                                        <th
                                            scope="col"
                                            className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 lg:table-cell"
                                        >Hired</th>}
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Bounty
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 lg:table-cell"
                                    >
                                        {currentTab == 0 ? "Created" : currentTab == 1 ? "Published" : "Closed"}
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Publish</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobPostings.filter((element) => {
                                    if (currentTab === 0) return !element.isPublished && !element.isClosed;
                                    if (currentTab === 1) return element.isPublished && !element.isClosed;
                                    if (currentTab === 2) return element.isClosed;
                                }).map((jobPosition, jobIdx) => (
                                    <tr key={jobPosition._id}>
                                        <td
                                            className={classNames(
                                                jobIdx === 0 ? '' : 'border-t border-transparent',
                                                'relative py-4 pl-4 sm:pl-6 pr-3 text-sm'
                                            )}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {jobPosition.title}
                                            </div>
                                            {jobIdx !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
                                        </td>
                                        <td
                                            className={classNames(
                                                jobIdx === 0 ? '' : 'border-t border-gray-200',
                                                'hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell'
                                            )}
                                        >
                                            {jobPosition.company}
                                        </td>
                                        <td
                                            className={classNames(
                                                jobIdx === 0 ? '' : 'border-t border-gray-200',
                                                'hidden px-3 py-3.5 text-sm text-right text-gray-500 lg:table-cell'
                                            )}
                                        >
                                            {jobPosition.positionsToFill}
                                        </td>
                                        {currentTab !== 0 &&
                                            <td
                                                className={classNames(
                                                    jobIdx === 0 ? '' : 'border-t border-gray-200',
                                                    'hidden px-3 py-3.5 text-sm text-right text-gray-500 lg:table-cell'
                                                )}
                                            >
                                                {jobPosition.hired >= 0 ? jobPosition.hired : "..."}
                                            </td>
                                        }
                                        <td
                                            className={classNames(
                                                jobIdx === 0 ? '' : 'border-t border-gray-200',
                                                'px-3 py-3.5 text-sm text-right text-gray-500'
                                            )}
                                        >
                                            {jobPosition.bountyAmount?.toFixed(2)} <small>Ether</small>
                                        </td>
                                        <td
                                            className={classNames(
                                                jobIdx === 0 ? '' : 'border-t border-gray-200',
                                                'hidden px-3 py-3.5 text-sm text-center text-gray-500 lg:table-cell'
                                            )}
                                        >
                                            <Moment date={currentTab === 0 ? jobPosition.createdAt : currentTab === 1 ? jobPosition.publishedAt : jobPosition.closedAt} fromNow={true} />
                                        </td>

                                        <td
                                            className={classNames(
                                                jobIdx === 0 ? '' : 'border-t border-transparent',
                                                'relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium'
                                            )}
                                        >
                                            {currentTab === 0 &&
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => onPublish(jobPosition)}
                                                    className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    {processing ? "Publishing..." : "Publish"}<span className="sr-only"></span>
                                                </button>}

                                            {currentTab === 1 &&
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => onClose(jobPosition)}
                                                    className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    {processing ? "Closing..." : "Close"}<span className="sr-only"></span>
                                                </button>}

                                            {jobIdx !== 0 ? <div className="absolute right-6 left-0 -top-px h-px bg-gray-200" /> : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div> </>}
                {newJobPost && <NewJobPost signer={signer} onCancel={() => setNewJobPost(false)} onSave={onSave} />}
            </> : <div className="alert alert-danger" role="alert"> You need a connection to use this feature.</div>}
        </div>
    )
}
