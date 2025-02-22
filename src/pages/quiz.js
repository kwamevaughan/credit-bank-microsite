import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import useUserData from '../hooks/useUserData';
import { useUser } from '@/context/UserContext';
import useSignOut from '@/hooks/useSignOut';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { quizzes } from '../data/questions';
import { toast } from 'react-toastify';
import { useTimer } from 'react-timer-hook';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';

const Quiz = () => {
    const { token, setToken } = useUser();
    const userData = useUserData(token);
    const [userName, setUserName] = useState('');
    const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the hook
    const { handleSignOut } = useSignOut();
    const { mode, toggleMode } = useTheme(); // Use the hook
    const [isModalOpen, setIsModalOpen] = useState(false); // State for Modal
    const notify = (message) => toast(message);
    const [loading, setLoading] = useState(false)
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isQuizComplete, setIsQuizComplete] = useState(false);
    const [quizAvailable, setQuizAvailable] = useState(true);
    const [globalQuestionIndex, setGlobalQuestionIndex] = useState(0);
    const [randomizedQuizzes, setRandomizedQuizzes] = useState([]);

    // Function to shuffle an array using Fisher-Yates algorithm
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffleQuestionsAndChoices = () => {
        const randomizedQuestions = quizzes.map((topic) => {
            const shuffledQuestions = shuffleArray(topic.questions.map((question) => ({
                ...question,     // Copy existing question
                choices: shuffleArray([...question.choices]), // Shuffle choices here
            })));

            return {
                ...topic,
                questions: shuffledQuestions,
            };
        });
        setRandomizedQuizzes(randomizedQuestions); // Save this to state
    };

    useEffect(() => {
        shuffleQuestionsAndChoices();
    }, [quizAvailable]);


    // Calculate total questions across all topics
    const totalQuestionsAcrossTopics = quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0);

    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalMinutesSpent: 0,
        totalSecondsSpent: 0,  // Add this new field
    });

    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [questionsAnsweredToday, setQuestionsAnsweredToday] = useState(0);
    const initialTime = 35; // Each question has 35 seconds
    const questionsForToday = quizzes[activeTopicIndex]?.questions.slice(activeQuestionIndex, activeQuestionIndex + 7);
    const [nextAvailableTime, setNextAvailableTime] = useState(null); // Time when the next set of questions will be available
    const [isLastQuiz, setIsLastQuiz] = useState(false);

    const { seconds, restart, pause } = useTimer({
        expiryTimestamp: new Date().getTime() + initialTime * 1000,
        onExpire: async () => {
            if (quizAvailable && !showResult) {
                notify("Time's up! Moving on to the next question.");
                setSelectedAnswerIndex(99);
                await onClickNext(true);
            }
        },
    });

    // Add a useEffect to handle timer state based on quiz availability
    useEffect(() => {
        if (!quizAvailable || showResult) {
            pause();
        } else {
            restart(new Date().getTime() + initialTime * 1000);
        }
    }, [quizAvailable, showResult]);

    const calculateNextAvailableTime = (lastUpdated) => {
        const now = new Date();
        const tomorrow = new Date(lastUpdated);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const timeRemaining = tomorrow - now;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        let intervalId;

        if (showResult && !quizAvailable) {
            // Use the existing calculateNextAvailableTime function
            intervalId = setInterval(() => {
                const timeRemaining = calculateNextAvailableTime(new Date());
                if (timeRemaining.startsWith('0h 0m 0s')) {
                    // Time's up - quiz should be available again
                    clearInterval(intervalId);
                    setQuizAvailable(true);
                    setShowResult(false);
                    fetchUserProgress(); // Refresh the quiz state
                } else {
                    setNextAvailableTime(timeRemaining);
                }
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [showResult, quizAvailable]);


    // Function to get topic and question index from global index
    const getQuestionFromGlobalIndex = (globalIndex) => {
        let remainingIndex = globalIndex;
        let topicIndex = 0;

        while (topicIndex < quizzes.length) {
            const currentTopicQuestions = quizzes[topicIndex].questions.length;

            if (remainingIndex < currentTopicQuestions) {
                // We found the right topic and can return the specific question index
                return {
                    topicIndex,
                    questionIndex: remainingIndex
                };
            }

            // Subtract this topic's questions from remaining and move to next topic
            remainingIndex -= currentTopicQuestions;
            topicIndex++;
        }
// If we've gone beyond all questions, calculate the proper wrap-around
        // Instead of defaulting to topic 0, we need to do a proper modulo calculation
        const totalQuestions = quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0);
        const wrappedGlobalIndex = globalIndex % totalQuestions;

        // Recalculate with the wrapped index
        return getQuestionFromGlobalIndex(wrappedGlobalIndex);
    };

    const updateUserProgress = async (userId, quizId, currentAnsweredCount, isComplete = false, newResults) => {
        const now = new Date().toISOString();

        const updateData = {
            global_question_index: globalQuestionIndex,
            current_topic_index: activeTopicIndex,
            current_question_index: activeQuestionIndex,
            questions_answered_today: currentAnsweredCount,
            points: newResults.score,
            correct_answers: newResults.correctAnswers,
            wrong_answers: newResults.wrongAnswers,
            total_seconds_spent: newResults.totalSecondsSpent,
            last_updated: now,
            completed_for_day: isComplete
        };

        const { error } = await supabase
            .from("user_quiz_progress")
            .upsert({
                user_id: userId,
                quiz_id: 1, // Always use the same quiz_id
                ...updateData
            }, {
                onConflict: 'user_id, quiz_id' // Specify both fields in onConflict
            });

        if (error) {
            console.error("Error updating progress:", error);
            notify("Error saving your progress: " + error.message);
        }
    };

    // Helper function to format time
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        if (minutes === 0) {
            return `${seconds} seconds`;
        }
        return `${minutes}min ${seconds}seconds`;
    };

    // Load user progress
    const fetchUserProgress = async () => {
        setLoading(true);
        const storedSession = localStorage.getItem("supabase_session");

        if (!storedSession) {
            setLoading(false);
            return;
        }

        const session = JSON.parse(storedSession);
        const userId = session.user?.id;

        if (!userId) {
            notify("Please log in to continue.");
            setLoading(false);
            return;
        }

        try {
            const { data: userProgress, error } = await supabase
                .from("user_quiz_progress")
                .select("*")
                .eq("quiz_id", 1) // Always query for quiz_id: 1
                .eq("user_id", userId) // Add this condition
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            const now = new Date();

            // If no progress exists, create initial progress
            if (!userProgress) {
                const initialProgress = {
                    user_id: userId,
                    quiz_id: 1, // Set initial quiz_id to 1
                    global_question_index: 0,
                    current_topic_index: 0,
                    current_question_index: 0,
                    questions_answered_today: 0,
                    points: 0,
                    correct_answers: 0,
                    wrong_answers: 0,
                    total_minutes_spent: 0,
                    completed_for_day: false,
                    last_updated: now.toISOString()
                };

                await supabase
                    .from("user_quiz_progress")
                    .insert(initialProgress)
                    .match({ user_id: userId, quiz_id: 1 });

                setGlobalQuestionIndex(0);
                setActiveTopicIndex(0);
                setActiveQuestionIndex(0);
                setQuestionsAnsweredToday(0);
                setQuizAvailable(true);
                setLoading(false);
                return;
            }

            // Check if it's a new day
            const lastUpdated = new Date(userProgress.last_updated);
            const isSameDay = (date1, date2) => {
                return date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getDate() === date2.getDate();
            };

            if (!isSameDay(now, lastUpdated)) {
                // It's a new day - reset daily progress and advance questions
                const newGlobalIndex = userProgress.global_question_index + 7;

                // Check if we've reached the end of all questions
                const totalQuestions = quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0);
                // const actualNewIndex = newGlobalIndex >= totalQuestions ? 0 : newGlobalIndex;

                // Use modulo to properly wrap around
                const actualNewIndex = newGlobalIndex % totalQuestions;

                // Calculate new topic and question positions
                const { topicIndex, questionIndex } = getQuestionFromGlobalIndex(actualNewIndex);

                // Update database with new day's starting point
                await supabase
                    .from("user_quiz_progress")
                    .update({
                        global_question_index: actualNewIndex,
                        current_topic_index: topicIndex,
                        current_question_index: questionIndex,
                        questions_answered_today: 0,
                        completed_for_day: false,
                        last_updated: now.toISOString()
                    })
                    .match({ user_id: userId, quiz_id: 1 });

                // Update local state
                setGlobalQuestionIndex(actualNewIndex);
                setActiveTopicIndex(topicIndex);
                setActiveQuestionIndex(questionIndex);
                setQuestionsAnsweredToday(0);
                setQuizAvailable(true);
                setShowResult(false);
            } else {
                // Same day - restore current progress
                setGlobalQuestionIndex(userProgress.global_question_index);
                setActiveTopicIndex(userProgress.current_topic_index);
                setActiveQuestionIndex(userProgress.current_question_index);
                setQuestionsAnsweredToday(userProgress.questions_answered_today);
                setResult(prev => ({
                    ...prev,
                    score: userProgress.points || 0,
                    correctAnswers: userProgress.correct_answers || 0,     // Add these
                    wrongAnswers: userProgress.wrong_answers || 0,        // Add these
                    totalMinutesSpent: userProgress.total_minutes_spent || 0  // Add these
                }));

                // If quiz was completed for the day, show results
                if (userProgress.completed_for_day) {
                    setQuizAvailable(false);
                    setShowResult(true);
                    setNextAvailableTime(calculateNextAvailableTime(lastUpdated));
                } else {
                    setQuizAvailable(true);
                    setShowResult(false);
                }
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
            notify("Error loading your progress: " + error.message);
        }

        setLoading(false);
    };


    useEffect(() => {
        restart(new Date().getTime() + initialTime * 1000);
    }, [activeQuestionIndex, activeTopicIndex]);

    const onClickNext = async (incrementCount = true) => {
        const storedSession = localStorage.getItem("supabase_session");
        if (!storedSession || !JSON.parse(storedSession).user?.id) {
            notify("Please log in to continue.");
            return;
        }
        const userId = parseInt(JSON.parse(storedSession).user.id);

        if (selectedAnswerIndex === null && selectedAnswerIndex !== 99) {
            notify("Please select an answer before continuing.");
            return;
        }

        // Consider answer wrong if it's from timer expiry (index 99)
        const isCorrect = selectedAnswerIndex === 99 ? false :
            randomizedQuizzes[activeTopicIndex].questions[activeQuestionIndex].choices[selectedAnswerIndex] ===
            randomizedQuizzes[activeTopicIndex].questions[activeQuestionIndex].correctAnswer;

        const timeSpentInSeconds = initialTime - seconds;

        // Calculate new results atomically
        const newResults = {
            score: result.score + (isCorrect ? quizzes[activeTopicIndex].perQuestionScore : 0),
            correctAnswers: result.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: result.wrongAnswers + (!isCorrect ? 1 : 0),
            totalSecondsSpent: result.totalSecondsSpent + timeSpentInSeconds
        };

        // Update state with new results
        setResult(newResults);

        const newAnsweredCount = questionsAnsweredToday + 1;
        const isFirstQuestion = newAnsweredCount === 1;
        const isLastQuestion = newAnsweredCount >= 7;

        try {
            // Update user progress in the user_quiz_progress table
            await updateUserProgress(userId, 1, newAnsweredCount, isLastQuestion, newResults);

            // Get current user data (points, actions_completed, and email)
            const { data: userData, error: userFetchError } = await supabase
                .from("users")
                .select("points, actions_completed, email")
                .eq("id", userId)
                .single();

            if (userFetchError) throw new Error("Error fetching user data: " + userFetchError.message);

            const updatedPoints = (userData?.points || 0) + (isCorrect ? quizzes[activeTopicIndex].perQuestionScore : 0);
            const updatedActionsCompleted = (userData?.actions_completed || 0) + 1;

            // Increment the user's points and actions_completed in the users table
            const { error: updateUserError } = await supabase
                .from("users")
                .upsert({
                    id: userId,
                    email: userData?.email, // Ensure email is included
                    points: updatedPoints,
                    actions_completed: updatedActionsCompleted
                });

            if (updateUserError) throw new Error("Error updating user data: " + updateUserError.message);

            setQuestionsAnsweredToday(newAnsweredCount);

            // If it's the last question, log the participation in the quiz
            if (isLastQuestion) {
                const lastTopicIndex = quizzes.length - 1;
                const lastQuestionIndex = quizzes[lastTopicIndex].questions.length - 1;
                const isComplete = activeTopicIndex === lastTopicIndex &&
                    activeQuestionIndex === lastQuestionIndex;

                // Upsert a participation record to user_activities and increment points if already exists
                const { error: participationActivityError } = await supabase
                    .from("user_activities")
                    .upsert([{
                        user_id: userId,
                        activity_type: "Participated in the Quiz",
                        points: updatedPoints, // Increment the points instead of overwriting
                        platform_url: window.location.pathname,
                        created_at: new Date().toISOString()
                    }]);

                if (participationActivityError) throw new Error("Error logging quiz participation: " + participationActivityError.message);

                setQuizAvailable(false);
                setShowResult(true);

                if (!isComplete) {
                    setNextAvailableTime(calculateNextAvailableTime(new Date()));
                }

                notify(isComplete
                    ? "🎊 Congratulations! You've completed the entire Credit Bank quiz!"
                    : "You've completed today's questions! Come back tomorrow for more."
                );
                return;
            }

            if (incrementCount) {
                const newGlobalIndex = globalQuestionIndex + 1;
                setGlobalQuestionIndex(newGlobalIndex);

                const { topicIndex, questionIndex } = getQuestionFromGlobalIndex(newGlobalIndex);

                setSelectedAnswerIndex(null);
                setActiveTopicIndex(topicIndex);
                setActiveQuestionIndex(questionIndex);
                restart(new Date().getTime() + initialTime * 1000);
            }

        } catch (error) {
            console.error("Error updating quiz progress:", error);
            notify("Error saving your progress. Please try again.");
        }
    };


    useEffect(() => {
        fetchUserProgress();
    }, [activeTopicIndex]);

    useEffect(() => {
        if (quizAvailable) {
            restart(new Date().getTime() + initialTime * 1000);
        }
    }, [activeQuestionIndex, activeTopicIndex, quizAvailable]);

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

    const calculateProgress = () => {
        return ((questionsAnsweredToday) / 7) * 100;
    };

    useEffect(() => {
        const fetchUserName = async () => {
            const storedSession = localStorage.getItem("supabase_session");
            if (storedSession) {
                const userId = JSON.parse(storedSession).user?.id;
                if (userId) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('name')
                        .eq('id', userId)
                        .single();

                    if (data?.name) {
                        setUserName(data.name);
                    }
                }
            }
        };

        // Calculate total questions across all topics
        const totalQuestions = quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0);

        // Check if we've reached the end of all available questions
        const remainingQuestions = totalQuestions - (globalQuestionIndex + questionsAnsweredToday);
        setIsQuizComplete(remainingQuestions <= 0);

        fetchUserName();
    }, [globalQuestionIndex, questionsAnsweredToday]);

    const openModal = () => {
        setIsModalOpen(true); // Function to open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Function to close the modal
    };




    return (
        <div className="w-full">
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                onLogout={handleSignOut}
                userData={userData}
            />

            <Sidebar
                token={token}
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                mode={mode}
                onLogout={handleSignOut}
                toggleMode={toggleMode}
                userData={userData}
            />



            <main
                className={`flex-1 pt-14 p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-10"} ${mode === "dark" ? "bg-[#0a0c1d] text-white" : "bg-[#f7f1eb] text-black"}`}>
                <div className="mb-12">
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${mode === 'dark' ? 'text-teal-300' : 'text-teal-600'} mb-4 text-center`}>
                        <span className="font-orange">Take Our</span> Fun Quiz{" "}
                        <span className="font-orange">and</span> Earn Points!
                    </h2>
                    <p className={`text-sm sm:text-base md:text-lg text-center ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                        Take our fun and interactive quiz to earn 5 points for each correct answer.
                        <br/>
                        Test your knowledge, challenge yourself, and climb the leaderboard.
                        Every question gets you closer to exciting rewards!
                    </p>
                </div>

                <div
                    className={`p-8 rounded shadow-md max-w-4xl mx-auto ${mode === 'dark' ? 'bg-[#1f2a3d] text-white' : 'bg-white text-black'}`}>
                    {loading ? (
                        <div className="text-center py-8">
                            <p>Loading...</p>
                        </div>
                    ) : !quizAvailable ? (
                        <div className="text-center py-8">
                            <h2 className={`text-2xl mb-6 ${mode === 'dark' ? 'text-teal-300' : 'text-teal-600'}`}>
                                {isQuizComplete ? '🎊 Quiz Journey Complete! 🎊' : 'Quiz Completed! 🎉'}
                            </h2>
                            <div className="mb-8">
                                {isQuizComplete ? (
                                    <div className="space-y-4">
                                        <p className="text-xl mb-3">
                                            🌟 Congratulations {userName}! 🌟
                                        </p>
                                        <p className="text-lg text-teal-600 dark:text-teal-400">
                                            You've successfully completed the entire Credit Bank quiz!
                                        </p>

                                        <p className={`text-base mb-6 ${mode === 'dark' ? 'text-teal-300' : 'text-teal-600'}`}>
                                            Thank you for learning about Credit Bank's history, products, and services.
                                        </p>

                                    </div>
                                ) : (
                                    <>
                                        <p className="text-lg mb-3">Next set of questions will be available in:</p>
                                        <p className={`text-2xl font-bold ${mode === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>
                                            {nextAvailableTime}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className={`p-6 rounded-lg ${mode === 'dark' ? 'bg-[#2a3749]' : 'bg-gray-50'}`}>
                                <h3 className={`text-xl mb-6 ${mode === 'dark' ? 'text-teal-300' : 'text-teal-600'}`}>
                                    {isQuizComplete ? 'Final Results' : 'Today\'s Results'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="p-4 rounded-lg bg-opacity-20 bg-teal-400">
                                        <p className="mb-2">Total Questions: 7</p>
                                        <p className="mb-2">Total Score: {result.score}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-opacity-20 bg-teal-400">
                                        <p className="mb-2">Correct Answers: {result.correctAnswers}</p>
                                        <p className="mb-2">Wrong Answers: {result.wrongAnswers}</p>
                                    </div>
                                </div>
                                <p className="mt-4">Total Time: {formatTime(result.totalSecondsSpent)}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex md:flex-row flex-col justify-between items-center mb-4">
                                <h2 className={`text-xl sm:text-2xl ${mode === 'dark' ? 'text-teal-300' : 'text-teal-600'}`}>
                                    {`Pillar: ${activeTopicIndex + 1} ${quizzes[activeTopicIndex]?.topic}`}
                                </h2>
                                <span
                                    className={`bg-[#cff0ed] p-2 rounded-lg ${mode === 'dark' ? 'text-black' : 'text-black'} flex items-center gap-2`}>
                        Time left: <span className="bg-black p-2 rounded-lg text-white font-bold">{seconds} sec</span>
                    </span>
                            </div>

                            <div className="bg-[#cff0ed] rounded-full h-2.5 dark:bg-gray-700 mb-4 overflow-hidden">
                                <div
                                    className="bg-[#0CB4AB] h-2.5 rounded-full transition-width duration-500 ease-in-out"
                                    style={{width: `${calculateProgress()}%`}}
                                ></div>
                            </div>

                            <div className="mb-6">
                                {randomizedQuizzes[activeTopicIndex]?.questions[activeQuestionIndex] ? (
                                    <h2 className={`text-xl mb-4 ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                        {randomizedQuizzes[activeTopicIndex].questions[activeQuestionIndex].question}
                                    </h2>

                                ) : (
                                    <h4 className={`text-lg mb-4 ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                        No Question Available. Check back tomorrow!
                                    </h4>
                                )}
                            </div>

                            <ul className="space-y-2 mb-6">
                                {randomizedQuizzes[activeTopicIndex]?.questions[activeQuestionIndex]?.choices?.map((answer, index) => {
                                    let className = `cursor-pointer p-3 border rounded-lg transition-all duration-200 
            hover:bg-opacity-90 hover:bg-gray-200 
            ${
                                        mode === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-300'
                                    }`;

                                    if (selectedAnswerIndex !== null) {
                                        if (index === selectedAnswerIndex) {
                                            className += answer === randomizedQuizzes[activeTopicIndex].questions[activeQuestionIndex].correctAnswer
                                                ? ' bg-green-200 text-black'
                                                : ' bg-red-200 text-black';
                                        } else if (answer === randomizedQuizzes[activeTopicIndex].questions[activeQuestionIndex].correctAnswer) {
                                            className += ' bg-green-200 text-black';
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
                                            className={className}
                                        >
                                            {answer}
                                        </li>
                                    );
                                })}
                            </ul>


                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Progress: </span>
                                    <span
                                        className={`px-3 py-1 rounded-full ${mode === 'dark' ? 'bg-teal-900' : 'bg-teal-100'}`}>
                            {questionsAnsweredToday}/7 Questions
                        </span>
                                    <span
                                        className={`px-3 py-1 rounded-full ${mode === 'dark' ? 'bg-orange-900' : 'bg-orange-100'}`}>
                            {result.score} Points
                        </span>
                                </div>

                                <button
                                    onClick={onClickNext}
                                    disabled={selectedAnswerIndex === null}
                                    className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                                        mode === 'dark' ? 'bg-[#ff9409]' : 'bg-[#ff9409]'
                                    } text-white ${selectedAnswerIndex === null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
                                >
                                    {activeQuestionIndex === quizzes[activeTopicIndex]?.questions?.length - 1 ? "Done" : "Next"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

        </div>
    );
};

export default Quiz;
