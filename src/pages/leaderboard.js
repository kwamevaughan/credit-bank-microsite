import { useState } from 'react';
import NavHeader from "@/layouts/nav-header";
import LeaderboardTable from "@/components/leaderboardTable";

export default function Leaderboard() {


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

            <main className="py-24">
                <LeaderboardTable />


            </main>
        </div>
    );
}
