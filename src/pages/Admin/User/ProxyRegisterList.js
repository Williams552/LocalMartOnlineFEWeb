import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Table, Tag, Button, Space, Modal, Input, DatePicker, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import proxyShopperRegistrationService from '../../../services/proxyShopperRegistrationService';

// Helper functions để chuyển đổi sang tiếng Việt
const getTransportMethodInVietnamese = (method) => {
  if (!method) return 'Chưa xác định';

  const transportMethods = {
    // Tiếng Anh thường gặp
    'Bicycle': 'Xe đạp',
    'bicycle': 'Xe đạp',
    'Bike': 'Xe đạp',
    'bike': 'Xe đạp',
    'Motorbike': 'Xe máy',
    'motorbike': 'Xe máy',
    'Motorcycle': 'Xe máy',
    'motorcycle': 'Xe máy',
    'Car': 'Ô tô',
    'car': 'Ô tô',
    'Walking': 'Đi bộ',
    'walking': 'Đi bộ',
    'Walk': 'Đi bộ',
    'walk': 'Đi bộ',
    'Public Transport': 'Phương tiện công cộng',
    'public transport': 'Phương tiện công cộng',
    'Bus': 'Xe buýt',
    'bus': 'Xe buýt',
    'Taxi': 'Taxi',
    'taxi': 'Taxi',
    'Grab': 'Grab',
    'grab': 'Grab',
    'Other': 'Khác',
    'other': 'Khác',
    // Có thể có từ backend
    'xe_dap': 'Xe đạp',
    'xe_may': 'Xe máy',
    'o_to': 'Ô tô',
    'di_bo': 'Đi bộ',
    'phuong_tien_cong_cong': 'Phương tiện công cộng'
  };
  return transportMethods[method] || method;
};

const getPaymentMethodInVietnamese = (method) => {
  if (!method) return 'Chưa xác định';

  const paymentMethods = {
    // Tiếng Anh thường gặp
    'Cash': 'Tiền mặt',
    'cash': 'Tiền mặt',
    'Bank Transfer': 'Chuyển khoản ngân hàng',
    'bank transfer': 'Chuyển khoản ngân hàng',
    'BankTransfer': 'Chuyển khoản ngân hàng',
    'banktransfer': 'Chuyển khoản ngân hàng',
    'Transfer': 'Chuyển khoản',
    'transfer': 'Chuyển khoản',
    'E-Wallet': 'Ví điện tử',
    'e-wallet': 'Ví điện tử',
    'EWallet': 'Ví điện tử',
    'ewallet': 'Ví điện tử',
    'Digital Wallet': 'Ví điện tử',
    'digital wallet': 'Ví điện tử',
    'Credit Card': 'Thẻ tín dụng',
    'credit card': 'Thẻ tín dụng',
    'CreditCard': 'Thẻ tín dụng',
    'creditcard': 'Thẻ tín dụng',
    'Debit Card': 'Thẻ ghi nợ',
    'debit card': 'Thẻ ghi nợ',
    'DebitCard': 'Thẻ ghi nợ',
    'debitcard': 'Thẻ ghi nợ',
    'VNPay': 'VNPay',
    'vnpay': 'VNPay',
    'VNPAY': 'VNPay',
    'MoMo': 'MoMo',
    'momo': 'MoMo',
    'MOMO': 'MoMo',
    'ZaloPay': 'ZaloPay',
    'zalopay': 'ZaloPay',
    'ZALOPAY': 'ZaloPay',
    'PayPal': 'PayPal',
    'paypal': 'PayPal',
    'PAYPAL': 'PayPal',
    'Other': 'Khác',
    'other': 'Khác',
    // Có thể có từ backend
    'tien_mat': 'Tiền mặt',
    'chuyen_khoan': 'Chuyển khoản ngân hàng',
    'vi_dien_tu': 'Ví điện tử',
    'the_tin_dung': 'Thẻ tín dụng',
    'the_ghi_no': 'Thẻ ghi nợ'
  };
  return paymentMethods[method] || method;
};

const getStatusInVietnamese = (status) => {
  const statuses = {
    'Pending': 'Chờ duyệt',
    'Approved': 'Đã duyệt',
    'Rejected': 'Đã từ chối',
    'Active': 'Hoạt động',
    'Inactive': 'Không hoạt động'
  };
  return statuses[status] || status;
};

const ProxyRegisterList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approveModal, setApproveModal] = useState({ visible: false, id: null });
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  // Proxy shopper không cần ngày hiệu lực và hết hạn

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await proxyShopperRegistrationService.getAll();
      console.log('Dữ liệu proxy shopper registrations:', res);
      // Log để kiểm tra format dữ liệu
      if (res && res.length > 0) {
        console.log('Ví dụ đầu tiên:', res[0]);
        console.log('Transport method:', res[0]?.transportMethod);
        console.log('Payment method:', res[0]?.paymentMethod);
      }
      setData(res);
    } catch (err) {
      message.error('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    setApproveModal({ visible: true, id });
  };

  const submitApprove = async () => {
    try {
      await proxyShopperRegistrationService.approveRegistration(approveModal.id, true);
      message.success('Đã duyệt đăng ký');
      setApproveModal({ visible: false, id: null });
      fetchData();
    } catch (err) {
      let errMsg = 'Duyệt thất bại';
      if (err && err.message) errMsg = err.message;
      message.error(errMsg);
    }
  };

  const handleReject = (id) => {
    setRejectModal({ visible: true, id });
    setRejectReason('');
  };

  const submitReject = async () => {
    if (!rejectReason) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await proxyShopperRegistrationService.approveRegistration(rejectModal.id, false, rejectReason);
      message.success('Đã từ chối đăng ký');
      setRejectModal({ visible: false, id: null });
      setRejectReason('');
      fetchData();
    } catch {
      message.error('Từ chối thất bại');
    }
  };

  const columns = [
    { title: 'Người đăng ký', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Chợ đăng ký', dataIndex: 'marketName', key: 'marketName' },
    // { title: 'Khu vực hoạt động', dataIndex: 'operatingArea', key: 'operatingArea' },
    {
      title: 'Phương tiện',
      dataIndex: 'transportMethod',
      key: 'transportMethod',
      render: (method) => {
        const vietnameseMethod = getTransportMethodInVietnamese(method);
        console.log(`Transport method: ${method} -> ${vietnameseMethod}`);
        return vietnameseMethod;
      }
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const vietnameseMethod = getPaymentMethodInVietnamese(method);
        console.log(`Payment method: ${method} -> ${vietnameseMethod}`);
        return vietnameseMethod;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const vietnameseStatus = getStatusInVietnamese(status);
        const color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange';
        return <Tag color={color}>{vietnameseStatus}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => record.status === 'Pending' && (
        <Space>
          <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>Duyệt</Button>
          <Button danger icon={<CloseOutlined />} onClick={() => handleReject(record.id)}>Từ chối</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>Danh sách đăng ký người đi chợ</h2>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
      {/* Modal duyệt */}
      <Modal
        title="Xác nhận duyệt đăng ký proxy shopper"
        open={approveModal.visible}
        onOk={submitApprove}
        onCancel={() => setApproveModal({ visible: false, id: null })}
      >
        <div>Bạn có chắc chắn muốn duyệt đăng ký này?</div>
      </Modal>
      {/* Modal từ chối */}
      <Modal
        title="Nhập lý do từ chối"
        open={rejectModal.visible}
        onOk={submitReject}
        onCancel={() => setRejectModal({ visible: false, id: null })}
      >
        <div style={{ marginBottom: 8 }}>Lý do từ chối:</div>
        <Input.TextArea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          rows={3}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </div>
  );
};

export default ProxyRegisterList;
