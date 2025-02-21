import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const InfiniteSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const slideRef = useRef(null);
    const intervalRef = useRef(null);

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

    // Create slide groups based on device type and add duplicates for desktop loop
    const createSlideGroups = () => {
        if (isMobile) {
            return slidesData;
        } else {
            const groups = [];
            for (let i = 0; i < slidesData.length; i += 4) {
                groups.push(slidesData.slice(i, i + 4));
            }
            // Add the first group at the end for smooth loop
            if (groups.length > 0) {
                groups.push(groups[0]);
            }
            return groups;
        }
    };

    const slideGroups = createSlideGroups();

    const autoSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            const maxLength = isMobile ? slidesData.length : slideGroups.length - 1;

            if (nextIndex >= maxLength) {
                if (!isMobile) {
                    // For desktop, smoothly reset to first slide
                    setTimeout(() => {
                        slideRef.current.style.transition = 'none';
                        setCurrentIndex(0);
                        // Force a reflow
                        slideRef.current.offsetHeight;
                        slideRef.current.style.transition = 'transform 500ms ease-in-out';
                    }, 500);
                }
                return isMobile ? 0 : maxLength;
            }
            return nextIndex;
        });
    };

    useEffect(() => {
        if (!isHovered) {
            intervalRef.current = setInterval(autoSlide, 3000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isHovered, isMobile]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            const maxLength = isMobile ? slidesData.length : slideGroups.length - 1;

            if (nextIndex >= maxLength) {
                if (!isMobile) {
                    setTimeout(() => {
                        slideRef.current.style.transition = 'none';
                        setCurrentIndex(0);
                        slideRef.current.offsetHeight;
                        slideRef.current.style.transition = 'transform 500ms ease-in-out';
                    }, 500);
                }
                return isMobile ? 0 : maxLength;
            }
            return nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex <= 0) {
                if (!isMobile) {
                    // For desktop, smoothly transition to last real slide
                    setTimeout(() => {
                        slideRef.current.style.transition = 'none';
                        setCurrentIndex(slideGroups.length - 2);
                        slideRef.current.offsetHeight;
                        slideRef.current.style.transition = 'transform 500ms ease-in-out';
                    }, 500);
                }
                return isMobile ? slidesData.length - 1 : 0;
            }
            return prevIndex - 1;
        });
    };

    // Dragging functionality
    const startDrag = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - slideRef.current.offsetLeft);
        setScrollLeft(slideRef.current.scrollLeft);
    };

    const endDrag = () => {
        setIsDragging(false);
    };

    const handleDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - slideRef.current.offsetLeft;
        const walk = (x - startX) * 3;
        const maxLength = isMobile ? slidesData.length : slideGroups.length - 1;
        const newIndex = Math.min(Math.max(Math.floor(walk / slideRef.current.offsetWidth), 0), maxLength);

        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    };

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    return (
        <div
            className="w-full max-w-7xl mx-auto relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={startDrag}
            onMouseUp={endDrag}
            onMouseMove={handleDrag}
            onMouseLeave={endDrag}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {isMobile ? (
                // Mobile Slider (Single card at a time)
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out py-20"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                        ref={slideRef}
                    >
                        {slidesData.map((slide) => (
                            <div
                                key={slide.id}
                                className="w-full flex-shrink-0 px-4"
                            >
                                <div
                                    className="flex flex-col justify-between bg-[#f7f1eb] border border-[#ff9409] rounded-xl shadow-sm h-[25em] pb-8"
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
                                                <button className="font-extrabold text-xl text-orange-600 cursor-pointer">
                                                    {(() => {
                                                        switch (slide.id) {
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
                                                    })()}
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Desktop Slider (Multiple cards visible)
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out py-20"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                        ref={slideRef}
                    >
                        {slideGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="w-full flex-shrink-0 px-4">
                                <div className="flex sm:flex-row md:flex-row lg:flex-row flex-col gap-6">
                                    {group.map((slide, slideIndex) => (
                                        <div
                                            key={slide.id}
                                            className={`flex flex-col justify-between bg-[#f7f1eb] border border-[#ff9409] rounded-xl shadow-sm 
                                                ${slideIndex % 2 === 0 ? '' : 'translate-y-[-40px] hover:translate-y-[-50px]'} 
                                                hover:translate-y-[-10px] transition-transform duration-300 pb-8 
                                                sm:w-full md:w-1/3 lg:w-1/4 h-[25em]`}
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
                                                        <button className="font-extrabold text-xl text-orange-600 cursor-pointer">
                                                            {(() => {
                                                                switch (slide.id) {
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
                                                            })()}
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
                <ChevronLeftIcon className="h-6 w-6"/>
            </button>

            <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
                <ChevronRightIcon className="h-6 w-6"/>
            </button>
        </div>
    );
};

export default InfiniteSlider;