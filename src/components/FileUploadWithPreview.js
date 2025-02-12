import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { TrashIcon, CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Link from 'next/link';

const FileUploadWithPreview = ({ userId, mode, notify }) => {
    const [files, setFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [parsedData, setParsedData] = useState([]);

    const onDrop = (acceptedFiles) => {
        setFiles(acceptedFiles);
        setProgress(0);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: '.csv,.xls,.xlsx',
        maxFiles: 1
    });

    const removeFile = (file) => {
        setFiles(files.filter((f) => f !== file));
        setParsedData([]);
        setProgress(0);
    };

    const parseFile = (file) => {
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
            const fileData = e.target.result;
            const fileExtension = file.name.split('.').pop().toLowerCase();

            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 10;
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    setProgress(100);
                } else {
                    setProgress(progress);
                }
            }, 300);

            try {
                if (fileExtension === 'csv') {
                    Papa.parse(fileData, {
                        header: true,
                        complete: (result) => {
                            if (result.errors.length > 0) {
                                notify('Error parsing CSV file');
                                console.error('CSV parsing errors:', result.errors);
                                return;
                            }

                            const formattedData = result.data
                                .filter(row => row.Name && row['Transaction ID'])
                                .map((row) => ({
                                    name: String(row.Name || ''),
                                    transaction_id: String(row['Transaction ID'] || ''),
                                    amount_deposited: parseFloat(row['Amount Deposited']) || 0, // Ensure it's a number
                                }));

                            if (formattedData.length === 0) {
                                notify('No valid data found in file');
                                return;
                            }

                            setParsedData(formattedData);
                            setProgress(100);
                        },
                        error: (err) => {
                            notify('Error parsing CSV file');
                            console.error('CSV parsing error:', err);
                        }
                    });
                } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
                    const workbook = XLSX.read(fileData, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const formattedData = jsonData
                        .filter(row => row.Name && row['Transaction ID'])
                        .map((row) => ({
                            name: String(row.Name || ''),
                            transaction_id: String(row['Transaction ID'] || ''),
                            amount_deposited: String(row['Amount Deposited'] || ''),
                        }));

                    if (formattedData.length === 0) {
                        notify('No valid data found in file');
                        return;
                    }

                    setParsedData(formattedData);
                    setProgress(100);
                }
            } catch (error) {
                console.error('File parsing error:', error);
                notify('Error processing file');
            } finally {
                clearInterval(progressInterval);
            }
        };

        fileReader.onerror = () => {
            notify('Error reading file');
            console.error('FileReader error');
        };

        fileReader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            notify('No data to upload');
            return;
        }

        setIsUploading(true);

        try {
            const response = await fetch('/api/transaction-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    data: parsedData.map(row => ({
                        name: String(row.name || '').trim(),
                        transaction_id: String(row.transaction_id || '').trim(),
                        amount_deposited: String(row.amount_deposited || '').trim(),
                    })).filter(row => row.name && row.transaction_id && row.amount_deposited),
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Upload failed');
            }

            // Create a detailed success message
            let message = `Successfully uploaded ${result.successful} records.`;

            if (result.duplicates > 0) {
                message += `\n${result.duplicates} duplicate transaction IDs were skipped.`;
                console.log('Duplicate entries:', result.duplicateEntries);
            }

            if (result.failed > 0) {
                message += `\n${result.failed} records failed to upload.`;
            }

            notify(message);

            if (result.successful > 0) {
                setFiles([]);
                setParsedData([]);
                setProgress(0);
            }
        } catch (error) {
            console.error('Upload error:', error);
            notify(error.message || 'File upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    React.useEffect(() => {
        if (files.length > 0) {
            parseFile(files[0]);
        }
    }, [files]);


    return (
        <div
            className={`rounded-xl shadow-lg hover:shadow-none transition-all duration-300 ${mode === 'dark' ? 'bg-neutral-800 text-gray-200' : 'bg-white text-gray-900'} p-8`}>
            <p className={`flex flex-col md:flex-row gap-x-2 items-center text-center text-2xl md:text-lg mb-4 px-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                Upload from an Excel Sheet.
                <Link href="/assets/misc/sample-data.xls" className="text-base text-[#0CB4AB] underline">
                    Download sample.
                </Link>
            </p>

            <div
                {...getRootProps()}
                className={`p-12 cursor-pointer flex justify-center border border-dashed ${mode === 'dark' ? 'border-neutral-600 dark:bg-neutral-800' : 'border-gray-300 bg-white'} rounded-xl`}
            >
                <div className="text-center">
            <span
                className={`inline-flex justify-center items-center size-16 ${mode === 'dark' ? 'bg-neutral-700 text-neutral-200' : 'bg-gray-100 text-gray-800'} rounded-full`}
            >
                <CloudArrowUpIcon className={`h-6 w-6 ${mode === 'dark' ? 'text-neutral-200' : 'text-gray-500'}`}/>
            </span>

                    <div
                        className={`mt-4 flex flex-wrap justify-center text-sm leading-6 ${mode === 'dark' ? 'text-neutral-200' : 'text-gray-600'}`}>
                <span className={`pe-1 font-medium ${mode === 'dark' ? 'text-neutral-200' : 'text-gray-800'}`}>
                    Drop your file here or
                </span>
                        <span
                            onClick={() => document.getElementById('file-input').click()}
                            className={`font-semibold rounded-lg decoration-2 hover:underline ${mode === 'dark' ? 'bg-neutral-800 text-[#0CB4AB] hover:text-teal-700' : 'bg-white text-[#0CB4AB] hover:text-teal-700'}`}
                        >
    browse
</span>

                    </div>

                    <p className={`mt-1 text-xs ${mode === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`}>
                        Pick an Excel file (CSV, XLS, XLSX).
                    </p>
                    {/* Hidden file input element */}
                    <input
                        {...getInputProps()}
                        id="file-input"
                        type="file"
                        className="hidden"
                        accept=".csv,.xls,.xlsx"  // Ensure the file input accepts only these file types
                    />
                </div>
            </div>

            <div className="mt-4 space-y-2" data-hs-file-upload-previews="">
                {files.map((file, index) => (
                    <div
                        key={index}
                        className={`p-3 ${mode === 'dark' ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-gray-300'} border-solid rounded-xl`}
                    >
                        <div className="mb-1 flex justify-between items-center">
                            <div className="flex items-center gap-x-3">
                        <span
                            className={`size-10 flex justify-center items-center border ${mode === 'dark' ? 'border-neutral-700 text-neutral-500' : 'border-gray-200 text-gray-500'} rounded-lg`}
                        >
                            <DocumentTextIcon
                                className={`h-8 w-8 ${mode === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}
                            />
                        </span>
                                <div>
                                    <p className={`text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                <span
                                    className="truncate inline-block max-w-[300px] align-bottom">{file.name}</span>
                                    </p>
                                    <p className={`text-xs ${mode === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>{file.size} bytes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <button
                                    type="button"
                                    onClick={() => removeFile(file)}
                                    className={`text-gray-500 hover:text-gray-800 ${mode === 'dark' ? 'dark:text-neutral-500 dark:hover:text-neutral-200' : ''}`}
                                >
                                    <TrashIcon className="h-4 w-4"/>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-x-3 whitespace-nowrap">
                            <div
                                className={`flex w-full h-2 rounded-full overflow-hidden ${mode === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'}`}
                            >
                                <div
                                    className="flex flex-col justify-center rounded-full overflow-hidden bg-[#FF930A] text-xs text-white text-center whitespace-nowrap transition-all duration-500 hs-file-upload-complete:bg-green-500"
                                    style={{width: `${progress}%`}}
                                />
                            </div>
                            <div className="w-10 text-end">
                        <span className={`text-sm ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {progress}%
                        </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex ">
                <button
                    onClick={handleUpload}
                    disabled={isUploading || parsedData.length === 0}
                    className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-95 disabled:bg-gray-400"
                >
                    {isUploading ? 'Uploading...' : 'Upload Data'}
                </button>
            </div>
        </div>

    );
};

export default FileUploadWithPreview;
