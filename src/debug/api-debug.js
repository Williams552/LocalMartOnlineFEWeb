// Debug script để test API responses
// Chạy trong browser console để kiểm tra

const debugOrderAPI = async () => {
    console.log('🔍 Testing Order API responses...');

    // Test User API
    try {
        console.log('👤 Testing User API...');
        const userResponse = await fetch('http://localhost:5183/api/User/67612b0e9b65b6b6b8b30d61', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        const userData = await userResponse.json();
        console.log('👤 User API Response:', userData);

        if (userData.success && userData.data) {
            console.log('✅ User data structure:', {
                fullName: userData.data.fullName,
                username: userData.data.username,
                email: userData.data.email
            });
        }
    } catch (error) {
        console.error('❌ User API Error:', error);
    }

    // Test Product API
    try {
        console.log('📦 Testing Product API...');
        const productResponse = await fetch('http://localhost:5183/api/Product/67612b0e9b65b6b6b8b30d62', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        const productData = await productResponse.json();
        console.log('📦 Product API Response:', productData);

        if (productData.success && productData.data) {
            console.log('✅ Product data structure:', {
                name: productData.data.name,
                unit: productData.data.unit,
                price: productData.data.price
            });
        }
    } catch (error) {
        console.error('❌ Product API Error:', error);
    }

    // Test Order API
    try {
        console.log('📋 Testing Order API...');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const buyerId = user.id || user._id;

        if (buyerId) {
            const orderResponse = await fetch(`http://localhost:5183/api/Order/buyer/${buyerId}?page=1&pageSize=20`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const orderData = await orderResponse.json();
            console.log('📋 Order API Response:', orderData);

            if (orderData.success && orderData.data) {
                console.log('✅ Order data structure:', {
                    items: orderData.data.items || orderData.data,
                    totalCount: orderData.data.totalCount
                });

                const orders = orderData.data.items || orderData.data;
                if (orders.length > 0) {
                    console.log('📋 First order structure:', orders[0]);
                }
            }
        } else {
            console.warn('⚠️ No buyer ID found in localStorage');
        }
    } catch (error) {
        console.error('❌ Order API Error:', error);
    }
};

// Copy và paste function này vào browser console để test
console.log('📋 Debug function ready. Run: debugOrderAPI()');
