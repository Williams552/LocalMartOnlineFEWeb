// Direct API test script
console.log('🧪 Starting direct API test...');

const testDirectAPI = async () => {
    const API_URL = 'https://localmartonline-1.onrender.com';

    try {
        // Test 1: No auth - should get 401
        console.log('🔍 Test 1: Testing without auth...');
        const response1 = await fetch(`${API_URL}/api/User?pageNumber=1&pageSize=5`);
        console.log('Status:', response1.status);
        console.log('Response 1:', await response1.text());

        // Test 2: Try login first
        console.log('🔍 Test 2: Attempting login...');
        const loginResponse = await fetch(`${API_URL}/api/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123',
                userToken: 'test_token'
            })
        });

        console.log('Login status:', loginResponse.status);
        const loginResult = await loginResponse.json();
        console.log('Login result:', loginResult);

        if (loginResult.success && loginResult.data?.token) {
            console.log('🔍 Test 3: Testing with auth token...');
            const response2 = await fetch(`${API_URL}/api/User?pageNumber=1&pageSize=5`, {
                headers: {
                    'Authorization': `Bearer ${loginResult.data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Authenticated status:', response2.status);
            const result2 = await response2.json();
            console.log('Authenticated response:', result2);
        }

    } catch (error) {
        console.error('❌ Direct API test failed:', error);
    }
};

// Run the test
testDirectAPI();
