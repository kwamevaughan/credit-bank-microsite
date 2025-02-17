import React, { useState } from 'react';
import useCustomerData from '@/hooks/useCustomerData';
import useCustomerActions from '@/hooks/useCustomerActions';

const CustomerOnboardingList = ({ userId, mode, toggleMode, notify }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    // Get both the data and the function to update the data from useCustomerData
    const { customers, loading, error, refetchCustomers, setCustomers } = useCustomerData(notify);
    // Pass the setCustomers function to useCustomerActions
    const { toggleStatus, handleDelete, actionLoading } = useCustomerActions({  // Pass refetchCustomers as a prop
        setCustomers,
        notify,
        refetchCustomers,
    });

    const filteredCustomers = customers
        .filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) || customer.referral_code.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter ? customer.status === statusFilter : true;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            } else if (sortBy === 'account_type') {
                return sortOrder === 'asc' ? a.account_type.localeCompare(b.account_type) : b.account_type.localeCompare(a.account_type);
            }
            return 0;
        });

    const pageSize = 8;
    const totalPages = Math.ceil(filteredCustomers.length / pageSize);
    const currentPageData = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

    const handleRowClick = (id) => {
        // Toggle the expanded row
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleCancel = () => {
        setExpandedRow(null); // Collapse the row without saving
    };

    const handleSort = (field) => {
        setSortBy(field);
        setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const formatDateWithTime = (dateString) => {
        const date = new Date(dateString);

        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        // Get time in hh:mm am/pm format
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedTime = `${(hours % 12) || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

        // Function to get ordinal suffix for the day
        const getOrdinalSuffix = (n) => {
            if (n > 3 && n < 21) return `${n}th`;
            switch (n % 10) {
                case 1: return `${n}st`;
                case 2: return `${n}nd`;
                case 3: return `${n}rd`;
                default: return `${n}th`;
            }
        };

        const formattedDay = getOrdinalSuffix(day);

        return `${formattedDay} ${month}, ${year} at ${formattedTime}`;
    };

    const accountTypeMapping = {
        nyumbani: 'Nyumbani Diaspora Account',
        cdsc: 'CDSC Account',
        'fixed-deposit': 'Fixed Deposit Account',
    };

    const handleToggleStatus = async (customerId) => {
        // Show a "Please wait..." notification
        notify("Please wait...", "info");

        // Perform the toggle status action
        await toggleStatus(customerId);
    };

    return (
        <div
            className={`max-w-4xl mx-auto p-6 rounded-xl shadow-lg hover:shadow-none transition-all duration-300 ease-in-out ${mode === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}`}
        >
            {/* Loading and Error Handling */}
            {loading && <div className={`${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>Loading...</div>}
            {error && <div className="text-red-500 text-center">Error: {error.message}</div>}

            {!loading && !error && ( // Only render table if not loading and no error
                <>
                    <div className="flex flex-col gap-x-2 px-2 mb-4">
                        <p className=" text-2xl md:text-lg justify-center md:justify-start mb-2">
                            Customer Onboarding List
                        </p>
                        <span className="italic">Note: Once approved, the customer will instantly receive 200 points in their dashboard.</span>
                    </div>
                    {/* Filter and Search Row */}
                    <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
                        {/* Search input */}
                        <input
                            type="search"
                            className={`flex-grow p-3 rounded-lg ${mode === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'} border border-[#FF930A] focus:ring-[#FF930A] focus:outline-none transition-all duration-300`}
                            placeholder="Search by name or referral code" // Updated placeholder
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                        />

                        {/* Filter Dropdown */}
                        <select
                            className={`p-3 rounded-lg border border-[#FF930A] ${mode === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'} focus:ring-[#FF930A]`}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1); // Reset to first page when filter changes
                            }}
                        >
                            <option value="">Filter by Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                    <div
                        className="overflow-y-auto"
                        style={{ maxHeight: '600px' }} // Limit the height and enable vertical scrolling
                    >
                        <table className="min-w-full table-auto border-separate border-spacing-y-4 rounded-md">
                            <thead>
                            <tr>
                                <th className={`px-4 py-2 text-left ${mode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                    onClick={() => handleSort('name')}>
                                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className={`px-4 py-2 text-left ${mode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                    onClick={() => handleSort('account_type')}>
                                    Account Type {sortBy === 'account_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className={`px-4 py-2 text-left ${mode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                    onClick={() => handleSort('referral_code')}>
                                    Referral Code {sortBy === 'referral_code' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>

                                <th className={`px-4 py-2 text-left ${mode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                    onClick={() => handleSort('status')}>
                                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>

                                <th className={`px-4 py-2 text-left ${mode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                    onClick={() => handleSort('points')}>
                                    Points {sortBy === 'points' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentPageData.length > 0 ? (
                                currentPageData.map((customer, index) => {
                                    return (
                                        <React.Fragment key={customer.id}>
                                            <tr
                                                className={`${
                                                    index % 2 === 0
                                                        ? mode === 'dark'
                                                            ? 'bg-gray-800 hover:bg-gray-700'
                                                            : 'bg-[#f4fbfb] hover:bg-[#cff0ed]'
                                                        : mode === 'dark'
                                                            ? 'bg-gray-700 hover:bg-gray-600'
                                                            : 'bg-white hover:bg-[#cff0ed]'
                                                } py-3 transition-all duration-300 ease-in-out group relative cursor-pointer`}
                                                onClick={() => handleRowClick(customer.id)}
                                            >
                                                <td className={`px-4 py-3 border-r flex items-center justify-between ${mode === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                                                    <span>{customer.name}</span>
                                                    <span
                                                        className="ml-2 transform transition-transform duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:rotate-180"
                                                        style={{ fontSize: '12px', color: '#999' }}
                                                    >
                                                    </span>
                                                </td>

                                                <td className={`px-4 py-3 text-gray-600 border-r ${mode === 'dark' ? 'text-white' : ''}`}>
                                                    {accountTypeMapping[customer.account_type] || customer.account_type}
                                                </td>

                                                {/* Updated Referral Code Column */}
                                                <td className={`px-4 py-3 text-gray-600 border-r ${mode === 'dark' ? 'text-white' : ''}`}>
                                                    {customer.referral_code ? customer.referral_code : 'N/A'}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600 border-r">
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customer.status === 'Approved'}
                                                            onChange={() => handleToggleStatus(customer.id)}
                                                            className="sr-only peer"
                                                        />
                                                        <div
                                                            className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out dark:border-gray-600 peer-checked:bg-[#0CB4AB] dark:peer-checked:bg-blue-600"
                                                        />
                                                        <span
                                                            className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                        >
                                                        {customer.status === 'Pending' ? 'Pending' : 'Approved'}
                                                    </span>
                                                    </label>
                                                </td>

                                                <td className={`px-4 py-3 text-gray-600 border-r ${mode === 'dark' ? 'text-white' : ''}`}>
                                                    {customer.points}
                                                </td>
                                            </tr>

                                            {/* Expanded Row */}
                                            {expandedRow === customer.id && (
                                                <tr>
                                                    <td colSpan="6"
                                                        className={`px-4 py-4 ${mode === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
                                                        <p>
                                                            {customer.name} requested to open a{' '}
                                                            <span className="capitalize font-bold">
                                                                {accountTypeMapping[customer.account_type] || customer.account_type}
                                                            </span>{' '}
                                                            account on {formatDateWithTime(customer.request_date)}
                                                        </p>

                                                        <div className="flex justify-end gap-4 mt-4">
                                                            <button
                                                                onClick={handleCancel}
                                                                className="px-4 py-2 text-white bg-gray-400 rounded-md hover:bg-gray-500 transition-all duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(customer.id)}
                                                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200"
                                                                disabled={actionLoading}
                                                            >
                                                                {actionLoading ? "Please wait..." : "Delete"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                            </tbody>

                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-6 px-4">
                        <button
                            className={`${
                                page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                            } bg-[#FF930A] px-4 py-2 text-white rounded-md`}
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                        >
                            Prev
                        </button>
                        <span className="text-lg font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className={`${
                                page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                            } bg-[#FF930A] px-4 py-2 text-white rounded-md`}
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerOnboardingList;
