import { useEffect, useState, useCallback } from 'react';
import { supabase } from '/lib/supabase'; // Make sure this is correctly initialized
import Image from 'next/image';
import NavHeader from "@/layouts/nav-header";

// Fetch the countries.json file from the public directory
const countryFlagData = require('/public/assets/misc/countries.json');

// Create a mapping from country name to ISO code
const countryCodeMapping = countryFlagData.reduce((acc, { name, code, image }) => {
    acc[name] = { code, image };
    return acc;
}, {});

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(10);

    const fetchLeaderboard = useCallback(async () => {
        setIsFetching(true);
        const from = (page - 1) * pageSize;

        try {
            const { data, error, count } = await supabase
                .from('users')
                .select('id, name, country, points', { count: 'exact' })
                .order('points', { ascending: false }) // Order by points in descending order
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
    }, [page, search, pageSize]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    useEffect(() => {
        const channel = supabase
            .channel('users') // Create a channel for real-time updates
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'users',
            }, () => fetchLeaderboard()) // Handle INSERT events
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users',
            }, (payload) => {
                console.log('Updated row:', payload); // Log to check real-time updates
                // Update the state directly to avoid refetching entire leaderboard
                setLeaders((prevLeaders) => {
                    // Update the leader’s points
                    const updatedLeaders = prevLeaders.map((leader) =>
                        leader.id === payload.new.id
                            ? { ...leader, points: payload.new.points } // Update points
                            : leader
                    );

                    // Sort the leaders array by points to rearrange rankings
                    return updatedLeaders
                        .sort((a, b) => b.points - a.points); // Sort by points in descending order
                });
            }) // Handle UPDATE events
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'users',
            }, () => fetchLeaderboard()) // Handle DELETE events
            .subscribe(); // Start listening

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchLeaderboard]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <NavHeader />

        <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4"
             style={{
                 backgroundImage: `url('/assets/images/main-login-bg.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat',
             }}>
            <h2 className="text-4xl font-bold text-teal-600 mb-4 text-center">Leaderboard</h2>
            <h3 className="text-2xl font-bold text-orange-600 mb-4 text-center">See Who's Leading the Pack!</h3>
            <p className="mb-4 text-center">Stay competitive! Check the live leaderboard to see who's winning.</p>
            <div className="max-w-4xl mx-auto"> {/* Main container for centering the table, search, and pagination */}

                {/* Search input */}
                <div className="mb-4">
                    <input
                        type="search"
                        className="block w-full p-2 border border-gray-300 rounded-lg"
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
                    <div className="overflow-x-auto"> {/* Enable horizontal scrolling for small screens */}
                        <table className="min-w-full table-auto border-separate border-spacing-y-4 rounded-md">
                            <thead>
                            <tr className="hidden">
                                <th className="px-4 py-2 text-left border-r">Rank</th>
                                <th className="px-4 py-2 text-left border-r">Name</th>
                                <th className="px-4 py-2 text-left">Actions Completed</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaders.length > 0 ? (
                                leaders.map((leader, index) => {
                                    const countryFlag = countryCodeMapping[leader.country] || {};
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
                                            className="shadow-md hover:shadow-sm transition-all duration-300 ease-in-out bg-white rounded-md"
                                            style={{ transform: `translateY(${(index - 1) * 10}px)` }} // Added smooth animation
                                        >
                                            <td className="text-gray-400 px-4 py-2 border-r flex items-center">
                                                {(page - 1) * pageSize + index + 1}.
                                                {countryFlag.code && (
                                                    <Image
                                                        src={countryFlag.image}
                                                        alt={leader.country}
                                                        width={40} // Or adjust size as needed
                                                        height={40} // Or adjust size as needed
                                                        className="ml-2"
                                                    />
                                                )}
                                            </td>

                                            <td className="px-4 py-2 border-r">
                                                <div className="sm:block md:flex items-center justify-between">
                            <span className="flex items-center gap-4">
                                <Image
                                    src="/assets/images/placeholder.png"
                                    alt="Placeholder Image"
                                    width={50}
                                    height={50}
                                />
                                <span className="text-teal-600 font-bold text-lg">
                                    {leader.name}
                                </span>
                            </span>
                                                    <span className="text-orange-600 mt-2 md:ml-4 md:mt-0">
                                {leader.points} Points
                            </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-orange-600">NaN Actions Completed</span>
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
                <div className="flex justify-between mt-4 px-4">
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
        </div>
    );
};

export default Leaderboard;
