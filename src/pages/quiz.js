import {useEffect, useState} from 'react';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { quiz } from '../data/questions';
import Link from 'next/link';

const Quiz = ({  }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');

    const [activeQuestion, setActiveQuestion] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
    });

    const { questions } = quiz;
    const { question, choices, correctAnswer } = questions[activeQuestion];

    const onClickNext = () => {
        const isCorrect = selectedAnswerIndex !== null && choices[selectedAnswerIndex] === correctAnswer;

        setResult(prev => ({
            ...prev,
            score: isCorrect ? prev.score + quiz.perQuestionScore : prev.score,
            correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
            wrongAnswers: !isCorrect ? prev.wrongAnswers + 1 : prev.wrongAnswers,
        }));

        if (activeQuestion < questions.length - 1) {
            setActiveQuestion(prev => prev + 1);
        } else {
            setShowResult(true);
        }

        setSelectedAnswerIndex(null);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSidebarOpen(window.innerWidth > 768);
        }
    }, []);


    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);

    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };


    return (
        <div
            className="w-full"

        >
            <Header
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                mode={mode}

            />

            <main className={`flex-1 p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'}`}>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4 text-center">
                            <span className="font-orange">Take Our</span> Fun Quiz <span
                            className="font-orange">and</span> Earn Points!
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-center">
                            Take our fun and interactive quiz to earn 20 points instantly.
                            Test your knowledge, challenge yourself, and climb the leaderboard.
                            Every question gets you closer to exciting rewards!
                        </p>

                        <span className="p-4"></span>


                    {!showResult ? (
                        <div className="bg-white p-8 rounded shadow-md">
                            <h2 className="text-xl mb-4">{question}</h2>
                            <ul className="space-y-2">
                                {choices.map((answer, index) => (
                                    <li
                                        key={index}
                                        onClick={() => setSelectedAnswerIndex(index)}
                                        className={`cursor-pointer p-2 border rounded ${selectedAnswerIndex === index ? 'bg-blue-200' : ''}`}
                                    >
                                        {answer}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={onClickNext}
                                disabled={selectedAnswerIndex === null}
                                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
                            >
                                {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded shadow-md text-center">
                            <h3 className="text-xl mb-4">Result</h3>
                            <p>Total Questions: {quiz.totalQuestions}</p>
                            <p>Total Score: {result.score}</p>
                            <p>Correct Answers: {result.correctAnswers}</p>
                            <p>Wrong Answers: {result.wrongAnswers}</p>
                        </div>
                    )}


            </main>
        </div>
    );
}

export default Quiz;