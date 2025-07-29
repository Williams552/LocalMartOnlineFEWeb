// Example usage of ReportButton component in different scenarios

import React from 'react';
import { ReportButton } from '../components/Report';

// Example 1: In ProductCard
const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            {/* Product info */}
            <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="price">{product.price}</p>
            </div>
            
            {/* Actions */}
            <div className="product-actions flex justify-between items-center">
                <button className="btn-primary">Thêm vào giỏ</button>
                
                {/* Report button - icon variant */}
                <ReportButton
                    targetType="Product"
                    targetId={product.id}
                    targetName={product.name}
                    variant="icon"
                    size="sm"
                    onReportSuccess={(data) => {
                        console.log('Product reported:', data);
                    }}
                />
            </div>
        </div>
    );
};

// Example 2: In Store Page
const StorePage = ({ store }) => {
    return (
        <div className="store-page">
            <div className="store-header">
                <h1>{store.name}</h1>
                <div className="store-actions">
                    <button className="btn-follow">Theo dõi</button>
                    
                    {/* Report button - default variant */}
                    <ReportButton
                        targetType="Store"
                        targetId={store.id}
                        targetName={store.name}
                        targetInfo={{
                            id: store.id,
                            marketId: store.marketId,
                            address: store.address
                        }}
                        variant="default"
                        size="md"
                        className="ml-2"
                        onReportSuccess={(data) => {
                            console.log('Store reported:', data);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

// Example 3: In User Profile
const UserProfile = ({ user }) => {
    return (
        <div className="user-profile">
            <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <h2>{user.name}</h2>
                <p>{user.email}</p>
            </div>
            
            {/* Report user - text variant */}
            <div className="user-actions">
                <ReportButton
                    targetType="Seller"
                    targetId={user.id}
                    targetName={user.name}
                    variant="text"
                    size="sm"
                    buttonText="Báo cáo người dùng"
                    onReportSuccess={(data) => {
                        console.log('User reported:', data);
                    }}
                />
            </div>
        </div>
    );
};

// Example 4: Quick Actions Menu
const QuickActionsMenu = ({ item, itemType }) => {
    return (
        <div className="quick-actions-menu">
            <div className="menu-item">
                <ReportButton
                    targetType={itemType}
                    targetId={item.id}
                    targetName={item.name}
                    variant="text"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                />
            </div>
        </div>
    );
};

export { ProductCard, StorePage, UserProfile, QuickActionsMenu };
