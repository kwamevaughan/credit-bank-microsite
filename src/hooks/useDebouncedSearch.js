import { useState, useEffect } from 'react';

const useDebouncedSearch = (search, delay = 500) => {
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [search, delay]);

    return debouncedSearch;
};

export default useDebouncedSearch;
