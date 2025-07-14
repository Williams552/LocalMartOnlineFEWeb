# Personal Shopping Stats Feature - LocalMart Seller Dashboard

## 📊 Tổng quan

Tính năng **Thống kê mua sắm cá nhân** được phát triển dành cho sellers có vai trò kép (dual role) - vừa là người bán vừa là khách hàng trên nền tảng LocalMart. Tính năng này giúp sellers theo dõi hoạt động mua sắm cá nhân của họ.

## ✨ Tính năng chính

### 🛒 Thống kê mua sắm toàn diện

1. **Tổng đơn hàng đã mua**: Số lượng đơn hàng khi seller mua sắm như khách hàng
2. **Tổng số tiền đã chi tiêu**: Tổng giá trị các đơn hàng đã mua
3. **Sản phẩm yêu thích**: Số lượng sản phẩm đã thêm vào danh sách yêu thích
4. **Giỏ hàng hiện tại**: Số sản phẩm đang có trong giỏ hàng

### 📈 Phân tích chi tiết

- **Giá trị trung bình/đơn hàng**: Tính toán từ tổng chi tiêu và số đơn hàng
- **Đơn hàng theo trạng thái**: Phân loại theo pending, confirmed, shipping, delivered, cancelled
- **Đơn hàng gần đây**: Hiển thị 5 đơn hàng mua sắm mới nhất
- **Thông tin dual role**: Insights về việc vừa bán vừa mua

### 🔗 Tích hợp đầy đủ

- **Liên kết với giỏ hàng**: Truy cập nhanh đến trang giỏ hàng
- **Quản lý đơn hàng**: Xem chi tiết các đơn hàng đã mua
- **Danh sách yêu thích**: Quản lý sản phẩm yêu thích
- **Navigation**: Tích hợp với seller dashboard và sidebar

## 🏗️ Cấu trúc code

### Services
```
src/services/personalShoppingService.js
```
- **getPersonalShoppingStats()**: Lấy thống kê tổng quan
- **getMyOrders()**: Lấy danh sách đơn hàng
- **getCartSummary()**: Lấy tóm tắt giỏ hàng
- **getFavoriteProducts()**: Lấy sản phẩm yêu thích
- **getCartItems()**: Lấy chi tiết giỏ hàng

### Components
```
src/components/Seller/PersonalShoppingStats.js
```
- **Overview Cards**: Hiển thị 4 metrics chính
- **Order Status Breakdown**: Phân tích đơn hàng theo trạng thái
- **Recent Orders**: Danh sách đơn hàng gần đây
- **Shopping Insights**: Thông tin về dual role

### Pages
```
src/pages/Sellers/PersonalShopping.js
```
- **Multi-tab Interface**: Overview, Cart, Orders, Favorites
- **Real-time Data**: Tải dữ liệu khi chuyển tab
- **Navigation Links**: Liên kết đến các trang liên quan
- **Error Handling**: Xử lý lỗi và loading states

### Test Page
```
src/pages/Test/TestPersonalShopping.js
```
- **Demo Interface**: Showcase tính năng với mock data
- **API Documentation**: Hướng dẫn sử dụng API
- **Usage Instructions**: Hướng dẫn sử dụng chi tiết

## 🔌 API Integration

### 1. Order Management
```javascript
// Get user's orders as buyer
GET /api/order/buyer/{buyerId}?page=1&pageSize=50
Headers: {
  Authorization: "Bearer {token}",
  userId: "{userId}",
  userRole: "Buyer"
}
```

### 2. Cart Management
```javascript
// Get cart items
GET /api/Cart/{userId}
Headers: {
  Authorization: "Bearer {token}"
}

// Get cart summary
GET /api/Cart/{userId}/summary
Headers: {
  Authorization: "Bearer {token}"
}
```

### 3. Favorites Management
```javascript
// Get favorite products
GET /api/favorite?page=1&pageSize=50
Headers: {
  Authorization: "Bearer {token}"
}
```

### 4. Mock Data Support
Service cung cấp mock data khi API chưa sẵn sàng:
```javascript
const mockStats = personalShoppingService.getMockShoppingStats();
```

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first approach**: Tối ưu cho thiết bị di động
- **Grid layouts**: Tự động điều chỉnh theo màn hình
- **Touch-friendly**: Interface thân thiện với touch

### Visual Elements
- **Color-coded stats**: Mỗi metric có màu sắc riêng biệt
- **Status indicators**: Icons và badges cho trạng thái đơn hàng
- **Progress indicators**: Loading states và transitions
- **Interactive elements**: Hover effects và click feedback

### Tab Interface
- **Overview**: Thống kê tổng quan với charts
- **Cart**: Hiển thị giỏ hàng hiện tại
- **Orders**: Danh sách đơn hàng với filter
- **Favorites**: Quản lý sản phẩm yêu thích

## 🚀 Navigation & Routing

### URL Structure
```
/seller/personal-shopping          # Main page
/test-personal-shopping           # Test/demo page
```

### Sidebar Integration
```javascript
{
  path: '/seller/personal-shopping',
  icon: FaShoppingBag,
  label: 'Mua sắm cá nhân',
  color: 'text-pink-600',
  description: 'Hoạt động mua sắm'
}
```

### Dashboard Quick Actions
```javascript
<Link to="/seller/personal-shopping">
  <FaBox />
  Mua sắm cá nhân
</Link>
```

## 📱 Features by Tab

### Overview Tab
- **4 Main Metrics Cards**: Orders, Spending, Favorites, Cart
- **Order Status Chart**: Visual breakdown by status
- **Recent Orders List**: 5 most recent orders
- **Dual Role Insights**: Benefits explanation

### Cart Tab
- **Current Cart Items**: Products currently in cart
- **Seller Information**: Show which sellers
- **Price Breakdown**: Individual and total prices
- **Quick Actions**: Link to full cart page

### Orders Tab
- **Order History**: Paginated list of orders
- **Status Filtering**: Filter by order status
- **Order Details**: Customer info, items, pricing
- **Timeline View**: Order progression

### Favorites Tab
- **Product Count**: Total favorites counter
- **Quick Links**: Navigate to product discovery
- **Future Enhancement**: Full favorites management

## 🔧 Development Features

### Error Handling
```javascript
try {
  const stats = await personalShoppingService.getPersonalShoppingStats();
  setStatistics(stats);
} catch (error) {
  console.error('Error:', error);
  setError('Không thể tải dữ liệu');
  // Fallback to mock data
  setStatistics(personalShoppingService.getMockShoppingStats());
}
```

### Loading States
```javascript
if (loading) {
  return <LoadingSkeleton />;
}
```

### Data Formatting
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
```

## 🎯 Benefits cho Sellers

### Business Intelligence
1. **Customer Perspective**: Hiểu trải nghiệm khách hàng thông qua việc mua sắm
2. **Market Research**: Phân tích xu hướng mua sắm để cải thiện sản phẩm
3. **Dual Role Management**: Quản lý cả hai vai trò trong một interface
4. **Behavior Analysis**: Phân tích thói quen để tối ưu chiến lược

### User Experience
1. **Unified Dashboard**: Tất cả thông tin trong một nơi
2. **Quick Access**: Liên kết nhanh đến các tính năng liên quan
3. **Real-time Updates**: Dữ liệu cập nhật theo thời gian thực
4. **Mobile Optimized**: Sử dụng mọi lúc, mọi nơi

## 🚀 Future Enhancements

### Advanced Analytics
1. **Spending Trends**: Biểu đồ xu hướng chi tiêu theo thời gian
2. **Category Analysis**: Phân tích theo danh mục sản phẩm
3. **Seasonal Patterns**: Nhận diện mùa vụ mua sắm
4. **Recommendation Engine**: Gợi ý sản phẩm dựa trên lịch sử

### Enhanced Features
1. **Order Tracking**: Theo dõi đơn hàng real-time
2. **Wishlist Management**: Quản lý danh sách mong muốn
3. **Price Alerts**: Thông báo khi sản phẩm yêu thích giảm giá
4. **Social Features**: Chia sẻ sản phẩm yêu thích

### Integration
1. **Notification System**: Thông báo về đơn hàng và ưu đãi
2. **Loyalty Program**: Tích hợp chương trình khách hàng thân thiết
3. **Review System**: Đánh giá sản phẩm đã mua
4. **Support Chat**: Hỗ trợ trực tiếp cho việc mua sắm

## 🔒 Security & Privacy

### Data Protection
- **User Authentication**: Kiểm tra quyền truy cập
- **Role-based Access**: Chỉ sellers được truy cập
- **Data Encryption**: Mã hóa thông tin nhạy cảm
- **Privacy Controls**: Quản lý quyền riêng tư

### API Security
- **JWT Authentication**: Token-based security
- **Role Validation**: Kiểm tra vai trò người dùng
- **Rate Limiting**: Giới hạn số lượng request
- **Input Validation**: Validate dữ liệu đầu vào

## 📊 Performance

### Optimization
- **Lazy Loading**: Tải dữ liệu khi cần thiết
- **Caching Strategy**: Cache dữ liệu thường xuyên sử dụng
- **Pagination**: Phân trang cho danh sách lớn
- **Image Optimization**: Tối ưu hình ảnh sản phẩm

### Monitoring
- **Error Tracking**: Theo dõi và xử lý lỗi
- **Performance Metrics**: Đo lường hiệu suất
- **User Analytics**: Phân tích hành vi người dùng
- **A/B Testing**: Test các tính năng mới

---

**Developed for LocalMart Seller Dashboard** | **Version 1.0** | **December 2024**
