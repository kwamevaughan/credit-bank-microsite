import { useState } from 'react';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import LeaderboardTable from "@/components/leaderboardTable";

const Leaderboard = ({  }) => {

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
            <Header

            />
            <Sidebar

            />

            <main className="py-24">
                <LeaderboardTable />


            </main>
        </div>
    );
}

export default Leaderboard;