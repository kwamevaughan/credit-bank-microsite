import React, { useEffect, useState } from 'react';

const HelpDesk = ({ mode, notify, fullName, email }) => {
    const [formData, setFormData] = useState({
        name: fullName || '',
        email: email || '',
        issue: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null); // To track submission success or failure

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const issueLabels = {
        general: "General Inquiry",
        account: "Issue with Account",
        suggestion: "Suggestion"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Map the issue value to its corresponding label
        const issueLabel = issueLabels[formData.issue] || formData.issue;  // Default to the selected value if no match

        // Show a toast with "Sending message, please wait..." while submitting
        const loadingToast = notify('Sending message, please wait...', 'info'); // Use "info" for the loading state

        try {
            const response = await fetch('/api/helpdeskEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, issue: issueLabel }),  // Send the full issue label
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({
                    name: fullName || '',
                    email: email || '',
                    issue: '',
                    message: '',
                });
                // Show success toast and replace the "Please wait..." toast
                notify('Your message has been sent successfully!', 'success');
                // Update submission status for the feedback message
                setSubmissionStatus('success');
            } else {
                // Show error toast and replace the "Please wait..." toast
                notify(data.message || 'Something went wrong.', 'error');
                setSubmissionStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            // Show error toast and replace the "Please wait..." toast
            notify('Failed to submit form. Please try again later.', 'error');
            setSubmissionStatus('error');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            name: fullName || '',
            email: email || '',
        }));
    }, [fullName, email]);

    return (
        <div className="max-w-3xl px-4 py-8">
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    <div className="mb-8">
                        <h3 className={`font-semibold text-xl ${mode === 'dark' ? 'text-white' : 'text-black'} mb-4`}>
                            Need Support?
                        </h3>
                        <p className={`${mode === 'dark' ? 'text-white' : 'text-gray-500'} mb-4`}>
                            Please fill out the form below and we’ll get back to you as soon as possible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        {/* Full Name */}
                        <div className="sm:col-span-1">
                            <label
                                htmlFor="name"
                                className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200`}
                                required
                                disabled
                            />
                        </div>

                        {/* Email Address */}
                        <div className="sm:col-span-1">
                            <label
                                htmlFor="email"
                                className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200`}
                                required
                                disabled
                            />
                        </div>

                        {/* Issue/Complaint Dropdown */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="issue"
                                className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            >
                                Issue/Complaint
                            </label>
                            <select
                                id="issue"
                                name="issue"
                                value={formData.issue}
                                onChange={handleInputChange}
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200`}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="general">General Inquiry</option>
                                <option value="account">Issue with account</option>
                                <option value="suggestion">Suggestion</option>
                            </select>
                        </div>

                        {/* Message */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="message"
                                className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            >
                                Your Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows="4"
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200`}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex gap-x-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`rounded-lg px-6 py-3 text-sm font-semibold shadow-lg focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200 ${isLoading ? 'bg-gray-400 text-gray-50' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    {/* Updated spinner with white color */}
                                    <div
                                        className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span className="text-sm">Sending...</span>
                                </div>
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>

                </div>
            </form>

            {/* Feedback Message after successful submission */}
            {submissionStatus === 'success' && (
                <div className="mt-8 p-4 bg-gray-100 text-gray-800 rounded-lg">
                    <p className="text-lg font-semibold">
                        Your message has been successfully sent! You should expect a response within 24 hours.
                    </p>
                    <p className="mt-2 text-sm">
                        If you don't hear back from us within 24 hours, please reach out directly via:
                    </p>
                    <ul className="mt-2 list-disc pl-5">
                        <li>Email: <a href="mailto:customerservice@creditbank.co.ke" className="text-teal-600">customerservice@creditbank.co.ke</a></li>
                        <li>Call Support Helpline: <a href="tel:+254709072000" className="text-teal-600">+254 70 907 2000</a></li>
                    </ul>
                </div>
            )}

            {/* Error feedback message */}
            {submissionStatus === 'error' && (
                <div className="mt-8 p-4 bg-red-100 text-red-800 rounded-lg">
                    <p className="text-lg font-semibold">Oops, something went wrong! Please try again later.</p>
                </div>
            )}
        </div>
    );
};

export default HelpDesk;
