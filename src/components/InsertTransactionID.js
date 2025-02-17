import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TransactionIDUpdater = ({ token, userId, mode, toggleMode, notify }) => {
    const [name, setName] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [amountDeposited, setAmountDeposited] = useState("");
    const [bulkData, setBulkData] = useState("");
    const [selectedUpload, setSelectedUpload] = useState("single");

    const handleRadioChange = (value) => {
        setSelectedUpload(value);
    };

    // Handle keypress to allow only numbers (no decimals)
    const handleKeyPress = (e) => {
        let charCode = e.which ? e.which : e.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            e.preventDefault();
        }
    };

    // Format input with commas after every 3 digits
    const formatAmount = (value) => {
        value = value.replace(/,/g, ""); // Remove existing commas
        if (value.length > 3) {
            let noCommas = Math.ceil(value.length / 3) - 1;
            let remain = value.length - (noCommas * 3);
            let newVal = [];
            for (let i = 0; i < noCommas; i++) {
                newVal.unshift(value.substr(value.length - (i * 3) - 3, 3));
            }
            newVal.unshift(value.substr(0, remain));
            return newVal.join(",");
        }
        return value;
    };

    // Handle input change
    const handleChange = (e) => {
        let value = e.target.value;
        value = formatAmount(value);
        setAmountDeposited(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Remove commas from the amountDeposited before submission
        const cleanedAmount = amountDeposited.replace(/,/g, ""); // Remove commas

        // Set the default name to "Customer" if not provided
        const finalName = name || "Customer"; // Use "Customer" if name is empty

        // Prepare the data to submit
        const formData = selectedUpload === "single"
            ? {
                name: finalName, // Set name to finalName, which is either provided or "Customer"
                transaction_id: transactionId,
                amount_deposited: cleanedAmount,
                points: 0, // Default points are 0 when the transaction is pending
                status: 'Pending', // Default status is "Pending"
            }
            : {
                name: finalName, // Same for bulk
                transaction_id: bulkData, // Bulk transaction data will need parsing later
                amount_deposited: cleanedAmount,
                points: 0, // Default points are 0 for bulk records
                status: 'Pending', // Default status for bulk transactions is "Pending"
            };

        // Function to check if the transaction_id already exists
        const checkDuplicateTransaction = async (transactionId) => {
            const { data, error } = await supabase
                .from('transaction_verification')
                .select('transaction_id')
                .eq('transaction_id', transactionId);

            if (error) {
                toast.error("Error checking for duplicates: " + error.message);
                return false;
            }

            return data.length > 0; // If data is found, it means the transaction ID already exists
        };

        // Check for duplicates before insert for single upload
        if (selectedUpload === "single") {
            const isDuplicate = await checkDuplicateTransaction(transactionId);
            if (isDuplicate) {
                toast.error("Transaction ID already exists.");
                return;
            }

            // Insert single transaction into Supabase
            const { data, error } = await supabase
                .from('transaction_verification')
                .insert([formData]);

            if (error) {
                toast.error("Failed to submit transaction: " + error.message);
            } else {
                toast.success("Transaction details successfully added!");
                // Clear the form fields after submission
                setName("");
                setTransactionId("");
                setAmountDeposited("");
            }
        }

        // Insert bulk transactions if selected
        if (selectedUpload === "bulk") {
            // Split the input by new lines and process each line
            const transactions = bulkData.split("\n").map(async (line) => {
                // Trim the line to remove extra whitespace around it
                const trimmedLine = line.trim();

                // Skip empty lines
                if (trimmedLine === "") {
                    return null;
                }

                // Split by comma if there's a name and transaction ID
                const parts = trimmedLine.split(",");

                // If the line doesn't have a comma, treat the whole line as a transaction ID
                let bulkName = "Customer"; // Default name if no name is provided
                let bulkTransactionId = trimmedLine; // Treat the whole line as transaction ID
                let bulkAmountDeposited = 0; // Default amount is 0 if not provided

                if (parts.length === 2) {
                    // If the line has a comma, we assume it's in the format of "name, transaction ID"
                    bulkName = parts[0]?.trim() || "Customer"; // Use name if available, else default to "Customer"
                    bulkTransactionId = parts[1]?.trim();
                    bulkAmountDeposited = parts[2]?.trim() || 0; // Use amount if available, else default to 0

                }

                // If the transaction ID is missing, skip this line
                if (!bulkTransactionId) {
                    return null;
                }

                // Check if the transaction ID already exists before preparing it for insertion
                const isDuplicate = await checkDuplicateTransaction(bulkTransactionId);
                if (isDuplicate) {
                    toast.error(`Transaction ID ${bulkTransactionId} already exists.`);
                    return null; // Skip adding this transaction if it already exists
                }

                return {
                    name: bulkName, // Set the name (default to "Customer" if empty)
                    transaction_id: bulkTransactionId,
                    amount_deposited: amountDeposited,
                    points: 0, // Default points for bulk
                    status: 'Pending', // Default status for bulk transactions
                };
            });

            // Wait for all bulk transactions to be checked
            const validTransactions = (await Promise.all(transactions)).filter(Boolean);

            if (validTransactions.length > 0) {
                const { data, error } = await supabase
                    .from('transaction_verification')
                    .insert(validTransactions);

                if (error) {
                    toast.error("Failed to submit bulk transactions: " + error.message);
                } else {
                    toast.success("Bulk transactions successfully submitted!");
                    // Clear the form fields after submission
                    setBulkData("");
                }
            } else {
                toast.error("No valid transactions to submit.");
            }
        }
    };


    return (
        <div
            className={`flex rounded-xl shadow-lg hover:shadow-none transition-all duration-300 overflow-hidden w-full rounded-lg ${mode === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}`}
        >

            <div className="w-full p-8 px-10">
                <form onSubmit={handleSubmit}>
                    <label
                        className={`text-2xl md:text-lg text-center font-bold mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Choose Upload Type
                    </label>
                    <div className="flex mt-4 w-full space-x-4">
                        {/* Single Upload Container */}
                        <div
                            className={`flex items-center ps-4 border rounded-lg w-full ${selectedUpload === "single" ? "bg-[#0CB4AB] text-white" : ""} ${mode === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}
                        >
                            <input
                                id="single-upload"
                                type="radio"
                                value="single"
                                name="upload-type"
                                className="w-5 h-5 accent-[#FFFFFF] bg-gray-100 border-[#FFFFFF] border-2 focus:ring-[#FFFFFF] dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                onChange={() => handleRadioChange("single")}
                                checked={selectedUpload === "single"} // Ensure it starts checked
                            />
                            <label
                                htmlFor="single-upload"
                                className={`flex-grow py-2 ms-2 text-sm font-medium ${selectedUpload === "single" ? "text-white" : "text-gray-900"} ${mode === 'dark' ? 'text-gray-300' : ''}`}
                            >
                                Single Upload
                            </label>
                        </div>
                        {/* Bulk Upload Container */}
                        <div
                            className={`flex items-center ps-4 border rounded-lg w-full ${selectedUpload === "bulk" ? "bg-[#0CB4AB] text-white" : ""} ${mode === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}
                        >
                            <input
                                id="bulk-upload"
                                type="radio"
                                value="bulk"
                                name="upload-type"
                                className="w-5 h-5 accent-[#FFFFFF] bg-gray-100 border-[#FFFFFF] border-2 focus:ring-[#FFFFFF] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                onChange={() => handleRadioChange("bulk")}
                                checked={selectedUpload === "bulk"}
                            />
                            <label
                                htmlFor="bulk-upload"
                                className={`flex-grow py-2 ms-2 text-sm font-medium ${selectedUpload === "bulk" ? "text-white" : "text-gray-900"} ${mode === 'dark' ? 'text-gray-300' : ''}`}
                            >
                                Bulk Upload
                            </label>
                        </div>
                    </div>

                    {/* Show Name Field only if Single Upload is selected */}
                    {selectedUpload === "single" && (
                        <div className="mt-4">
                            <label
                                className={`text-sm font-bold mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name
                                (Optional)</label>
                            <div
                                className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out"
                            >
                                <input
                                    className={`bg-transparent ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'} py-2 px-4 block w-full rounded`}
                                    type="text"
                                    placeholder="Enter customer name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Show Transaction ID Field only if Single Upload is selected */}
                    {selectedUpload === "single" && (
                        <div className="mt-4">
                            <label
                                className={`text-sm font-bold mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Transaction
                                ID</label>
                            <div className="relative">
                                <input
                                    className={`bg-transparent ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'} border border-[#FF930A] rounded py-2 px-4 block w-full focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out`}
                                    placeholder="Enter transaction ID"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Show Deposit Amount Field only if Single Upload is selected */}
                    {selectedUpload === "single" && (
                        <div className="mt-4">
                            <label
                                className={`text-sm font-bold mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Amount
                                Deposited</label>
                            <div className="relative">
                                <span
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'} text-sm`}>KES</span>
                                <input
                                    className={`bg-transparent ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'} border border-[#FF930A] rounded py-2 pl-16 pr-4 block w-full focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out`}
                                    placeholder="Enter Amount deposited"
                                    required
                                    value={amountDeposited}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </div>
                    )}

                    {/* Show Textarea only if Bulk Upload is selected */}
                    {selectedUpload === "bulk" && (
                        <div className="flex flex-col mt-4">
                            <label
                                className={`text-sm font-bold mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Paste Name and Transaction IDs (one per line).<br/>
                                See sample below:
                            </label>
                            <textarea
                                className={`bg-transparent ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'} border border-[#FF930A] rounded py-2 px-4 block w-full focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out`}
                                placeholder={`John Doe, R1234567890ABC, 15000\nJane Doe, R9876543210DEF, 25000\n\nR5389201847XYZ, 45000\nR7493028461LMN, 35000`}
                                rows="6"
                                required
                                value={bulkData}
                                onChange={(e) => setBulkData(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            type="submit"
                            className={`bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-95`}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default TransactionIDUpdater;
