import { useCallback } from 'react';

const useFullScreen = () => {
    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    return toggleFullScreen;
};

export default useFullScreen;
