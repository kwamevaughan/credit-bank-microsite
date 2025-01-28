import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import Image from 'next/image'; // Import Next.js Image component
import NavHeader from '../layouts/nav-header';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar"; // Import Header Component
import {CheckIcon, GiftIcon, ListBulletIcon, PencilSquareIcon} from '@heroicons/react/24/outline';
import {StarIcon} from "@heroicons/react/24/solid";
import Footer from "@/layouts/footer";

export default function Home() {
    const [mode, setMode] = useState('light');


    const notify = (message) => toast(message);

    // Set mode from localStorage or system preference, only after mounting
    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);  // Only run once on mount

    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <NavHeader/>

            <div className="mb-4 flex flex-1 transition-all duration-300">


                <main
                    className={`flex-1 transition-all duration-300 ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#fafafa] text-black'}`}>

                    <div className="bg-[#f7f1eb] px-10 md:px-40 z-40 relative">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                            <div className="flex flex-col justify-center">
                                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-teal-600 mb-4">
                                    Earn Points<br/>Win Big<br/>Join the Challenge!
                                </h2>
                                <p className="text-xl sm:text-2xl">Welcome to the Credit Bank Challenge – where every
                                    action brings you closer to amazing rewards!</p>

                                <div className="inline-flex pt-6 gap-x-4">
                                    <button
                                        className="bg-[#ff930a] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                        Get Started
                                    </button>
                                    <button
                                        className="bg-[#212529] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                        Learn More
                                    </button>
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
                                    <span className="font-orange">What’s the</span> Challenge<br />All About?
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

                            <div className="flex flex-col justify-center">
                                <p className="text-sm sm:text-base md:text-lg">
                                    This challenge is your chance to engage in rewarding actions, from opening accounts to taking quizzes, and earn points that push you closer to exciting prizes. It's simple, fun, and rewarding—just like banking with Credit Bank!
                                </p>

                                <span className="p-4"></span>
                                <ul className="space-y-4 ml-8">
                                    <li className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">Easy-to-join activities for everyone.</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">A competitive leaderboard updated in real-time.</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">Earn points by completing actions.</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-[#0cb4ab] text-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base">Amazing prizes for top performers!</p>
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
                                    <span className="font-orange">How to</span> Earn You Points
                                </h2>

                                <div className="flex flex-col md:flex-row relative space-y-8 md:space-y-0 md:space-x-8">
                                    <ul className="flex flex-col space-y-8 w-full md:w-[35em] z-20">
                                        <li className="flex items-start space-x-4 md:space-x-6">
                                            <div className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <PencilSquareIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Sign Up</p>
                                                <span className="text-sm sm:text-base">Provide your details to join and start tracking your progress.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-4 md:space-x-6">
                                            <div className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <ListBulletIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Take Actions</p>
                                                <span className="text-sm sm:text-base">Complete tasks like signing up, sending money, or taking quizzes.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-4 md:space-x-6">
                                            <div className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <StarIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Earn Points</p>
                                                <span className="text-sm sm:text-base">Instantly gain points for every completed action and climb the leaderboard.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-4 md:space-x-6">
                                            <div className="flex-shrink-0 w-12 h-12 bg-[#ff930a] text-white rounded-full flex items-center justify-center">
                                                <GiftIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold">Win Rewards</p>
                                                <span className="text-sm sm:text-base">Collect points, rank higher, and claim exciting prizes tailored for you!</span>
                                            </div>
                                        </li>
                                    </ul>

                                    {/* Vertical line through the icons */}
                                    <div className="w-[2px] bg-[#ff930a] absolute top-0 bottom-0 left-[1.5em] md:left-[-0.6em] z-10"></div>
                                </div>
                            </div>


                        </div>

                    </div>

                    <div className="bg-white px-6 sm:px-10 md:px-20 pt-14 pb-28" id="actions">
                        <div className="flex flex-col justify-center text-center">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                <span className="font-orange">Actions That</span> Earn You Points
                            </h2>
                            <p className="text-base sm:text-lg">Participate in these activities to earn points and climb the leaderboard!</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 pt-10 gap-2">
                            <div className="flex justify-center">
                                <Image src="/assets/images/open-account.png" width={280} height={50} alt="open account image" />
                            </div>
                            <div className="flex justify-center relative top-0 md:top-16">
                                <Image src="/assets/images/send-money.png" width={280} height={50} alt="send money image" />
                            </div>
                            <div className="flex justify-center">
                                <Image src="/assets/images/download-app.png" width={280} height={50} alt="download app image" />
                            </div>
                            <div className="flex justify-center relative top:0 md:top-16">
                                <Image src="/assets/images/send-money.png" width={280} height={50} alt="send money image" />
                            </div>
                        </div>
                    </div>


                    <div className="bg-[#f7f1eb] px-6 sm:px-10 md:px-20 pt-14 pb-10" id="leaderboard">
                        <div className="flex flex-col justify-center text-center">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                Leaderboard
                            </h2>
                            <span className="text-2xl sm:text-2xl md:text-3xl font-extrabold font-orange mb-4">
      See Who's Leading the Pack!
    </span>
                            <p className="text-base sm:text-lg">Stay competitive! Check the live leaderboard to see who's winning.</p>
                        </div>

                        <div className="w-full pt-0 md:pt-12">
                            <Image
                                src="/assets/images/leaderboard.png"
                                alt="leaderboard image"
                                width={0} // Set width and height to 0 when using w-full
                                height={0}
                                layout="responsive" // This will help preserve the image's aspect ratio
                            />
                        </div>
                    </div>

                    <div className="bg-[#212529] px-6 sm:px-10 md:px-40 pt-10">


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">

                            <div className="flex flex-col justify-center">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                                    Exciting Rewards Await!
                                </h2>

                                <span className="p-4"></span>
                                <ul className="space-y-4 ">
                                    <li className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-[#ff930a] rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base text-white">Earn points, stay ahead on the leaderboard, and claim amazing prizes!</p>
                                    </li>
                                    <li className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-[#ff930a] rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <p className="md:text-lg text-sm sm:text-base text-white">Rewards include shopping vouchers, travel discounts, and exclusive Credit Bank perks.</p>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                <button
                                    className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                    Start Earning Points Today!
                                </button>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center">
                                <Image
                                    src="/assets/images/rewards.png"
                                    width={500}
                                    height={300}
                                    alt="hand-with-phone-img"
                                    className="relative mt-[-10em] top-[40%] md:top-0 z-10"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="bg-white px-6 sm:px-10 md:px-40 pt-10">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
                            <div className="flex flex-col justify-center">

                            </div>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10" id="quiz">


                            <div className="flex flex-col mt-10">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                                    <span className="font-orange">Take Our</span> Fun Quiz<br /><span className="font-orange">and</span> Earn Points!
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg">
                                    Take our fun and interactive quiz to earn 20 points instantly.
                                    Test your knowledge, challenge yourself, and climb the leaderboard.
                                    Every question gets you closer to exciting rewards!
                                </p>

                                <span className="p-4"></span>

                                <div className="">
                                    <button
                                        className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-10 rounded-lg">
                                        Take the Quiz Now
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center">
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



                    <div className="bg-white p-10">


                    </div>

                </main>


            </div>
            <Footer />
        </div>
    );
};
