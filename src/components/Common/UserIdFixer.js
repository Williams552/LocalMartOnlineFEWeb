import React, { useEffect } from 'react';

const UserIdFixer = () => {
    useEffect(() => {
        const fixUserId = () => {
            console.log('🔧 UserIdFixer: Checking and fixing userId...');

            const userId = localStorage.getItem('userId');
            const user = localStorage.getItem('user');

            if (!userId && user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('🔧 UserIdFixer: User data:', userData);

                    const extractedUserId = userData.id || userData.userId || userData.ID || userData.UserId || userData.user_id;

                    if (extractedUserId) {
                        localStorage.setItem('userId', extractedUserId.toString());
                        console.log('✅ UserIdFixer: Fixed userId:', extractedUserId);
                    } else {
                        console.error('❌ UserIdFixer: No userId field found in user data. Fields:', Object.keys(userData));
                    }
                } catch (error) {
                    console.error('❌ UserIdFixer: Error parsing user data:', error);
                }
            } else if (userId) {
                console.log('✅ UserIdFixer: userId already exists:', userId);
            } else {
                console.log('ℹ️ UserIdFixer: No user data found');
            }
        };

        // Fix on mount
        fixUserId();

        // Fix when localStorage changes (e.g., after login)
        const handleStorageChange = () => {
            fixUserId();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default UserIdFixer;
