import React from 'react';

const HelpDesk = ({ mode }) => {
    return (
        <div className="">
            <h3 className={`font-semibold text-xl ${mode === 'dark' ? 'text-white' : 'text-black'} mb-4`}>Need Support?</h3>
            <p className={`${mode === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                Temporarily unavailable. Please check back later.
            </p>
        </div>
    );
};

export default HelpDesk;
