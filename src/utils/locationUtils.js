/**
 * Location utilities for finding nearby markets and products
 * Uses browser Geolocation API and Haversine formula for distance calculations
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters
    
    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.error('❌ Geolocation not supported');
            reject(new Error('Trình duyệt không hỗ trợ định vị. Vui lòng sử dụng trình duyệt hiện đại hơn.'));
            return;
        }

        // Check if running on HTTPS (required for geolocation in modern browsers)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn('⚠️ Geolocation requires HTTPS');
            reject(new Error('Tính năng định vị yêu cầu kết nối bảo mật (HTTPS). Vui lòng truy cập qua HTTPS.'));
            return;
        }

        console.log('📍 Requesting location...');

        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout to 15 seconds
            maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                console.log('✅ Location obtained:', location);
                
                // Validate coordinates
                if (isNaN(location.latitude) || isNaN(location.longitude)) {
                    reject(new Error('Tọa độ vị trí không hợp lệ. Vui lòng thử lại.'));
                    return;
                }

                // Check if coordinates are reasonable (within world bounds)
                if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
                    reject(new Error('Tọa độ vị trí nằm ngoài phạm vi hợp lệ. Vui lòng thử lại.'));
                    return;
                }

                resolve(location);
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                
                let errorMessage;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Bạn đã từ chối chia sẻ vị trí. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Không thể xác định vị trí của bạn. Vui lòng kiểm tra kết nối internet và GPS.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Hết thời gian chờ xác định vị trí. Vui lòng thử lại hoặc kiểm tra tín hiệu GPS.';
                        break;
                    default:
                        errorMessage = `Lỗi định vị (${error.code}): ${error.message || 'Không xác định'}. Vui lòng thử lại hoặc chọn thành phố thủ công.`;
                        break;
                }
                
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

/**
 * Check geolocation permission status
 * @returns {Promise<string>} Permission status: 'granted', 'denied', 'prompt', or 'unsupported'
 */
export async function checkLocationPermission() {
    try {
        if (!navigator.permissions) {
            return 'unsupported';
        }

        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('📍 Location permission status:', permission.state);
        return permission.state;
    } catch (error) {
        console.warn('⚠️ Could not check location permission:', error);
        return 'unknown';
    }
}

/**
 * Get user's current location with enhanced error handling and fallback
 * @param {Object} options - Configuration options
 * @returns {Promise<{latitude: number, longitude: number, accuracy?: number, method: string}>}
 */
export async function getCurrentLocationEnhanced(options = {}) {
    const defaultOptions = {
        enableFallback: true,
        timeout: 15000,
        ...options
    };

    try {
        // First check permission status
        const permissionStatus = await checkLocationPermission();
        
        if (permissionStatus === 'denied') {
            throw new Error('Quyền truy cập vị trí đã bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.');
        }

        // Try to get current location
        const location = await getCurrentLocation();
        return { ...location, method: 'gps' };

    } catch (error) {
        console.error('❌ Enhanced location error:', error);
        
        if (defaultOptions.enableFallback) {
            // Fallback to IP-based location (if available)
            try {
                const ipLocation = await getLocationFromIP();
                if (ipLocation) {
                    console.log('📍 Using IP-based location as fallback');
                    return { ...ipLocation, method: 'ip' };
                }
            } catch (ipError) {
                console.warn('⚠️ IP location fallback failed:', ipError);
            }
        }

        // Re-throw the original error
        throw error;
    }
}

/**
 * Get approximate location from IP address (fallback method)
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
async function getLocationFromIP() {
    try {
        // Using a free IP geolocation service
        const response = await fetch('https://ipapi.co/json/', {
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error('IP location service unavailable');
        }
        
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
            return {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                accuracy: 10000, // IP location is very approximate (10km accuracy)
                city: data.city,
                country: data.country_name
            };
        }
        
        throw new Error('No location data from IP service');
    } catch (error) {
        console.warn('⚠️ IP geolocation failed:', error);
        return null;
    }
}

/**
 * Filter and sort markets by distance from user location 
 * @param {Array} markets - Array of market objects with latitude and longitude
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} maxDistance - Maximum distance in kilometers (default: 20km)
 * @returns {Array} Sorted array of nearby markets with distance property
 */
export function getNearbyMarkets(markets, userLat, userLon, maxDistance = 20) {
    if (!markets || !Array.isArray(markets)) {
        return [];
    }

    return markets
        .map(market => {
            // Skip markets without location data
            if (!market.latitude || !market.longitude) {
                return { ...market, distance: Infinity };
            }

            // Calculate distance in meters
            const distance = calculateDistance(
                userLat, 
                userLon, 
                parseFloat(market.latitude), 
                parseFloat(market.longitude)
            );

            return {
                ...market,
                distance: distance
            };
        })
        .filter(market => {
            // Filter by max distance (convert km to meters)
            return market.distance <= (maxDistance * 1000);
        })
        .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)
}

/**
 * Get products from nearby markets
 * @param {Array} products - Array of all products
 * @param {Array} stores - Array of all stores  
 * @param {Array} nearbyMarkets - Array of nearby markets
 * @returns {Array} Products from nearby markets with distance info
 */
export function getProductsFromNearbyMarkets(products, stores, nearbyMarkets) {
    if (!products || !stores || !nearbyMarkets) {
        return [];
    }

    // Create a Set of nearby market IDs for fast lookup
    const nearbyMarketIds = new Set(nearbyMarkets.map(market => market.id));
    
    // Create a map of store ID to market info for fast lookup
    const storeToMarketMap = new Map();
    stores.forEach(store => {
        if (nearbyMarketIds.has(store.marketId)) {
            const market = nearbyMarkets.find(m => m.id === store.marketId);
            storeToMarketMap.set(store.id, {
                store: store,
                market: market
            });
        }
    });

    // Filter products that belong to stores in nearby markets
    return products
        .filter(product => storeToMarketMap.has(product.storeId))
        .map(product => {
            const marketInfo = storeToMarketMap.get(product.storeId);
            return {
                ...product,
                store: marketInfo.store,
                market: marketInfo.market,
                distanceToMarket: marketInfo.market.distance
            };
        })
        .sort((a, b) => a.distanceToMarket - b.distanceToMarket); // Sort by market distance
}

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
    if (distance < 1000) {
        return `${Math.round(distance)}m`;
    } else {
        return `${(distance / 1000).toFixed(1)}km`;
    }
}

/**
 * Sample locations for major Vietnamese cities (fallback data)
 */
export const SAMPLE_LOCATIONS = {
    'TP.HCM': { latitude: 10.8231, longitude: 106.6297 },
    'Hà Nội': { latitude: 21.0285, longitude: 105.8542 },
    'Đà Nẵng': { latitude: 16.0544, longitude: 108.2022 },
    'Hải Phòng': { latitude: 20.8449, longitude: 106.6881 },
    'Cần Thơ': { latitude: 10.0452, longitude: 105.7469 },
    'Huế': { latitude: 16.4637, longitude: 107.5909 },
    'Nha Trang': { latitude: 12.2388, longitude: 109.1967 },
    'Buôn Ma Thuột': { latitude: 12.6667, longitude: 108.0500 },
    'Quy Nhon': { latitude: 13.7563, longitude: 109.2297 },
    'Vũng Tàu': { latitude: 10.4113, longitude: 107.1365 }
};
