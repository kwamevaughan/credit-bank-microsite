import {useEffect, useState, useCallback} from 'react';
import {supabase} from '/lib/supabase'; // Make sure this is correctly initialized
import Image from 'next/image';



const QuizModel = ({token, notify}) => {
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);




    return (
        <div>

            <div className="px-8 pt-6 pb-8 mb-4"
            >
                <h2 className="text-4xl font-bold text-teal-600 mb-4 text-center">Quiz</h2>
                <h3 className="text-2xl font-bold text-[#ff9409] mb-4 text-center">Page under construction!</h3>
                <p className="mb-4 text-center">Please check back later for updates.</p>

            </div>
        </div>
    );
};

export default QuizModel;
