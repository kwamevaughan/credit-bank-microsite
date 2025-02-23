import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const InfiniteSlider = () => {
    const slidesData = [
        { id: 1, points: 5, description: "For each correct answer in our quiz" },
        { id: 2, points: 15, description: "Refer a friend to join the challenge" },
        { id: 3, points: 20, description: "Join the challenge" },
        { id: 4, points: 50, description: "Refer a friend to open a Nyumbani Diaspora, Fixed Deposit, or CDSC account" },
        { id: 5, points: 200, description: "Open a Nyumbani Diaspora" },
        { id: 6, points: 200, description: "Fund your Nyumbani Diaspora account with minimum Ksh 10,000" },
        { id: 7, points: 200, description: "Successfully refer a friend to open a Nyumbani Diaspora, Fixed Deposit, or CDSC account" },
        { id: 8, points: 200, description: "Send or receive remittances via Ria Money Transfer" },
        { id: 9, points: 500, description: "Open a Fixed Deposit or CDSC account with a minimum investment of Ksh50,000" },
    ];

    const getActionText = (id) => {
        switch (id) {
            case 1: return 'Take Quiz';
            case 2: return 'Refer A Friend';
            case 3: return 'Join Challenge';
            case 4: return 'Refer A Friend';
            case 5:
            case 6:
            case 9: return 'Open Account';
            case 7: return 'Refer a Friend';
            case 8: return 'Send Money';
            default: return 'Take Action';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto relative py-20">
            <Swiper
                modules={[Navigation, Autoplay]}
                navigation
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                breakpoints={{
                    // Mobile
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 20
                    },
                    // Tablet
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30
                    },
                    // Desktop
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 24
                    }
                }}
                loop={true}
                className="points-slider"
            >
                {slidesData.map((slide, index) => (
                    <SwiperSlide key={slide.id}>
                        <div
                            className={`flex flex-col justify-between bg-[#f7f1eb] border border-[#ff9409] rounded-xl shadow-sm 
                                ${index % 2 === 0 ? '' : 'md:translate-y-[-40px] md:hover:translate-y-[-50px]'} 
                                hover:translate-y-[-10px] transition-transform duration-300 pb-8 h-[25em]`}
                        >
                            <span className="bg-[#0eb4ab] mb-2 w-3/4 h-[10em] rounded-bl-[145px] rounded-br-[200px] py-4 text-center text-white font-bold">
                                <span className="flex px-8 items-start gap-4">
                                    <p className="text-6xl font-bold">{slide.points}</p>
                                    <p className="text-lg">Points</p>
                                </span>
                            </span>
                            <div className="flex flex-col justify-between pt-10 px-8 text-center h-[15em]">
                                <p className="text-xl text-gray-600">{slide.description}</p>
                                <div className="mt-4">
                                    <Link href="/participate">
                                        <button className="font-extrabold text-xl text-[#FF930A] cursor-pointer">
                                            {getActionText(slide.id)}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default InfiniteSlider;