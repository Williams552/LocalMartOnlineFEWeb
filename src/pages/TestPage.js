import React from 'react';
import CartAPITest from '../components/Test/CartAPITest';
import StoreAPITest from '../components/Test/StoreAPITest';
import PaymentAPITest from '../components/Test/PaymentAPITest';
import CategoryInfoAPITest from '../components/Test/CategoryInfoAPITest';

const TestPage = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>API Test Page</h1>
            <CartAPITest />
            <StoreAPITest />
            <PaymentAPITest />
            <CategoryInfoAPITest />
        </div>
    );
};

export default TestPage;
