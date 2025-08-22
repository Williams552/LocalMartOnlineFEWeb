import apiService from './apiService';

/**
 * Gửi thông tin thao tác của user lên server
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.productId
 * @param {string} params.type - vclick/add_cart/purchase/
 */
export function trackInteraction({ userId, productId, type }) {
    console.log('🎯 Tracking interaction:', { userId, productId, type});
    
    apiService.post('/api/user-interactions', {
        InteractionId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
        UserId: userId,
        ProductId: productId,
        Type: type,
    }).then(response => {
        console.log('✅ Track success:', response);
    }).catch(err => {
        console.warn('❌ Track interaction error:', err);
    });
}

/**
 * Gắn event listener tự động cho toàn bộ app
 * Chỉ cần gọi hàm này 1 lần ở App.js hoặc index.js
 * Các nút cần tracking chỉ cần thêm data-track-type, data-product-id
 */
export function setupAutoTracking() {
    console.log('🎯 Setting up auto tracking...');
    
    document.addEventListener('click', (e) => {
        let el = e.target;
        console.log('🔍 Click detected on:', el);
        
        // Tìm lên cha nếu là icon hoặc span bên trong button
        while (el && !el.getAttribute('data-track-type') && el !== document.body) {
            el = el.parentElement;
        }
        
        const trackType = el?.getAttribute('data-track-type');
        const productId = el?.getAttribute('data-product-id');
        
        console.log('📊 Track data found:', { trackType, productId, element: el });
        
        if (trackType && productId) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id || user._id || '';
            
            console.log('👤 User from localStorage:', user);
        
            trackInteraction({ userId, productId, type: trackType });
        }
    });
}
