import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

const AccessDenied = ({ 
    title = "Không có quyền truy cập", 
    subtitle = "Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.",
    showBackButton = true 
}) => {
    const navigate = useNavigate();

    return (
        <Result
            status="403"
            icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
            title={title}
            subTitle={subtitle}
            extra={
                showBackButton && (
                    <Button type="primary" onClick={() => navigate('/admin')}>
                        Quay về Dashboard
                    </Button>
                )
            }
        />
    );
};

export default AccessDenied;
