import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Image from 'next/image';

// Fetch the countries.json file from the public directory
const countryFlagData = require('/public/assets/misc/countries.json');

// Create a mapping from country name to ISO code
const countryCodeMapping = countryFlagData.reduce((acc, { name, code, image }) => {
    acc[name] = { code, image };
    return acc;
}, {});

const LeaderboardTable = ({ token, mode, toggleMode, toggleSidebar, isSidebarOpen }) => {
    const [leaders, setLeaders] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(5);

    const fetchLeaderboard = async () => {
        setIsFetching(true);
        const from = (page - 1) * pageSize;

        try {
            const { data, error, count } = await supabase
                .from('users')
                .select('id, name, country, points, profile_image, actions_completed', { count: 'exact' }) // Fetch actions_completed
                .order('points', { ascending: false })
                .ilike('name', `%${search}%`)
                .range(from, from + pageSize - 1);

            if (error) {
                throw error;
            }

            setLeaders(data);
            setTotalCount(count);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [page, search]); // Fetch data when page or search changes

    useEffect(() => {
        const channel = supabase
            .channel('users-channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'users',
            }, () => fetchLeaderboard())
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users',
            }, () => fetchLeaderboard())
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'users',
            }, () => fetchLeaderboard())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <main
            className={`${mode === 'dark' ? ' text-white' : 'bg-transparent text-black'} rounded-lg px-4 md:px-0 transition-all duration-300 ease-in-out px-8  `}
        >
            <div className={`block w-full pb-10 pt-6 rounded-lg ${mode === 'dark' ? 'bg-[#0a0c1d] text-white border-gray-600' : 'bg-transparent text-black border-gray-300'} transition-all duration-300 ease-in-out`}
            >
                <h2 className="text-4xl font-bold text-teal-600 mb-4 text-center">Leaderboard</h2>
                <h3 className="text-2xl font-bold text-[#ff9409] mb-4 text-center">See Who's Leading the Pack!</h3>
                <p className="mb-4 text-center">Stay competitive! Check the live leaderboard to see who's winning.</p>
                <div
                    className="max-w-4xl mx-auto"> {/* Main container for centering the table, search, and pagination */}

                    {/* Search input */}
                    <div className="mb-4">
                        <input
                            type="search"
                            className={`block w-full p-2 rounded-lg ${mode === 'dark' ? 'bg-black text-white border-gray-600' : 'bg-white text-black border-gray-300'} transition-all duration-300 ease-in-out`}
                            placeholder="Search by name"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                        />
                    </div>


                    {isFetching ? (
                        <p>Fetching leaderboard...</p>
                    ) : error ? (
                        <p className="text-red-500">Failed to fetch leaderboard: {error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table
                                className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-transparent text-black'} min-w-full table-auto border-separate border-spacing-y-4 rounded-md`}>
                                <thead>
                                <tr className={`hidden`}>
                                    <th className={`${mode === 'dark' ? 'bg-[#101720]' : 'bg-gray-100'} px-4 py-2 text-left border-r`}>Rank</th>
                                    <th className={`${mode === 'dark' ? 'bg-[#101720]' : 'bg-gray-100'} px-4 py-2 text-left border-r`}>Name</th>
                                    <th className={`${mode === 'dark' ? 'bg-[#101720]' : 'bg-gray-100'} px-4 py-2 text-left`}>Actions
                                        Completed
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {leaders.length > 0 ? (
                                    leaders.map((leader, index) => {
                                        // Determine rank image based on the index
                                        let rankImageSrc = '/assets/images/position-default.png'; // Default for others
                                        if (index === 0) {
                                            rankImageSrc = '/assets/images/position-1.png';
                                        } else if (index === 1) {
                                            rankImageSrc = '/assets/images/position-2.png';
                                        } else if (index === 2) {
                                            rankImageSrc = '/assets/images/position-3.png';
                                        }

                                        // Define button styles based on rank
                                        let buttonClass = "bg-gray-200 hover:bg-gray-500 text-teal-600 hover:text-white px-6 py-2 rounded-lg"; // Default for others
                                        let buttonText = "Keep Going!";

                                        if (index === 0) {
                                            buttonClass = "bg-yellow-400 hover:bg-yellow-600 text-teal-600 hover:text-white px-6 py-2 rounded-lg"; // Champion in the Lead
                                            buttonText = "Top Performer";
                                        } else if (index === 1) {
                                            buttonClass = "bg-green-400 hover:bg-green-600 text-teal-600 hover:text-white px-6 py-2 rounded-lg"; // Steady Climber
                                            buttonText = "Steady Climber";
                                        } else if (index === 2) {
                                            buttonClass = "bg-orange-400 hover:bg-orange-600 text-teal-600 hover:text-white px-6 py-2 rounded-lg"; // Rising Star
                                            buttonText = "Rising Star";
                                        }

                                        return (
                                            <tr
                                                key={leader.id}
                                                className={`shadow-md hover:shadow-sm transition-all duration-300 ease-in-out ${mode === 'dark' ? 'bg-black' : 'bg-white'} rounded-md`}
                                                style={{transform: `translateY(${(index - 1) * 10}px)`}} // Added smooth animation
                                            >
                                                <td className="text-gray-400 px-4 py-2 border-r flex items-center">
                                                    {(page - 1) * pageSize + index + 1}.
                                                    <Image
                                                        src={rankImageSrc}
                                                        alt={`Rank ${index + 1}`}
                                                        width={60} // Adjust size as needed
                                                        height={60} // Adjust size as needed
                                                        className="ml-2"
                                                    />
                                                </td>

                                                <td className="px-4 py-2 border-r">
                                                    <div className="sm:block md:flex items-center justify-between">
                                                    <span className="flex items-center gap-4">
                                                        <Image
                                                            src={leader.profile_image ? leader.profile_image : '/assets/images/placeholder.png'}
                                                            alt={leader.profile_image ? 'Leader Image' : 'Placeholder Image'}
                                                            width={50}
                                                            height={50}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                        <span className="text-teal-600 font-bold text-lg">
                                                            {leader.name}
                                                        </span>
                                                    </span>
                                                        <span className="text-[#ff9409] mt-2 md:ml-4 md:mt-0">
                                                        {leader.points} Points
                                                    </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-between items-center">
                                                    <span className="text-[#ff9409]">
                                                        {leader.actions_completed ? leader.actions_completed : 0} Actions Completed
                                                    </span>
                                                        <button className={buttonClass}>
                                                            {buttonText}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                                            No leaders found.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-4 px-4">
                        <button
                            className={`bg-gray-300 text-gray-600 py-1 px-2 rounded ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            className={`bg-gray-300 text-gray-600 py-1 px-2 rounded ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </main>

    );
};

export default LeaderboardTable
