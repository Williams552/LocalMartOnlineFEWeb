## Test Case: Store Suspend/Reactivate Functionality

### Issue Analysis
The suspend/reactivate store functionality was not working due to:

1. **Wrong API Endpoints**: Using UPDATE endpoint instead of specific SUSPEND/REACTIVATE endpoints
2. **Wrong HTTP Method**: Using POST instead of PATCH 
3. **Input Handling**: Using document.getElementById which doesn't work well with Ant Design Modals

### Solutions Implemented

#### 1. Updated API Endpoints (`apiEndpoints.js`)
```javascript
STORE: {
    // ... existing endpoints
    SUSPEND: (id) => `${API_URL}/api/store/${id}/suspend`,
    REACTIVATE: (id) => `${API_URL}/api/store/${id}/reactivate`,
    // ... other endpoints
}
```

#### 2. Fixed storeService Methods (`storeService.js`)
- Changed from POST to PATCH HTTP method
- Using correct endpoint URLs
- Improved error handling with specific error messages

#### 3. Enhanced UI Components (`StoreManagement.js`)
- Better reason input handling using onChange instead of document.getElementById
- Added confirmation modals for both suspend and reactivate
- Improved error messages
- Added proper loading states

### Testing Steps

1. **Test Suspend Function**:
   - Navigate to `/admin/stores`
   - Find an active store (status: "Open")
   - Click the "Tạm ngưng" (Suspend) button
   - Enter a reason in the textarea
   - Click "Tạm ngưng" to confirm
   - Verify store status changes to "Suspended"

2. **Test Reactivate Function**:
   - Find a suspended store (status: "Suspended") 
   - Click the "Kích hoạt lại" (Reactivate) button
   - Click "Kích hoạt" to confirm
   - Verify store status changes back to "Open"

3. **Error Handling Test**:
   - Try with invalid store IDs
   - Test network failure scenarios
   - Verify appropriate error messages are shown

### Backend Requirements
The Backend endpoints are already implemented:
- `PATCH /api/store/{id}/suspend` - Requires { reason: string }
- `PATCH /api/store/{id}/reactivate` - No body required

### Expected Results
- Suspend: Store status changes to "Suspended", reason is stored
- Reactivate: Store status changes to "Open"
- UI updates automatically after successful operation
- Appropriate success/error messages shown
- Loading states during API calls
