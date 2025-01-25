import { useState } from 'react';
import NavHeader from "@/layouts/nav-header";

export default function Faqs() {
    // Initialize the active state for each accordion tab
    const [activeTab, setActiveTab] = useState(null);

    // Function to toggle the active state of a tab
    const toggleTab = (tabIndex) => {
        if (activeTab === tabIndex) {
            setActiveTab(null); // Close the tab if it's already open
        } else {
            setActiveTab(tabIndex); // Open the clicked tab
        }
    };

    return (
        <div
            className="w-full"
            style={{
                backgroundImage: `url('/assets/images/main-login-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <NavHeader />

            <section className="py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-4xl font-manrope text-center font-bold text-gray-900 leading-[3.25rem]">
                        Frequently asked questions
                    </h2>
                </div>
                <div className="accordion-group" data-accordion="default-accordion">
                    {/* Accordion 1 */}
                    <div
                        className={`accordion border border-solid border-gray-300 p-4 rounded-xl transition duration-500 ${
                            activeTab === 1 ? 'accordion-active:bg-indigo-50 accordion-active:border-indigo-600' : ''
                        } mb-8 lg:p-4`}
                    >
                        <button
                            className="accordion-toggle group inline-flex items-center justify-between text-left text-lg font-normal leading-8 text-gray-900 w-full transition duration-500 hover:text-indigo-600"
                            onClick={() => toggleTab(1)}
                        >
                            <h5>How can I reset my password?</h5>
                            <svg
                                className={`w-6 h-6 text-gray-900 transition duration-500 ${
                                    activeTab === 1 ? 'accordion-active:text-indigo-600 hidden' : 'group-hover:text-indigo-600'
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 12H18M12 18V6"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                            <svg
                                className={`w-6 h-6 text-gray-900 transition duration-500 ${
                                    activeTab === 1 ? 'accordion-active:text-indigo-600 block' : 'hidden'
                                } group-hover:text-indigo-600`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 12H18"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                        </button>
                        {activeTab === 1 && (
                            <div
                                id="basic-collapse-one-with-icon"
                                className="accordion-content w-full overflow-hidden pr-4"
                                aria-labelledby="basic-heading-one"
                                style={{ maxHeight: '250px' }}
                            >
                                <p className="text-base text-gray-900 font-normal leading-6">
                                    To create an account, find the 'Sign up' or 'Create account' button, fill out the registration form with your personal information, and click 'Create account' or 'Sign up.' Verify your email address if needed, and then log in to start using the platform.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Accordion 2 */}
                    <div
                        className={`accordion border border-solid border-gray-300 p-4 rounded-xl transition duration-500 ${
                            activeTab === 2 ? 'accordion-active:bg-indigo-50 accordion-active:border-indigo-600' : ''
                        } mb-8 lg:p-4`}
                    >
                        <button
                            className="accordion-toggle group inline-flex items-center justify-between text-left text-lg font-normal leading-8 text-gray-900 w-full transition duration-500 hover:text-indigo-600"
                            onClick={() => toggleTab(2)}
                        >
                            <h5>How do I update my billing information?</h5>
                            <svg
                                className={`w-6 h-6 text-gray-900 transition duration-500 ${
                                    activeTab === 2 ? 'accordion-active:text-indigo-600 hidden' : 'group-hover:text-indigo-600'
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 12H18M12 18V6"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                            <svg
                                className={`w-6 h-6 text-gray-900 transition duration-500 ${
                                    activeTab === 2 ? 'accordion-active:text-indigo-600 block' : 'hidden'
                                } group-hover:text-indigo-600`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 12H18"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                        </button>
                        {activeTab === 2 && (
                            <div
                                id="basic-collapse-two-with-icon"
                                className="accordion-content w-full overflow-hidden pr-4"
                                aria-labelledby="basic-heading-two"
                            >
                                <p className="text-base text-gray-900 font-normal leading-6">
                                    To create an account, find the 'Sign up' or 'Create account' button, fill out the registration form with your personal information, and click 'Create account' or 'Sign up.' Verify your email address if needed, and then log in to start using the platform.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Accordion 3 */}
                    <div
                        className={`accordion border border-solid border-gray-300 p-4 rounded-xl transition duration-500 ${
                            activeTab === 3 ? 'accordion-active:bg-indigo-50 accordion-active:border-indigo-600' : ''
                        } mb-8 lg:p-4`}
                    >
                        <button
                            className="accordion-toggle group inline-flex items-center justify-between text-left text-lg font-normal leading-8 text-gray-900 w-full transition duration-500 hover:text-indigo-600"
                            onClick={() => toggleTab(3)}
                        >
                            <h5>How can I contact customer support?</h5>
                            <svg
                                className={`w-6 h-6 text-gray-900 transition duration-500 ${
                                    activeTab === 3 ? 'accordion-active:text-indigo-600 hidden' : 'group-hover:text-indigo-600'
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 12H18M12 18V6"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                            <svg
                                className={`w-6 h-6 text-gray-900 transition duration-500 ${
                                    activeTab === 3 ? 'accordion-active:text-indigo-600 block' : 'hidden'
                                } group-hover:text-indigo-600`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 12H18"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                        </button>
                        {activeTab === 3 && (
                            <div
                                id="basic-collapse-three-with-icon"
                                className="accordion-content w-full overflow-hidden pr-4"
                                aria-labelledby="basic-heading-three"
                            >
                                <p className="text-base text-gray-900 font-normal leading-6">
                                    To create an account, find the 'Sign up' or 'Create account' button, fill out the registration form with your personal information, and click 'Create account' or 'Sign up.' Verify your email address if needed, and then log in to start using the platform.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
        </div>
    );
}
