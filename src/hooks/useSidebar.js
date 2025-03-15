import { useState, useEffect } from "react";

const useSidebar = () => {
    // Initialize state from localStorage, defaulting to true for >768px screens
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return false; // Server-side default
        const savedState = localStorage.getItem("sidebarOpen");
        return savedState !== null ? JSON.parse(savedState) : window.innerWidth > 768;
    });

    // Save to localStorage whenever isSidebarOpen changes
    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return { isSidebarOpen, toggleSidebar };
};

export default useSidebar;
