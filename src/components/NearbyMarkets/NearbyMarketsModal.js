import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Card, Typography, message, Spin, Tag, Input, Select, Divider, Alert } from 'antd';
import { EnvironmentOutlined, SearchOutlined, ReloadOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getCurrentLocationEnhanced, checkLocationPermission, getNearbyMarkets, formatDistance, SAMPLE_LOCATIONS } from '../../utils/locationUtils';
import marketService from '../../services/marketService';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const NearbyMarketsModal = ({ visible, onClose, onSelectMarket, selectedMarket }) => {
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [markets, setMarkets] = useState([]);
    const [nearbyMarkets, setNearbyMarkets] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [maxDistance, setMaxDistance] = useState(10); // Default 10km
    const [searchRadius, setSearchRadius] = useState('10');
    const [locationError, setLocationError] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(null);

    useEffect(() => {
        if (visible) {
            loadMarkets();
            checkPermissionStatus();
        }
    }, [visible]);

    const checkPermissionStatus = async () => {
        try {
            const status = await checkLocationPermission();
            setPermissionStatus(status);
            console.log('📍 Permission status:', status);
        } catch (error) {
            console.warn('⚠️ Could not check permission:', error);
        }
    };

    const loadMarkets = async () => {
        try {
            setLoading(true);
            const marketsData = await marketService.getActiveMarkets();
            setMarkets(marketsData || []);
            console.log('📍 Loaded markets:', marketsData);
        } catch (error) {
            console.error('❌ Error loading markets:', error);
            message.error('Không thể tải danh sách chợ');
            setMarkets([]);
        } finally {
            setLoading(false);
        }
    };

    const getUserLocationAndFindNearby = async () => {
        try {
            setLocationLoading(true);
            setLocationError(null);
            
            // Try enhanced location method first
            let location;
            try {
                location = await getCurrentLocationEnhanced({
                    enableFallback: true,
                    timeout: 15000
                });
                
                // Show different messages based on method used
                if (location.method === 'ip') {
                    message.info('📍 Sử dụng vị trí xấp xỉ từ IP (độ chính xác thấp)', 3);
                } else {
                    message.success('📍 Đã xác định vị trí chính xác từ GPS', 2);
                }
                
            } catch (enhancedError) {
                console.warn('⚠️ Enhanced location failed, trying manual method:', enhancedError);
                throw enhancedError; // Re-throw to trigger manual selection
            }
            
            setUserLocation(location);
            console.log('📍 User location obtained:', location);
            
            // Find nearby markets
            findNearbyWithLocation(location);
            
        } catch (error) {
            console.error('❌ Error getting location:', error);
            setLocationError(error.message);
            
            // Show error message with action suggestions
            const errorMsg = error.message || 'Không thể xác định vị trí của bạn';
            
            // Different handling based on error type
            if (error.message && error.message.includes('từ chối')) {
                // Permission denied - show manual selection immediately
                message.warning('📍 Vị trí bị từ chối. Vui lòng chọn thành phố thủ công.', 3);
                setTimeout(() => {
                    showManualLocationSelection();
                }, 500); // Small delay for better UX
            } else {
                // Other errors - show error first, then manual selection
                message.error(errorMsg, 4);
                setTimeout(() => {
                    showManualLocationSelection();
                }, 1500);
            }
            
        } finally {
            setLocationLoading(false);
        }
    };

    const findNearbyWithLocation = (location) => {
        const nearby = getNearbyMarkets(
            markets, 
            location.latitude, 
            location.longitude, 
            maxDistance
        );
        
        setNearbyMarkets(nearby);
        console.log('🏪 Nearby markets:', nearby);
        
        if (nearby.length === 0) {
            message.info(`Không tìm thấy chợ nào trong bán kính ${maxDistance}km`);
        } else {
            message.success(`Tìm thấy ${nearby.length} chợ gần bạn`);
        }
    };

    const showManualLocationSelection = () => {
        Modal.confirm({
            title: '📍 Chọn thành phố gần bạn',
            width: 500,
            content: (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f0f2ff', borderRadius: '4px', border: '1px solid #d9d9d9' }}>
                        <Text style={{ fontSize: '13px', color: '#666' }}>
                            💡 Không thể truy cập vị trí GPS. Vui lòng chọn thành phố gần nhất với bạn để tìm các chợ xung quanh.
                        </Text>
                    </div>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="🏙️ Chọn thành phố của bạn..."
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(city) => {
                            const location = SAMPLE_LOCATIONS[city];
                            if (location) {
                                setUserLocation({ 
                                    ...location, 
                                    isManual: true, 
                                    city: city,
                                    method: 'manual'
                                });
                                findNearbyWithLocation({ 
                                    ...location, 
                                    isManual: true, 
                                    city: city,
                                    method: 'manual'
                                });
                                message.success(`📍 Đã chọn vị trí: ${city}`, 3);
                                
                                // Clear error when manual selection works
                                setLocationError(null);
                            }
                        }}
                    >
                        {Object.keys(SAMPLE_LOCATIONS).map(city => (
                            <Option key={city} value={city}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🏙️</span>
                                    <span>{city}</span>
                                </span>
                            </Option>
                        ))}
                    </Select>
                    <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                        <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                            ✅ Tính năng này sẽ tìm các chợ trong bán kính {maxDistance}km xung quanh thành phố bạn chọn.
                        </Text>
                    </div>
                </div>
            ),
            okText: 'Đóng',
            cancelText: 'Xem tất cả chợ',
            onCancel: () => {
                message.info('Hiển thị tất cả chợ có sẵn', 2);
            }
        });
    };

    const handleSelectMarket = (market) => {
        onSelectMarket(market);
        message.success(`Đã chọn chợ ${market.name} (${formatDistance(market.distance)})`);
        onClose();
    };

    const handleRadiusChange = (value) => {
        const radius = parseFloat(value);
        if (radius && radius > 0 && radius <= 100) {
            setMaxDistance(radius);
            
            // Re-filter nearby markets with new radius
            if (userLocation) {
                findNearbyWithLocation(userLocation);
            }
        }
    };

    const clearLocationFilter = () => {
        setUserLocation(null);
        setNearbyMarkets([]);
        setSearchRadius('10');
        setMaxDistance(10);
        setLocationError(null);
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    <span>Tìm chợ gần đây</span>
                </div>
            }
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
            {/* Controls */}
            <div style={{ marginBottom: '16px' }}>
                {/* Quick Instructions */}
                <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae7ff' }}>
                    <Text style={{ fontSize: '13px', color: '#0958d9' }}>
                        🎯 <strong>Cách sử dụng:</strong> 
                        <span style={{ marginLeft: '8px' }}>
                            Click "Tìm chợ gần tôi" (cho phép truy cập vị trí) hoặc "Chọn thành phố" (chọn thủ công)
                        </span>
                    </Text>
                </div>

                {/* Permission Status Info */}
                {permissionStatus && permissionStatus === 'denied' && (
                    <Alert
                        message="Quyền truy cập vị trí bị từ chối"
                        description={
                            <div>
                                <p>Để sử dụng tính năng tìm chợ gần đây, vui lòng:</p>
                                <ol style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                    <li>Click vào biểu tượng 🔒 bên cạnh URL</li>
                                    <li>Chọn "Cho phép" vị trí</li>
                                    <li>Tải lại trang và thử lại</li>
                                </ol>
                            </div>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: '12px' }}
                        closable
                    />
                )}

                {/* Location Error Display */}
                {locationError && (
                    <Alert
                        message="Lỗi xác định vị trí"
                        description={
                            <div>
                                <p><strong>Chi tiết lỗi:</strong> {locationError}</p>
                                <p><strong>Giải pháp:</strong></p>
                                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                    <li>Đảm bảo đã bật GPS/định vị trên thiết bị</li>
                                    <li>Kiểm tra kết nối internet</li>
                                    <li>Thử chọn thành phố thủ công bên dưới</li>
                                    <li>Sử dụng tính năng "Tất cả chợ" để xem danh sách đầy đủ</li>
                                </ul>
                            </div>
                        }
                        type="error"
                        showIcon
                        style={{ marginBottom: '12px' }}
                        closable
                        onClose={() => setLocationError(null)}
                    />
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <Button
                        type="primary"
                        icon={<EnvironmentOutlined />}
                        loading={locationLoading}
                        onClick={getUserLocationAndFindNearby}
                        disabled={loading}
                    >
                        {locationError ? 'Thử lại định vị' : 'Tìm chợ gần tôi'}
                    </Button>

                    <Button
                        icon={<EnvironmentOutlined />}
                        onClick={showManualLocationSelection}
                        disabled={loading}
                        style={{ borderColor: '#52c41a', color: '#52c41a' }}
                    >
                        📍 Chọn thành phố
                    </Button>
                    
                    <Search
                        placeholder="Bán kính tìm kiếm"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(e.target.value)}
                        onSearch={handleRadiusChange}
                        style={{ width: '180px' }}
                        suffix="km"
                        enterButton="Áp dụng"
                    />
                    
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadMarkets}
                        loading={loading}
                        title="Tải lại danh sách chợ"
                    />

                    {userLocation && (
                        <Button
                            icon={<CloseOutlined />}
                            onClick={clearLocationFilter}
                            title="Xóa bộ lọc vị trí"
                        />
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                    <InfoCircleOutlined />
                    <span>
                        💡 Cho phép trình duyệt truy cập vị trí để tìm chợ gần bạn nhất. 
                        Bán kính tìm kiếm: 1-100km. 
                        {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && 
                            '⚠️ Yêu cầu HTTPS để định vị chính xác.'
                        }
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải danh sách chợ...</div>
                </div>
            )}

            {/* User Location Info */}
            {userLocation && !loading && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <Text style={{ fontSize: '12px', color: '#389e0d' }}>
                                📍 Vị trí {userLocation.isManual ? `đã chọn (${userLocation.city})` : 'hiện tại'}: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                            </Text>
                            {userLocation.method && (
                                <div style={{ marginTop: '4px' }}>
                                    <Tag size="small" color={
                                        userLocation.method === 'gps' ? 'green' : 
                                        userLocation.method === 'manual' ? 'blue' : 'orange'
                                    }>
                                        {userLocation.method === 'gps' ? '🛰️ GPS' : 
                                         userLocation.method === 'manual' ? '🏙️ Thủ công' : '🌐 IP'}
                                    </Tag>
                                    {userLocation.accuracy && (
                                        <Text style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
                                            Độ chính xác: ±{userLocation.accuracy < 1000 ? `${Math.round(userLocation.accuracy)}m` : `${(userLocation.accuracy/1000).toFixed(1)}km`}
                                        </Text>
                                    )}
                                </div>
                            )}
                            {userLocation.isManual && (
                                <div style={{ marginTop: '4px' }}>
                                    <Text style={{ fontSize: '11px', color: '#1890ff' }}>
                                        💡 Đã chọn tọa độ trung tâm của {userLocation.city}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Nearby Markets Results */}
            {!loading && nearbyMarkets.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <Title level={5} style={{ margin: 0 }}>
                            🏪 Chợ gần bạn ({nearbyMarkets.length} chợ trong {maxDistance}km)
                        </Title>
                    </div>
                    
                    <List
                        dataSource={nearbyMarkets}
                        renderItem={(market, index) => (
                            <List.Item style={{ padding: '0', marginBottom: '8px' }}>
                                <Card 
                                    hoverable
                                    size="small"
                                    style={{ 
                                        width: '100%',
                                        border: selectedMarket?.id === market.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSelectMarket(market)}
                                    bodyStyle={{ padding: '12px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <Text strong style={{ fontSize: '14px' }}>
                                                    #{index + 1} {market.name}
                                                </Text>
                                                {selectedMarket?.id === market.id && (
                                                    <Tag color="blue" size="small">Đã chọn</Tag>
                                                )}
                                            </div>
                                            
                                            <div style={{ marginBottom: '4px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    <EnvironmentOutlined /> {market.address || 'Chưa có địa chỉ'}
                                                </Text>
                                            </div>
                                            
                                            {market.operatingHours && (
                                                <div>
                                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                                        🕒 {market.operatingHours}
                                                    </Text>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{ textAlign: 'center', marginLeft: '12px' }}>
                                            <Tag color="green" style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
                                                {formatDistance(market.distance)}
                                            </Tag>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            )}

            {/* No Nearby Markets Found */}
            {!loading && userLocation && nearbyMarkets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <Title level={4} style={{ color: '#666' }}>
                        Không tìm thấy chợ gần đây
                    </Title>
                    <Text type="secondary">
                        Không có chợ nào trong bán kính {maxDistance}km từ vị trí của bạn.
                        <br />
                        Hãy thử tăng bán kính tìm kiếm hoặc chọn chợ từ danh sách tất cả chợ bên dưới.
                    </Text>
                </div>
            )}

            {/* All Markets (fallback) */}
            {!loading && (!userLocation || nearbyMarkets.length === 0) && markets.length > 0 && (
                <div>
                    <Divider />
                    <Title level={5} style={{ marginBottom: '12px' }}>
                        🏪 Tất cả chợ ({markets.length} chợ)
                    </Title>
                    <List
                        dataSource={markets.slice(0, 10)} // Show only first 10 to avoid overwhelming
                        renderItem={(market) => (
                            <List.Item style={{ padding: '0', marginBottom: '8px' }}>
                                <Card 
                                    hoverable
                                    size="small"
                                    style={{ 
                                        width: '100%',
                                        border: selectedMarket?.id === market.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        onSelectMarket(market);
                                        message.success(`Đã chọn chợ ${market.name}`);
                                        onClose();
                                    }}
                                    bodyStyle={{ padding: '12px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <Text strong style={{ fontSize: '14px' }}>
                                                    {market.name}
                                                </Text>
                                                {selectedMarket?.id === market.id && (
                                                    <Tag color="blue" size="small">Đã chọn</Tag>
                                                )}
                                            </div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                <EnvironmentOutlined /> {market.address || 'Chưa có địa chỉ'}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                    {markets.length > 10 && (
                        <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                            ... và {markets.length - 10} chợ khác. Sử dụng tính năng "Tìm chợ gần tôi" để xem kết quả tốt hơn.
                        </Text>
                    )}
                </div>
            )}

            {/* No Markets at all */}
            {!loading && markets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
                    <Title level={4} style={{ color: '#666' }}>
                        Chưa có chợ nào
                    </Title>
                    <Text type="secondary">
                        Hiện tại chưa có chợ nào trong hệ thống.
                    </Text>
                </div>
            )}
        </Modal>
    );
};

export default NearbyMarketsModal;
