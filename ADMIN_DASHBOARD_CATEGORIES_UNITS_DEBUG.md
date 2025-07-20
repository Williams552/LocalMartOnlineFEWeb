# Debug: AdminDashboard Categories & Product Units Not Showing

## Vấn đề
AdminDashboard phần "Tổng danh mục" và "Đơn vị sản phẩm" đang chưa hiển thị đúng số liệu.

## Phân tích root cause

### 1. **DashboardService call pattern:**
```javascript
// Cách gọi API đã được sửa
categoryService.getAllCategories(1, 10) // (page, pageSize, params)
productUnitService.getAllUnits({ page: 1, pageSize: 10 })
```

### 2. **Response format khác nhau:**

**CategoryService**: Trả về
```javascript
{
  items: [...],
  totalCount: 50,
  page: 1, 
  pageSize: 10
}
```

**ProductUnitService**: Trả về
```javascript
{
  data: [...] // hoặc array trực tiếp
}
```

### 3. **DashboardService parsing:**
```javascript
// CategoryService - OK ✅
totalCategories = categoryData?.totalCount || categoryData?.items?.length || 0

// ProductUnitService - Cần fix ⚠️  
totalProductUnits = unitData?.length || unitData?.data?.length || 0
```

## Giải pháp đã áp dụng

### 1. **Cập nhật API calls:**
```javascript
const [usersResponse, storesResponse, categoriesResponse, productUnitsResponse, marketsResponse] = 
await Promise.allSettled([
    userService.getAllUsers({ pageNumber: 1, pageSize: 10 }),
    storeService.getAllStores({ page: 1, pageSize: 10 }),
    categoryService.getAllCategories(1, 10), // Fixed: correct parameters
    productUnitService.getAllUnits({ page: 1, pageSize: 10 }),
    marketService.getAllMarkets(1, 10) // Fixed: correct parameters
]);
```

### 2. **Cải thiện response parsing:**
```javascript
// Categories
totalCategories = categoryData?.totalCount || categoryData?.totalItems || 
                 (categoryData?.items ? categoryData.items.length : 0) ||
                 (categoryData?.data ? categoryData.data.length : 0) || 0;

// Product Units - handle both array and object
if (Array.isArray(unitData)) {
    totalProductUnits = unitData.length;
} else {
    totalProductUnits = unitData?.totalCount || unitData?.totalItems || 
                       (unitData?.data ? unitData.data.length : 0) || 0;
}
```

### 3. **Error handling:**
```javascript
if (categoriesResponse.status === 'fulfilled') {
    // Process data
} else {
    console.error('Categories fetch failed:', categoriesResponse.reason);
}
```

## Testing steps

1. **Mở AdminDashboard**
2. **Kiểm tra Console logs:**
   - `🔍 CategoryService - Calling admin endpoint`
   - `📊 Categories data: {...} Total: {number}`
   - `📊 Product units data: {...} Total: {number}`
3. **Verify numbers hiển thị:**
   - Card "Tổng danh mục" > 0
   - Card "Đơn vị sản phẩm" > 0

## Kết quả mong đợi

✅ **Tổng danh mục**: Hiển thị số categories từ backend  
✅ **Đơn vị sản phẩm**: Hiển thị số product units từ backend  
✅ **Error handling**: Log rõ ràng nếu API fails  
✅ **Fallback values**: Hiển thị 0 khi không có data thay vì undefined

## Backend endpoints sử dụng

- Categories: `GET /api/category/admin?page=1&pageSize=10`
- Product Units: `GET /api/productunit/admin?page=1&pageSize=10`  
- Stores: `GET /api/store/admin?page=1&pageSize=10`
- Markets: `GET /api/market/admin?page=1&pageSize=10`
- Users: `GET /api/User?pageNumber=1&pageSize=10&sortOrder=asc`
