import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { quizzes } from '../data/questions';
import { toast } from 'react-toastify';
import { useTimer } from 'react-timer-hook';

const Quiz = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const notify = (message) => toast(message);
    const [insertError, setInsertError] = useState(null);
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalMinutesSpent: 0, // New field for total minutes spent
    });

    const [totalTimeSpent, setTotalTimeSpent] = useState(0); // Total time spent in seconds
    const initialTime = 35; // Each question has 35 seconds
    const [questionsAnsweredToday, setQuestionsAnsweredToday] = useState(0); // Track questions answered today

    const { seconds, start, restart } = useTimer({
        expiryTimestamp: new Date().getTime() + initialTime * 1000,
        onExpire: () => {
            notify("Time's up! Moving on to the next question.");
            onClickNext(); // Move to the next question on timer expiry
        },
    });

    useEffect(() => {
        // Reset timer when question changes
        restart(new Date().getTime() + initialTime * 1000);
    }, [activeQuestionIndex, activeTopicIndex]);

    useEffect(() => {
        const savedCount = localStorage.getItem('questionsAnsweredToday');
        if (savedCount) {
            setQuestionsAnsweredToday(parseInt(savedCount));
        }
    }, []);

    const totalQuestions = quizzes.reduce((acc, quiz) => acc + quiz.totalQuestions, 0);
    const answeredQuestions = activeTopicIndex * quizzes[activeTopicIndex].totalQuestions + activeQuestionIndex + 1;
    const progress = (answeredQuestions / totalQuestions) * 100;

    const { questions } = quizzes[activeTopicIndex];
    const { question, choices, correctAnswer } = questions[activeQuestionIndex];

    const onClickNext = async () => {
        // Check if the user has answered the maximum number of questions allowed for today
        if (questionsAnsweredToday >= 7) {
            notify("You have already answered 7 questions today. Please come back tomorrow!");
            return;
        }

        // Check if the user has submitted an answer
        if (selectedAnswerIndex === null) {
            notify("Please select an answer before navigating to the next question.");
            return;
        }

        const isCorrect = choices[selectedAnswerIndex] === correctAnswer;

        // Set the result stats
        setResult(prev => ({
            ...prev,
            score: isCorrect ? prev.score + quizzes[activeTopicIndex].perQuestionScore : prev.score,
            correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
            wrongAnswers: !isCorrect ? prev.wrongAnswers + 1 : prev.wrongAnswers,
        }));

        // Calculate time spent
        setTotalTimeSpent(prev => prev + (initialTime - seconds));

        // Check if there are more questions to answer
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1); // Move to the next question
        } else if (activeTopicIndex < quizzes.length - 1) {
            // If there are more topics, move to the next topic
            setActiveTopicIndex(prev => prev + 1);
            setActiveQuestionIndex(0); // Reset question index for the new topic
        } else {
            // We have completed all the questions
            const totalMinutes = Math.floor(totalTimeSpent / 60) + Math.floor((initialTime * totalQuestions - seconds) / 60);
            setResult(prev => ({
                ...prev,
                totalMinutesSpent: totalMinutes,
            }));

            // Check session and insert quiz result if necessary
            const storedSession = localStorage.getItem('supabase_session');
            if (storedSession) {
                const session = JSON.parse(storedSession);
                const userId = session.user?.id; // Access user ID from the stored session

                // Quiz ID based on activeTopicIndex
                const quizId = activeTopicIndex + 1;

                // Check if the quiz exists
                const { data: quizData, error: quizError } = await supabase
                    .from('quizzes')
                    .select('id,title')
                    .eq('id', quizId);

                if (quizError) {
                    console.error('Error fetching quiz:', quizError);
                    notify('Error checking for quiz existence: ' + quizError.message);
                    return;
                }

                let quizExists = quizData.length > 0 && quizData[0].id === quizId;

                if (!quizExists) {
                    // Insert the quiz since it doesn't exist
                    const quizToInsert = quizzes[activeTopicIndex]; // Get quiz details from your quizzes array
                    const newQuiz = {
                        id: quizId,
                        title: quizToInsert.topic || 'Unknown Topic',
                        totalQuestions: quizToInsert.totalQuestions,
                        perQuestionScore: quizToInsert.perQuestionScore,
                    };

                    const { error: insertQuizError } = await supabase
                        .from('quizzes')
                        .insert(newQuiz);

                    if (insertQuizError) {
                        console.error('Failed to insert quiz:', insertQuizError);
                        notify('Failed to create quiz record: ' + insertQuizError.message);
                        return;
                    }
                }

                // Finally, insert or upsert the user's quiz result
                const finalScore = result.score; // Use the final score calculated earlier

                const { error: upsertError } = await supabase
                    .from('user_quizzes')
                    .upsert([{
                        user_id: userId, // Current logged-in user ID
                        quiz_id: quizId,  // The current quiz ID
                        score: finalScore,
                        questions_answered: totalQuestions,
                        completion_date: new Date().toISOString(),
                    }]);

                if (upsertError) {
                    console.error('Upsert Error:', upsertError);
                    notify('Failed to record quiz results: ' + upsertError.message);
                } else {
                    notify('Quiz results recorded successfully');
                }

                // Update questions answered today count
                const newCount = questionsAnsweredToday + 1;
                setQuestionsAnsweredToday(newCount);
                localStorage.setItem('questionsAnsweredToday', newCount.toString());

                setShowResult(true); // Show quiz results to the user
            } else {
                notify('Unable to fetch user session. Please log in again.');
            }

            // Reset selection for the next quiz question (if any)
            setSelectedAnswerIndex(null);
        }
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
        <div className="w-full">
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

            <main className={`flex-1 pt-14 p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'}`}>
                <div className="mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4 text-center">
                        <span className="font-orange">Take Our</span> Fun Quiz{' '}
                        <span className="font-orange">and</span> Earn Points!
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-center">
                        Take our fun and interactive quiz to earn 20 points instantly.
                        <br />
                        Test your knowledge, challenge yourself, and climb the leaderboard.
                        Every question gets you closer to exciting rewards!
                    </p>
                </div>

                {!showResult ? (
                    <div className="bg-white p-8 rounded shadow-md max-w-4xl mx-auto">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl sm:text-2xl">Pillar: {activeTopicIndex + 1} {quizzes[activeTopicIndex].topic}</h2>

                            <span className="bg-[#cff0ed] p-2 rounded-lg">
                                Time left: <span className="bg-black p-2 rounded-lg text-white font-bold">{seconds} sec</span>
                            </span>
                        </div>
                        <div className="bg-[#cff0ed] rounded-full h-2.5 dark:bg-gray-700 mb-6 overflow-hidden">
                            <div
                                className="bg-[#0CB4AB] h-2.5 rounded-full transition-width duration-500 ease-in-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
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
                            className="mt-4 bg-[#ff9409] text-white py-2 px-4 rounded disabled:opacity-50"
                        >
                            {activeQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded shadow-md text-center">
                        <h3 className="text-xl mb-4">Result</h3>
                        <p>Total Questions: {totalQuestions}</p>
                        <p>Total Score: {result.score}</p>
                        <p>Correct Answers: {result.correctAnswers}</p>
                        <p>Wrong Answers: {result.wrongAnswers}</p>
                        <p>Total Minutes Spent: {result.totalMinutesSpent} minutes</p> {/* Display total minutes spent */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Quiz;