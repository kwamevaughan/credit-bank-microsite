import { useState } from 'react';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import QuizModel from "@/components/quizModel";

const Quiz = ({  }) => {

    return (
        <div
            className="w-full"

        >
            <Header

            />
            <Sidebar

            />

            <main className="py-24">
                <QuizModel />


            </main>
        </div>
    );
}

export default Quiz;