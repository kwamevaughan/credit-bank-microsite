import React, { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';

const CustomerList = ({ userId, mode, toggleMode, notify }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('name'); // Default sort by 'name'
    const [sortOrder, setSortOrder] = useState('asc'); // Default sort order is ascending
    const [statusFilter, setStatusFilter] = useState(''); // Filter for 'Status' column
    const [customers, setCustomers] = useState([]); // Store customer data
    const [loading, setLoading] = useState(true); // Loading state
    const [dropdownVisible, setDropdownVisible] = useState(null); // Track visible dropdown
    const [expandedRow, setExpandedRow] = useState(null); // Track expanded row
    const [editableFields, setEditableFields] = useState({ name: '', transaction_id: '' }); // Store editable fields data


    // Fetch data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('transaction_verification')
                .select('*'); // Select all columns

            if (error) {
                console.error('Error fetching data: ', error.message);
                notify("Error fetching data.", "error");
            } else {
                setCustomers(data);
            }
            setLoading(false);
        };

        fetchData();
    }, []); // Empty dependency array, so this runs only once when the component mounts

    // Subscribe to real-time updates from Supabase
    useEffect(() => {
        const channel = supabase
            .channel('transaction-verification-channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'transaction_verification',
            }, (payload) => {
                setCustomers((prevCustomers) => [...prevCustomers, payload.new]);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'transaction_verification',
            }, (payload) => {
                setCustomers((prevCustomers) =>
                    prevCustomers.map((customer) =>
                        customer.id === payload.new.id ? { ...customer, ...payload.new } : customer
                    )
                );
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'transaction_verification',
            }, (payload) => {
                setCustomers((prevCustomers) =>
                    prevCustomers.filter((customer) => customer.id !== payload.old.id)
                );
            })
            .subscribe();

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, []); // Empty dependency array ensures it runs once when the component mounts

    // Filter customers based on search input and status filter
    const filteredCustomers = customers
        .filter((customer) => {
            const searchQuery = search.toLowerCase();
            const matchesName = customer.name && customer.name.toLowerCase().includes(searchQuery);
            const matchesTransactionId = customer.transaction_id && customer.transaction_id.toLowerCase().includes(searchQuery);

            return (
                (matchesName || matchesTransactionId) && // Match either name or transaction_id
                (statusFilter === '' || customer.status === statusFilter)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortBy === 'transaction_id') {
                return sortOrder === 'asc'
                    ? a.transaction_id.localeCompare(b.transaction_id)
                    : b.transaction_id.localeCompare(a.transaction_id);
            } else if (sortBy === 'points') {
                return sortOrder === 'asc'
                    ? a.points - b.points
                    : b.points - a.points;
            } else if (sortBy === 'status') {
                return sortOrder === 'asc'
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            }
            return 0;
        });

    const pageSize = 8;
    const totalPages = Math.ceil(filteredCustomers.length / pageSize);
    const currentPageData = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

    // Sorting function
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
        } else {
            setSortBy(column);
            setSortOrder('asc'); // Default to ascending when sorting by a new column
        }
    };

    // Toggle status function
    const toggleStatus = async (id) => {
        // Find the customer object to determine the current status
        const customer = customers.find(c => c.id === id);

        // If the status is "Approved", update to "Pending" and reverse the points by 200
        if (customer.status === "Approved") {
            // Reverse the points by 200
            const { data, error } = await supabase
                .from('transaction_verification')
                .update({
                    status: 'Pending',
                    points: customer.points - 200, // Reverse the points
                    approved_at: null // Reset the approved_at timestamp
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating status: ", error.message);
                notify("Error updating status.", "error");
            } else {
                // Update the local state to reflect the change
                setCustomers((prevCustomers) =>
                    prevCustomers.map((customer) =>
                        customer.id === id
                            ? { ...customer, status: 'Pending', points: customer.points - 200, approved_at: null }
                            : customer
                    )
                );
                // Show toast notification for points reversed
                toast.success(`200 Points reversed: from ${customer.name}`);
            }
        } else {
            // If the status is not "Approved" (i.e., it's "Pending"), update to "Approved" and assign 200 points
            const { data, error } = await supabase
                .from('transaction_verification')
                .update({
                    status: 'Approved',
                    points: customer.points + 200, // Assign 200 points
                    approved_at: new Date().toISOString() // Set the current date and time
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating status: ", error.message);
                notify("Error updating status.", "error");
            } else {
                // Update the local state to reflect the change
                setCustomers((prevCustomers) =>
                    prevCustomers.map((customer) =>
                        customer.id === id
                            ? { ...customer, status: 'Approved', points: customer.points + 200, approved_at: new Date().toISOString() }
                            : customer
                    )
                );
                // Show toast notification for points assigned
                toast.success(`200 Points assigned:to ${customer.name}`);
            }
        }
    };



    const handleRowClick = (id) => {
        // Toggle the expanded row
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleInputChange = (e, field) => {
        // Update only the field that changes, keep the other field intact
        setEditableFields(prevState => ({
            ...prevState,
            [field]: e.target.value,
        }));
    };


    const handleSave = async (id) => {
        // Get the customer data, use the editable fields to update only the changed fields
        const updatedCustomer = {
            ...customers.find(c => c.id === id),
            name: editableFields.name || customers.find(c => c.id === id).name, // Preserve previous name if not changed
            transaction_id: editableFields.transaction_id || customers.find(c => c.id === id).transaction_id, // Preserve previous transaction_id if not changed
        };

        const { data, error } = await supabase
            .from('transaction_verification')
            .update(updatedCustomer)
            .eq('id', id);

        if (error) {
            console.error('Error updating customer: ', error.message);
            notify("Error updating customer.", "error");
        } else {
            setCustomers(customers.map((customer) =>
                customer.id === id ? updatedCustomer : customer
            ));
            toast.success("Customer updated successfully.");
            setExpandedRow(null); // Collapse the row after saving
        }
    };


    const handleCancel = () => {
        setExpandedRow(null); // Collapse the row without saving
    };



    const handleDelete = async (id) => {
        // Find the customer by ID to check if they're approved
        const customer = customers.find(c => c.id === id);

        if (customer.status === 'Approved') {
            // Show a toast notification if the customer is already approved
            toast.info(`${customer.name} is already approved. Deletion is not allowed.`);
        } else {
            // Proceed with the deletion only if the customer is not approved
            if (window.confirm('Are you sure you want to delete this record?')) {
                const { data, error } = await supabase
                    .from('transaction_verification')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error("Error deleting customer: ", error.message);
                    notify("Error deleting customer.", "error");
                } else {
                    // Remove the customer from local state after deletion
                    setCustomers(customers.filter(customer => customer.id !== id));
                    toast.success("Customer deleted successfully.");
                }
            }
        }
    };






    return (
        <div
            className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg hover:shadow-none transition-all duration-300 ease-in-out">
            <p className="flex gap-x-2 items-center text-base sm:text-lg mb-4 px-2">
                Customer List
            </p>
            {/* Filter and Search Row */}
            <div className="mb-4 flex items-center gap-4">
                {/* Search input */}
                <input
                    type="search"
                    className="flex-grow p-3 rounded-lg bg-white text-gray-900 border border-[#FF930A] focus:ring-[#FF930A] focus:outline-none transition-all duration-300"
                    placeholder="Search by name or transaction ID"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset to first page on search
                    }}
                />

                {/* Filter Dropdown */}
                <select
                    className="p-3 rounded-lg border border-[#FF930A] bg-white focus:ring-[#FF930A]"
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

            {/* Loading indicator */}
            {loading && <div className="text-center text-gray-500">Loading...</div>}

            <div
                className="overflow-y-auto"
                style={{maxHeight: '600px'}} // Limit the height and enable vertical scrolling
            >
                <table className="min-w-full table-auto border-separate border-spacing-y-4 rounded-md">
                    <thead>
                    <tr>
                        <th
                            className="px-4 py-2 text-left bg-gray-100 text-gray-600 cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                            className="px-4 py-2 text-left bg-gray-100 text-gray-600 cursor-pointer"
                            onClick={() => handleSort('transaction_id')}
                        >
                            Transaction ID {sortBy === 'transaction_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                            className="px-4 py-2 text-left bg-gray-100 text-gray-600 cursor-pointer"
                            onClick={() => handleSort('status')}
                        >
                            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                            className="px-4 py-2 text-left bg-gray-100 text-gray-600 cursor-pointer"
                            onClick={() => handleSort('points')}
                        >
                            Points Allocated {sortBy === 'points' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentPageData.length > 0 ? (
                        currentPageData.map((customer, index) => {
                            // Format the approved_at timestamp
                            const formattedDate = customer.approved_at
                                ? new Date(customer.approved_at).toLocaleString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })
                                : null;

                            return (
                                <React.Fragment key={customer.id}>
                                    <tr
                                        key={customer.id}
                                        className={`${
                                            index % 2 === 0
                                                ? 'bg-[#f4fbfb] hover:bg-[#cff0ed]'
                                                : 'bg-white hover:bg-[#cff0ed]'
                                        } py-3 transition-all duration-300 ease-in-out group relative cursor-pointer`} // Changed to cursor-pointer
                                        onClick={() => handleRowClick(customer.id)} // Handle click for dropdown
                                    >
                                        <td className="px-4 py-3 text-gray-600 border-r flex items-center justify-between">
                                            <span>{customer.name}</span>
                                            {/* Down Arrow for indicating clickability */}
                                            <span
                                                className="ml-2 transform transition-transform duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:rotate-180"
                                                style={{fontSize: '12px', color: '#999'}}
                                            >
                            &#9660; {/* Downward triangle arrow */}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 border-r">{customer.transaction_id}</td>
                                        <td className="px-4 py-3 text-gray-600 border-r">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={customer.status === 'Approved'}
                                                    onChange={() => toggleStatus(customer.id)}
                                                    className="sr-only peer"
                                                />
                                                <div
                                                    className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out dark:border-gray-600 peer-checked:bg-[#0CB4AB] dark:peer-checked:bg-blue-600"
                                                />
                                                <span
                                                    className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {customer.status === 'Pending' ? 'Pending' : 'Approved'}
                            </span>
                                            </label>
                                            {formattedDate && (
                                                <div
                                                    className="absolute bottom-10 right-0 bg-black text-white text-sm py-2 px-2 rounded-md opacity-0 group-hover:opacity-50 transition-opacity duration-200 max-w-xs shadow-md">
                                                    Approved on {formattedDate}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 border-r">{customer.points}</td>
                                    </tr>

                                    {/* Expanded Row with Editable Fields */}
                                    {expandedRow === customer.id && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-gray-700">Name</label>
                                                        <input
                                                            type="text"
                                                            value={editableFields.name || customer.name}
                                                            onChange={(e) => handleInputChange(e, 'name')}
                                                            className="w-full p-2 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700">Transaction ID</label>
                                                        <input
                                                            type="text"
                                                            value={editableFields.transaction_id || customer.transaction_id}
                                                            onChange={(e) => handleInputChange(e, 'transaction_id')}
                                                            className="w-full p-2 border rounded-md"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-4 mt-4">
                                                    <button
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 text-white bg-gray-400 rounded-md"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSave(customer.id)}
                                                        className="px-4 py-2 text-white bg-[#0CB4AB] rounded-md"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="px-4 py-2 text-white bg-red-600 rounded-md"
                                                    >
                                                        Delete
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
                            <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
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
                    className={`bg-[#FF930A] text-white py-2 px-4 rounded-md shadow-md hover:bg-[#F47C09] transition-all duration-200 ${
                        page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                >
                    Previous
                </button>
                <span className="text-gray-700">
                    Page {page} of {totalPages}
                </span>
                <button
                    className={`bg-[#FF930A] text-white py-2 px-4 rounded-md shadow-md hover:bg-[#F47C09] transition-all duration-200 ${
                        page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CustomerList;
