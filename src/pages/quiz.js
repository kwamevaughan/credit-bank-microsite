import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { quizzes } from '../data/questions';
import { toast } from 'react-toastify';
import { useTimer } from 'react-timer-hook';

const Quiz = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState("light");
    const notify = (message) => toast(message);
    const [loading, setLoading] = useState(false);
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalMinutesSpent: 0,
    });

    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [questionsAnsweredToday, setQuestionsAnsweredToday] = useState(0);
    const initialTime = 35; // Each question has 35 seconds
    const questionsForToday = quizzes[activeTopicIndex]?.questions.slice(activeQuestionIndex, activeQuestionIndex + 7);
    const [nextAvailableTime, setNextAvailableTime] = useState(null); // Time when the next set of questions will be available

    const { seconds, restart } = useTimer({
        expiryTimestamp: new Date().getTime() + initialTime * 1000,
        onExpire: () => {
            notify("Time's up! Moving on to the next question.");
            onClickNext(false); // Move to the next question without incrementing answered count
        },
    });

    const updateUserProgress = async (userId, quizId, currentAnsweredCount) => {
        console.log("Updating user progress...", { userId, quizId, currentAnsweredCount, activeQuestionIndex });

        const { error } = await supabase
            .from("user_quiz_progress")
            .update({
                current_question_index: activeQuestionIndex + 1,
                points: result.score,
                questions_answered_today: currentAnsweredCount,
            })
            .eq("user_id", userId)
            .eq("quiz_id", quizId);

        if (error) {
            console.error("Error updating user progress:", error);
            notify("Error updating your quiz progress: " + error.message);
        } else {
            console.log("Successfully updated progress for user with ID: ${userId}.");
        }
    };


    // Load user progress
    const fetchUserProgress = async () => {
        const storedSession = localStorage.getItem("supabase_session");
        if (storedSession) {
            const session = JSON.parse(storedSession);
            const userId = session.user?.id;

            if (!userId) {
                notify("User ID is undefined. Please log in.");
                return;
            }

            const quizId = quizzes?.[activeTopicIndex]?.id;
            if (!quizId || !quizzes[activeTopicIndex]) {
                notify("Quiz ID is undefined. Please check your quiz data.");
                return;
            }

            const { data: userProgress, error } = await supabase
                .from("user_quiz_progress")
                .select("current_question_index, points, questions_answered_today, last_updated")
                .eq("user_id", userId)
                .eq("quiz_id", quizId);

            if (error) {
                console.error("Error fetching user progress:", error);
                notify("Error fetching your quiz progress: " + error.message);
                return;
            }

            if (userProgress.length > 0) {
                const progress = userProgress[0];
                const lastUpdated = new Date(progress.last_updated || 0);
                const now = new Date();

                const isSameDay = (date1, date2) => {
                    return date1.getFullYear() === date2.getFullYear() &&
                        date1.getMonth() === date2.getMonth() &&
                        date1.getDate() === date2.getDate();
                };

                if (!isSameDay(now, lastUpdated)) {
                    // It's a new day, reset progress
                    setQuestionsAnsweredToday(0);
                    setActiveQuestionIndex(progress.current_question_index + 7); // Increment by 7 for the next day's questions
                    setResult({ score: 0, correctAnswers: 0, wrongAnswers: 0, totalMinutesSpent: 0 });
                    console.log("Starting fresh for the day.");
                } else {
                    // Still the same day, so keep the current question index
                    setActiveQuestionIndex(progress.current_question_index);
                    setQuestionsAnsweredToday(progress.questions_answered_today);
                }
            } else {
                // Insert a new progress record if none exists
                await supabase
                    .from("user_quiz_progress")
                    .insert({
                        user_id: userId,
                        quiz_id: quizId,
                        current_question_index: 0,
                        points: 0,
                        questions_answered_today: 0,
                        last_updated: new Date().toISOString(),
                    });
                console.log("Created new progress record for user and quiz.");
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUserProgress();
    }, [activeTopicIndex]);

    useEffect(() => {
        restart(new Date().getTime() + initialTime * 1000);
    }, [activeQuestionIndex, activeTopicIndex]);


    const onClickNext = async (incrementCount = true) => {
        const storedSession = localStorage.getItem("supabase_session");
        let userId;

        if (storedSession) {
            const session = JSON.parse(storedSession);
            userId = session.user?.id;

            if (!userId) {
                notify("User ID is undefined. Please log in.");
                return;
            }
        } else {
            notify("No session found. Please log in again.");
            return;
        }

        const quizId = quizzes?.[activeTopicIndex]?.id;
        if (!quizId) {
            notify("Quiz ID is undefined. Please check your quiz data.");
            return;
        }

        if (selectedAnswerIndex === null) {
            notify("Please select an answer before navigating to the next question.");
            return;
        }

        const isCorrect = quizzes[activeTopicIndex].questions[activeQuestionIndex].choices[selectedAnswerIndex] === quizzes[activeTopicIndex].questions[activeQuestionIndex].correctAnswer;

        setResult(prev => ({
            ...prev,
            score: isCorrect ? prev.score + quizzes[activeTopicIndex].perQuestionScore : prev.score,
            correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
            wrongAnswers: !isCorrect ? prev.wrongAnswers + 1 : prev.wrongAnswers,
            totalMinutesSpent: Math.floor(totalTimeSpent / 60) + Math.floor((initialTime * quizzes[activeTopicIndex].questions.length - seconds) / 60),
        }));

        if (incrementCount) {
            const currentAnsweredCount = questionsAnsweredToday + 1;
            await updateUserProgress(userId, quizId, currentAnsweredCount);
            setQuestionsAnsweredToday(currentAnsweredCount);
        }

        // Log the total number of questions across all topics
        const totalQuestions = quizzes.reduce((acc, topic) => acc + topic.totalQuestions, 0);
        console.log("Total Questions in the Entire Quiz:", totalQuestions);

        // Log the number of questions in the current topic
        console.log("Questions in Current Topic:", quizzes[activeTopicIndex]?.questions.length);

        // If the user has answered 7 questions, stop and show results
        if (questionsAnsweredToday === 7) {
            notify("You have reached the limit of 7 questions today. Please check back tomorrow!");
            setShowResult(true); // Show results if the last question is answered
        } else {
            // Calculate the index of the next question across all topics
            let currentGlobalIndex = 0;
            for (let i = 0; i < activeTopicIndex; i++) {
                currentGlobalIndex += quizzes[i].totalQuestions;
            }
            currentGlobalIndex += activeQuestionIndex;

            // Get the questions for today
            const questionsForToday = getNextSetOfQuestions(currentGlobalIndex, 7);
            console.log("Questions for Today:", questionsForToday);

            // Get the questions for tomorrow (next 7 questions)
            const questionsForTomorrow = getNextSetOfQuestions(currentGlobalIndex + 7, 7);
            console.log("Questions for Tomorrow:", questionsForTomorrow);

            // Update the active question index for the next question
            setTimeout(() => {
                setSelectedAnswerIndex(null);
                setActiveQuestionIndex(activeQuestionIndex + 1); // Go to the next question in the current batch
            }, 2000);
        }
    };

// Function to calculate the next set of questions, considering multiple topics
    const getNextSetOfQuestions = (startIndex, numberOfQuestions) => {
        let questions = [];
        let remainingQuestions = numberOfQuestions;
        let currentIndex = startIndex;

        for (let topic of quizzes) {
            if (remainingQuestions <= 0) break;

            const topicQuestions = topic.questions.slice(currentIndex - questions.length); // Get the questions after the global index
            if (topicQuestions.length <= remainingQuestions) {
                questions = [...questions, ...topicQuestions]; // Add all if we have fewer questions than remaining
                remainingQuestions -= topicQuestions.length;
            } else {
                questions = [...questions, ...topicQuestions.slice(0, remainingQuestions)];
                remainingQuestions = 0; // All questions added, exit
            }
        }

        return questions;
    };




    useEffect(() => {
        if (typeof window !== "undefined") {
            setSidebarOpen(window.innerWidth > 768);
        }
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const savedMode = localStorage.getItem("mode");
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setMode(systemMode);
        }
    }, []);

    const toggleMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === "dark" ? "light" : "dark";
            localStorage.setItem("mode", newMode);
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

            <main className={`flex-1 pt-14 p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"} ${mode === "dark" ? "bg-[#0a0c1d] text-white" : "bg-[#f7f1eb] text-black"}`}>
                <div className="mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4 text-center">
                        <span className="font-orange">Take Our</span> Fun Quiz{" "}
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
                            <h2 className="text-xl sm:text-2xl">{`Pillar: ${activeTopicIndex + 1} ${quizzes[activeTopicIndex]?.topic}`}</h2>
                            <span className="bg-[#cff0ed] p-2 rounded-lg">Time left: <span
                                className="bg-black p-2 rounded-lg text-white font-bold">{seconds} sec</span></span>
                        </div>

                        {questionsAnsweredToday === 7 ? (
                            <div className="text-center">
                                <h2 className="text-xl mb-4">No Question Available</h2>
                                <p className="text-lg">
                                    Next set of questions will be available in {nextAvailableTime}
                                </p>
                            </div>
                        ) : (
                            <div>
                                {quizzes[activeTopicIndex]?.questions[activeQuestionIndex] ? (
                                    <h2 className="text-xl mb-4">{quizzes[activeTopicIndex].questions[activeQuestionIndex].question}</h2>
                                ) : (
                                    <h4 className="text-lg mb-4">No Question Available. Check back tomorrow!</h4> // Fallback if no question is found
                                )}
                            </div>
                        )}

                        <ul className="space-y-2">
                            {quizzes[activeTopicIndex]?.questions[activeQuestionIndex]?.choices?.map((answer, index) => {
                                let style = "";
                                if (selectedAnswerIndex !== null) {
                                    if (index === selectedAnswerIndex) {
                                        style += ' bg-blue-200';
                                        if (answer !== quizzes[activeTopicIndex].questions[activeQuestionIndex].correctAnswer) {
                                            style = 'bg-red-200';
                                        }
                                    } else if (answer === quizzes[activeTopicIndex].questions[activeQuestionIndex].correctAnswer) {
                                        style += ' bg-green-200';
                                    }
                                }

                                return (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            if (selectedAnswerIndex === null) {
                                                setSelectedAnswerIndex(index);
                                            }
                                        }}
                                        className={`cursor-pointer p-2 border rounded ${style}`}
                                    >
                                        {answer}
                                    </li>
                                );
                            })}
                        </ul>

                        <button
                            onClick={onClickNext}
                            disabled={selectedAnswerIndex === null}
                            className={`mt-4 bg-[#ff9409] text-white py-2 px-4 rounded ${
                                selectedAnswerIndex === null ? 'disabled:opacity-50' : ''
                            }`}
                        >
                            {activeQuestionIndex === quizzes[activeTopicIndex]?.questions?.length - 1
                                ? "Done" // Change button to "Done" on the last question
                                : "Next"}
                        </button>

                        <div className="flex justify-between">
                            <span>{questionsAnsweredToday}/{7} Questions Answered Today</span>
                            <span>Points: {result.score}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded shadow-md text-center">
                        <h3 className="text-xl mb-4">Result</h3>
                        <p>Total Questions: {/* Total question count logic */}</p>
                        <p>Total Score: {result.score}</p>
                        <p>Correct Answers: {result.correctAnswers}</p>
                        <p>Wrong Answers: {result.wrongAnswers}</p>
                        <p>Total Minutes Spent: {result.totalMinutesSpent} minutes</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Quiz;
