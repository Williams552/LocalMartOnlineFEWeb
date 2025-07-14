# Customer Analytics Feature - LocalMart Seller Dashboard

## 📊 Tổng quan

Tính năng **Thống kê khách hàng** được phát triển để cung cấp cho sellers một cái nhìn tổng quan về khách hàng thân thiết, phân tích theo hạng thành viên và tỷ lệ khách hàng quay lại.

## ✨ Tính năng chính

### 🏆 Khách hàng thân thiết theo tier

- **Bronze customers** (0-399 điểm): Khách hàng mới, ít giao dịch
- **Silver customers** (400-599 điểm): Khách hàng trung bình  
- **Gold customers** (600-799 điểm): Khách hàng VIP
- **Platinum customers** (800+ điểm): Khách hàng VVIP

### 📈 Tỷ lệ khách hàng quay lại (Repeat customer rate)

- Tính toán phần trăm khách hàng có 2+ đơn hàng
- Giúp đánh giá mức độ hài lòng và chất lượng dịch vụ

### 🔗 Link đến trang quản lý khách hàng chi tiết

- Danh sách khách hàng thân thiết với bộ lọc
- Thông tin chi tiết từng khách hàng
- Lịch sử mua hàng

## 🏗️ Cấu trúc code

### Các file được tạo/cập nhật:

1. **Services**
   - `src/services/customerService.js` - Service xử lý API liên quan khách hàng

2. **Components**
   - `src/components/Seller/CustomerAnalytics.js` - Component hiển thị thống kê tổng quan
   - `src/components/Seller/CustomerList.js` - Component danh sách khách hàng

3. **Pages**
   - `src/pages/Sellers/CustomerManagement.js` - Trang quản lý khách hàng chính
   - `src/pages/Test/TestCustomerAnalytics.js` - Trang test components

4. **Routes**
   - Cập nhật `src/routes/routes.js` để thêm route `/seller/customers`

5. **Dashboard Integration**
   - Cập nhật `src/pages/Sellers/SellerDashboard.js` để liên kết với trang customer analytics

## 🔌 API Endpoints

### 1. Customer Statistics
```
GET /api/customer/statistics
Headers: userId, userRole: "Seller"
```

**Response:**
```json
{
  "totalLoyalCustomers": 45,
  "totalRevenue": 18500000,
  "averageCustomerValue": 411111,
  "bronzeCustomers": 25,
  "silverCustomers": 12,
  "goldCustomers": 6,
  "platinumCustomers": 2,
  "repeatCustomerRate": 78.5
}
```

### 2. Loyal Customers List
```
GET /api/customer?page=1&pageSize=10&sortBy=totalSpent&sortOrder=desc
Headers: userId, userRole: "Seller"
```

**Response:**
```json
{
  "customers": [...],
  "totalCount": 45,
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### 3. Customer Order Summary
```
GET /api/customer/customer/{customerId}/orders
Headers: userId, userRole: "Seller"
```

### 4. Loyalty Score Information
```
GET /api/customer/loyalty-score-info
Headers: userRole: "Seller"
```

## 🎨 UI/UX Features

### Dashboard Analytics
- **Overview Cards**: Tổng khách hàng thân thiết, giá trị TB/khách hàng, tỷ lệ quay lại
- **Tier Breakdown**: Biểu đồ phân bố khách hàng theo hạng với màu sắc riêng biệt
- **Progress Bars**: Thể hiện tỷ lệ % từng hạng khách hàng
- **Insights Section**: Thông tin chi tiết và cơ hội tăng trưởng

### Customer List Management
- **Search & Filter**: Tìm kiếm theo tên/email, lọc theo hạng thành viên
- **Sorting**: Sắp xếp theo chi tiêu, số đơn hàng, ngày mua gần nhất, điểm thành viên
- **Pagination**: Phân trang với điều hướng
- **Customer Details Modal**: Popup hiển thị thông tin chi tiết khách hàng

### Responsive Design
- Mobile-first approach
- Grid layout tự động điều chỉnh theo kích thước màn hình
- Touch-friendly interface

## 🔧 Cách sử dụng

### 1. Truy cập trang Customer Analytics
```javascript
// Từ dashboard
<Link to="/seller/customers">Thống kê khách hàng</Link>

// Hoặc truy cập trực tiếp
navigate('/seller/customers');
```

### 2. Sử dụng Customer Service
```javascript
import customerService from '../services/customerService';

// Lấy thống kê khách hàng
const stats = await customerService.getCustomerStatistics();

// Lấy danh sách khách hàng thân thiết
const customers = await customerService.getLoyalCustomers({
  page: 1,
  pageSize: 10,
  sortBy: 'totalSpent',
  sortOrder: 'desc'
});
```

### 3. Sử dụng Components
```javascript
import CustomerAnalytics from '../components/Seller/CustomerAnalytics';
import CustomerList from '../components/Seller/CustomerList';

// Customer Analytics
<CustomerAnalytics 
  statistics={statistics}
  loading={loading}
/>

// Customer List
<CustomerList
  customers={customers}
  loading={loading}
  onCustomerSelect={handleCustomerSelect}
  pagination={pagination}
  onPageChange={handlePageChange}
/>
```

## 🧪 Testing

### Test Page
Truy cập `/test-customer-analytics` để test các components với dữ liệu mẫu.

### Mock Data
Service cung cấp mock data khi API chưa sẵn sàng:
```javascript
const mockStats = customerService.getMockStatistics();
const mockCustomers = customerService.getMockCustomers();
```

## 🎯 Benefits cho Sellers

1. **Hiểu rõ khách hàng**: Phân tích hành vi mua hàng và mức độ trung thành
2. **Tối ưu hóa dịch vụ**: Dựa trên tỷ lệ khách hàng quay lại để cải thiện
3. **Chiến lược marketing**: Tập trung vào các hạng khách hàng có giá trị cao
4. **Tăng doanh thu**: Hiểu được giá trị TB/khách hàng để xây dựng chiến lược bán hàng

## 🚀 Future Enhancements

1. **Customer Segmentation**: Phân nhóm khách hàng theo nhiều tiêu chí khác
2. **Predictive Analytics**: Dự đoán khách hàng có khả năng rời bỏ
3. **Customer Lifetime Value**: Tính toán giá trị lifetime của khách hàng
4. **Personalized Offers**: Gợi ý ưu đãi cá nhân hóa cho từng tier
5. **Export & Reports**: Xuất báo cáo Excel/PDF
6. **Real-time Updates**: Cập nhật thống kê real-time

## 📱 Navigation

- **Sidebar**: `/seller/customers` - Quản lý khách hàng
- **Dashboard**: Quick action card "Thống kê khách hàng"
- **Dashboard**: Clickable loyal customers count
- **Breadcrumb**: Navigation giữa các trang seller

## 🔒 Security & Permissions

- Chỉ sellers được phép truy cập (`allowedRoles: ['Seller']`)
- API yêu cầu header `userRole: "Seller"`
- Dữ liệu chỉ hiển thị khách hàng của seller đang đăng nhập

---

**Developed for LocalMart Seller Dashboard** | **Version 1.0** | **December 2024**
