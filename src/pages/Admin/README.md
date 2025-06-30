# Admin Dashboard - LocalMart

## Tổng quan

Admin Dashboard được thiết kế để quản lý toàn bộ hệ thống LocalMart với giao diện hiện đại và dễ sử dụng.

## Tính năng chính

### 1. Dashboard Tổng quan
- Thống kê tổng quan về người dùng, chợ, đơn hàng, doanh thu
- Biểu đồ xu hướng và hoạt động gần đây
- Thao tác nhanh đến các tính năng quan trọng

### 2. Quản lý Người dùng
- Xem danh sách tất cả người dùng
- Thêm, sửa, xóa người dùng
- Phân quyền: Admin, Buyer, Seller, ProxyShopper
- Quản lý trạng thái: Active, Disabled
- Tìm kiếm và lọc theo vai trò, trạng thái
- Xuất danh sách Excel

### 3. Quản lý Chợ
- Danh sách các chợ trong hệ thống
- Thêm chợ mới với thông tin chi tiết
- Cập nhật thông tin chợ (địa chỉ, giờ hoạt động, phí thuê)
- Quản lý trạng thái: Active, Inactive, Maintenance
- Xem số lượng cửa hàng trong mỗi chợ

### 4. Quản lý Đơn hàng
- Theo dõi tất cả đơn hàng trong hệ thống
- Xem chi tiết đơn hàng và tiến trình
- Quản lý trạng thái đơn hàng
- Theo dõi thanh toán
- Thống kê doanh thu theo ngày

### 5. Quản lý Nội dung
- **FAQ Management**: Quản lý câu hỏi thường gặp
  - Phân loại theo danh mục
  - Sắp xếp thứ tự hiển thị
  - Kích hoạt/tạm dừng hiển thị
- **Policy Management**: Quản lý chính sách
  - Chính sách bảo mật, điều khoản sử dụng
  - Chính sách đổi trả, giao hàng
  - Editor với định dạng rich text

### 6. Báo cáo & Thống kê
- Biểu đồ doanh thu theo thời gian
- Phân tích tăng trưởng người dùng
- Thống kê sản phẩm bán chạy
- Phân bố theo danh mục
- Xuất báo cáo Excel/PDF

## Cấu trúc Routes

```
/admin
├── /                     # Dashboard chính
├── /users               # Quản lý người dùng
├── /users/create        # Thêm người dùng
├── /markets             # Quản lý chợ
├── /markets/create      # Thêm chợ mới
├── /orders              # Quản lý đơn hàng
├── /faqs                # Quản lý FAQ
├── /policies            # Quản lý chính sách
├── /analytics/users     # Thống kê người dùng
├── /analytics/revenue   # Thống kê doanh thu
└── /analytics/products  # Thống kê sản phẩm
```

## Components được sử dụng

### Layout
- `AdminLayout.js`: Layout chính với sidebar và header
- Responsive design, hỗ trợ thu gọn sidebar
- Menu navigation với icon và badge thông báo

### Pages
- `AdminDashboard.js`: Trang dashboard tổng quan
- `UserManagement.js`: Quản lý người dùng với CRUD operations
- `MarketManagement.js`: Quản lý chợ với form chi tiết
- `OrderManagement.js`: Theo dõi và xử lý đơn hàng
- `ContentManagement.js`: Quản lý FAQ và policies
- `Analytics.js`: Báo cáo và thống kê với charts

### Utilities
- `userValidation.js`: Validation cho user data
- API services cho từng module

## API Integration

Tất cả các trang đều được thiết kế để tích hợp với backend APIs:

- **User API**: `/api/user/*`
- **Market API**: `/api/market/*`
- **Order API**: `/api/order/*`
- **FAQ API**: `/api/faq/*`
- **Policy API**: `/api/policy/*`

## Responsive Design

- Desktop: Layout đầy đủ với sidebar
- Tablet: Sidebar có thể thu gọn
- Mobile: Drawer navigation

## Security

- Protected routes chỉ cho role Admin
- Token-based authentication
- Validation cho mọi form input
- XSS protection với sanitization

## Sử dụng

1. Đăng nhập với tài khoản Admin
2. Truy cập `/admin` để vào dashboard
3. Sử dụng menu sidebar để điều hướng
4. Mỗi trang có chức năng tìm kiếm, lọc, và CRUD operations
5. Export data ra Excel khi cần

## Development Notes

- Sử dụng Ant Design components
- State management với React hooks
- Mock data cho demo, cần thay thế bằng API calls thực tế
- Charts sử dụng recharts library
- Form validation với Ant Design Form
- Responsive với CSS Grid và Flexbox
