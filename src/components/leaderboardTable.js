import { useEffect, useState, useRef } from 'react';
import { supabase } from '/lib/supabase';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const LeaderboardTable = ({ token, mode, toggleMode, toggleSidebar, isSidebarOpen }) => {
    const [leaders, setLeaders] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(5);
    const prevLeadersRef = useRef([]);

    const fetchLeaderboard = async () => {
        const from = (page - 1) * pageSize;

        try {
            const { data, error, count } = await supabase
                .from('users')
                .select('id, name, country, points, profile_image, actions_completed', { count: 'exact' })
                .order('points', { ascending: false })
                .ilike('name', `%${search}%`)
                .range(from, from + pageSize - 1);

            if (error) throw error;

            // Store current leaders for comparison
            prevLeadersRef.current = leaders;

            // Update leaders while preserving existing instances
            setLeaders(data.map(newLeader => {
                const existingLeader = leaders.find(l => l.id === newLeader.id);
                return {
                    ...newLeader,
                    prevPoints: existingLeader ? existingLeader.points : newLeader.points,
                    key: newLeader.id
                };
            }));

            setTotalCount(count);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [page, search]);

    // Real-time updates
    useEffect(() => {
        const channel = supabase
            .channel('users-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'users'
            }, () => {
                fetchLeaderboard();
            })
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
        <main className={`${mode === 'dark' ? 'text-white' : 'bg-transparent text-black'} rounded-lg px-4 md:px-0 transition-all duration-300 ease-in-out  `}>
            <div className={`block w-full pb-10 pt-6 rounded-lg ${mode === 'dark' ? 'bg-[#0a0c1d] text-white border-gray-600' : 'bg-transparent text-black border-gray-300'} transition-all duration-300 ease-in-out`}>
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                        <input
                            type="search"
                            className={`block w-full p-2 rounded-lg ${mode === 'dark' ? 'bg-black text-white border-gray-600' : 'bg-white text-black border-gray-300'} transition-all duration-300 ease-in-out`}
                            placeholder="Search by name"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-transparent text-black'} min-w-full media-table table-auto border-separate border-spacing-y-4 rounded-md`}>
                            <thead>
                            <tr className="hidden">
                                <th className="px-4 py-2 text-left border-r">Rank</th>
                                <th className="px-4 py-2 text-left border-r">Name</th>
                                <th className="px-4 py-2 text-left">Actions Completed</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaders.map((leader, index) => {
                                // Rank image logic
                                let rankImageSrc = '/assets/images/position-default.png';
                                if (leader.points > 20) {
                                    if (index === 0) rankImageSrc = '/assets/images/position-1.png';
                                    else if (index === 1) rankImageSrc = '/assets/images/position-2.png';
                                    else if (index === 2) rankImageSrc = '/assets/images/position-3.png';
                                }

                                // Button styles
                                let buttonClass = "bg-gray-200 hover:bg-gray-500 text-slate-600 hover:text-white px-6 py-2 rounded-lg";
                                let buttonText = "Keep Going!";
                                if (leader.points > 20) {
                                    if (index === 0) {
                                        buttonClass = "bg-yellow-400 hover:bg-yellow-600 text-slate-600 hover:text-white px-6 py-2 rounded-lg";
                                        buttonText = "Top Performer";
                                    } else if (index === 1) {
                                        buttonClass = "bg-green-400 hover:bg-green-600 text-slate-600 hover:text-white px-6 py-2 rounded-lg";
                                        buttonText = "Steady Climber";
                                    } else if (index === 2) {
                                        buttonClass = "bg-orange-400 hover:bg-orange-600 text-slate-600 hover:text-white px-6 py-2 rounded-lg";
                                        buttonText = "Rising Star";
                                    }
                                }

                                return (
                                    <motion.tr
                                        key={leader.key}
                                        layout
                                        transition={{
                                            layout: { duration: 0.3, ease: "easeInOut" }
                                        }}
                                        initial={false}
                                        className={`shadow-md hover:shadow-sm ${mode === 'dark' ? 'bg-black' : 'bg-white'} rounded-md`}
                                    >
                                        <td className="flex text-gray-400 px-4 py-2 border-r items-center">
                                            <motion.span layout
                                                         className="text-gray-600 md:text-gray-400 text-lg font-extrabold">
                                                {(page - 1) * pageSize + index + 1}.
                                            </motion.span>

                                            <Image
                                                src={rankImageSrc}
                                                alt={`Rank ${index + 1}`}
                                                width={60}
                                                height={60}
                                                className="ml-2"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-r">
                                            <div
                                                className=" flex flex-row  md:flex md:flex-row items-center justify-between">
                                                    <span className="flex items-center gap-4">
                                                        <Image
                                                            src={leader.profile_image || '/assets/images/placeholder.png'}
                                                            alt={leader.profile_image ? 'Leader Image' : 'Placeholder Image'}
                                                            width={50}
                                                            height={50}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                        <span className="text-teal-600 font-bold text-lg">
                                                            {leader.name}
                                                        </span>
                                                    </span>
                                                <motion.span
                                                    layout
                                                    className="text-[#ff9409] text-2xl md:text-base mt-2 md:ml-4 md:mt-0"
                                                >
                                                    {leader.points} Points
                                                </motion.span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex justify-between items-center">
                                                <motion.span
                                                    layout
                                                    className="text-[#ff9409] text-lg md:text-base"
                                                >
                                                    {leader.actions_completed || 0} Actions Completed
                                                </motion.span>
                                                <button className={buttonClass}>
                                                    {buttonText}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

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

export default LeaderboardTable;