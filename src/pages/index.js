import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import Image from 'next/image'; // Import Next.js Image component
import NavHeader from '../layouts/nav-header';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar"; // Import Header Component
import {CheckIcon, GiftIcon, ListBulletIcon, PencilSquareIcon} from '@heroicons/react/24/outline';
import {StarIcon} from "@heroicons/react/24/solid";
import Footer from "@/layouts/footer";
import Link from "next/link";
import LeaderboardTable from "@/components/leaderboardTable"
import InfiniteSlider from "@/components/InfiniteSlider";


export default function Home() {

    return (
        <div className={`flex flex-col h-screen `}>
            <NavHeader/>

            <div className="flex flex-1 transition-all duration-300">


                <main
                    className={`flex-1 transition-all duration-300 w-full `}>

                    <div className="bg-[#f7f1eb] px-10 md:px-40 z-40 relative">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                            <div className="flex flex-col justify-center">
                                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-teal-600 mb-4">
                                    Earn Points<br/>Win Big<br/>Join the Challenge!
                                </h2>
                                <p className="text-xl sm:text-2xl">Welcome to the Credit Bank Challenge – where every
                                    action brings you closer to amazing rewards!</p>

                                <div className="inline-flex pt-6 gap-x-4">
                                    <Link href="/participate">
                                        <button
                                            className="bg-[#ff930a] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                            Get Started
                                        </button>
                                    </Link>

                                    <Link href="#about-the-campaign">
                                        <button
                                            className="bg-[#212529] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                            Learn More
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Image src="/assets/images/hero.png" width={400} height={100} alt="hero-img"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white px-6 sm:px-10 md:px-40 pt-10" id="about-the-campaign">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
                            <div className="flex flex-col justify-center">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                    <span className="font-orange">What’s the</span> Challenge<br/>All About?
                                </h2>
                            </div>

                            <div className="relative flex justify-center">
                                <Image
                                    src="/assets/images/pattern.png"
                                    width={150}
                                    height={100}
                                    alt="patterns"
                                    className="absolute top-[40%] right-[5%] md:top-[-50%] md:right-[1%] z-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mt-10">
                            <div className="flex flex-col justify-center">
                                <Image
                                    src="/assets/images/challenge-img.png"
                                    width={400}
                                    height={300}
                                    alt="challenge-img"
                                    className="w-full md:w-auto"
                                />
                            </div>

                            <div className="flex flex-col justify-center pb-8">
                                <p className="text-sm sm:text-base md:text-lg">
                                    This challenge is your chance to engage in rewarding actions, from opening accounts
                                    to taking quizzes, and earn points that push you closer to exciting prizes. It's
                                    simple, fun, and rewarding—just like banking with Credit Bank!
                                </p>

                                <span className="p-4"></span>
                                <ul className="space-y-4 ml-8">
                                    <li className="flex items-start space-x-4">
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4"/>
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">Easy-to-join activities for
                                            everyone.</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4"/>
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">A competitive leaderboard updated
                                            in real-time.</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4"/>
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">Earn points by completing
                                            actions.</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4"/>
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">Amazing prizes for top
                                            performers!</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>


                    <div className="bg-[#e7f7f7] px-10 md:px-40 pt-12 pb-10">


                        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                            <div className="flex flex-col justify-center">
                                <Image src="/assets/images/earn-points.png"
                                       width={400}
                                       height={100}
                                       alt="hand-with-phone-img"
                                       className="rounded-sm p-6 w-full md:w-auto "/>

                            </div>

                            <div className="flex flex-col justify-center px-6 sm:px-10 md:px-20" id="how-it-works">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                    <span className="font-orange">How to</span> Earn Points
                                </h2>

                                <div className="flex flex-col md:flex-row relative space-y-8 md:space-y-0 md:space-x-8">
                                    <ul className="flex flex-col space-y-8 w-full md:w-[35em] z-20">
                                        <li className="flex items-start space-x-4 md:space-x-6 hover:translate-y-[-10px] transition-transform duration-300 ">
                                            <div
                                                className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <PencilSquareIcon className="w-6 h-6"/>
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Sign Up</p>
                                                <span className="text-sm sm:text-base">Provide your details to join and start tracking your progress.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-4 md:space-x-6 hover:translate-y-[-10px] transition-transform duration-300 ">
                                            <div
                                                className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <ListBulletIcon className="w-6 h-6"/>
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Take Actions</p>
                                                <span className="text-sm sm:text-base">Complete tasks like signing up, sending money, or taking quizzes.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-4 md:space-x-6 hover:translate-y-[-10px] transition-transform duration-300 hover:cursor-pointer group">
                                            <div
                                                className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <StarIcon
                                                    className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]"/>
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Earn Points</p>
                                                <span className="text-sm sm:text-base">Instantly gain points for every completed action and climb the leaderboard.</span>
                                            </div>
                                        </li>


                                        <li className="flex items-start space-x-4 md:space-x-6 hover:translate-y-[-10px] transition-transform duration-300 ">
                                            <div
                                                className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <GiftIcon className="w-6 h-6"/>
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Win Rewards</p>
                                                <span className="text-sm sm:text-base">Collect points, rank higher, and claim exciting prizes tailored for you!</span>
                                            </div>
                                        </li>
                                    </ul>

                                    {/* Vertical line through the icons */}
                                    <div
                                        className="w-[2px] bg-[#ff930a] absolute top-0 bottom-0 left-[1.5em] md:left-[-0.6em] z-10"></div>
                                </div>
                            </div>


                        </div>

                    </div>

                    <div className="bg-white px-6 sm:px-10 md:px-20 pt-14 pb-12" id="actions">
                        <div className="flex flex-col justify-center text-center">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                <span className="font-orange">Actions That</span> Earn You Points
                            </h2>
                            <p className="text-base sm:text-lg">Participate in these activities to earn points and climb
                                the leaderboard!</p>
                        </div>

                        <InfiniteSlider/>

                    </div>


                    <div className="bg-[#f7f1eb] px-6 sm:px-10 md:px-20 pt-14 pb-10" id="leaderboard">
                        <div className="flex flex-col justify-center text-center">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                Leaderboard
                            </h2>
                            <span className="text-2xl sm:text-2xl md:text-3xl font-extrabold font-orange mb-4">
      See Who's Leading the Pack!
    </span>
                            <p className="text-base sm:text-lg">Stay competitive! Check the live leaderboard to see
                                who's winning.</p>
                        </div>

                        <div className="w-full pt-0 md:pt-8 ">
                            <LeaderboardTable/>
                        </div>
                    </div>

                    <div className="bg-[#212529] px-6 sm:px-10 md:px-40 pt-10">


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">

                            <div className="flex flex-col justify-center z-10">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                                    Exciting Rewards Await!
                                </h2>

                                <span className="p-4"></span>
                                <ul className="space-y-4 ">
                                    <li className="flex items-start space-x-4">
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-[#ff930a] rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4"/>
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base text-white">Earn points, stay
                                            ahead on the leaderboard, and claim amazing prizes!</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-[#ff930a] rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4"/>
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base text-white">Rewards include
                                            Cashbacks and Credit Bank Merchandise.</p>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link href="/participate">
                                        <button
                                            className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                            Start Earning Points Today!
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center">
                                <Image
                                    src="/assets/images/rewards.png"
                                    width={500}
                                    height={300}
                                    alt="hand-with-phone-img"
                                    className="relative mt-[-10em] md:top-0 z-5 opacity-50 md:opacity-100"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="bg-white px-6 sm:px-10 md:px-40 pt-10 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
                            <div className="flex flex-col justify-center">

                            </div>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10" id="quiz">


                            <div className="flex flex-col mt-10">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                    <span className="font-orange">Take Our</span> Fun Quiz<br/><span
                                    className="font-orange">and</span> Earn Points!
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg">
                                    Take our fun and interactive quiz to earn 20 points instantly.
                                    Test your knowledge, challenge yourself, and climb the leaderboard.
                                    Every question gets you closer to exciting rewards!
                                </p>

                                <span className="p-4"></span>

                                <div className="">
                                    <Link href="/participate">
                                        <button
                                            className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-10 rounded-lg">
                                            Take the Quiz Now
                                        </button>
                                    </Link>

                                </div>
                            </div>

                            <div className="flex flex-col justify-center w-3/4">
                                <Image
                                    src="/assets/images/quiz-teaser.png"
                                    width={400}
                                    height={300}
                                    alt="challenge-img"
                                    className="w-full md:w-auto rounded-lg"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="bg-[#f7f1eb] px-6 sm:px-10 md:px-40 pt-10 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
                            <div className="flex flex-col justify-center">

                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10" id="quality-policy">


                            <div className="flex flex-col">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-6">
                                    <span className="font-orange">Quality Policy </span> Statement
                                </h2>
                                <div className="text-sm sm:text-base md:text-lg">
                                    <p className="pb-4">As an innovative Commercial Bank regulated by the Central Bank of Kenya and that is responsive to its
                                    customers’ expectations, we commit to: </p>
                                    <div className="flex flex-col justify-center space-y-4">
                                    <span className="text-gray-600">1. Provide innovative financial solutions to all our customers in a responsible and friendly manner. </span>
                                    <span className="text-gray-600">2. Provide innovative financial solutions to all our customers in a responsible and friendly manner. </span>
                                    <span className="text-gray-600">3. Provide innovative financial solutions to all our customers in a responsible and friendly manner. </span>
                                        </div>

                                </div>

                                <span className="p-4"></span>

                                <div className="transition-transform duration-300 hover:-translate-y-1">
                                    <a target="blank" href="https://creditbank.co.ke/wp-content/uploads/2023/11/Quality-Policy-1.pdf">
                                        <button
                                            className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-10 rounded-lg">
                                            View Policy
                                        </button>
                                    </a>

                                </div>
                            </div>

                            <div className="flex flex-col justify-center w-3/4 transition-transform duration-300 hover:-translate-y-1">
                                <a target="blank" href="https://creditbank.co.ke/wp-content/uploads/2023/11/Quality-Policy-1.pdf">
                                <Image
                                    src="/assets/images/quality-policy.webp"
                                    width={400}
                                    height={300}
                                    alt="challenge-img"
                                    className="w-full md:w-auto rounded-lg"
                                />
                                </a>
                            </div>

                        </div>
                    </div>
                </main>


            </div>
            <Footer/>
        </div>
    );
};
