import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        // Use smooth scrolling if supported, otherwise use instant
        const scrollToTop = () => {
            try {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            } catch (e) {
                // Fallback for older browsers
                window.scrollTo(0, 0);
            }
        };

        // Add a small delay to ensure the page content is rendered
        const timeoutId = setTimeout(scrollToTop, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
