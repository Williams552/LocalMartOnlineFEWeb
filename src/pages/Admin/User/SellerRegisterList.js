import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Input, DatePicker, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import sellerRegistrationService from '../../../services/sellerRegistrationService';

const SellerRegisterList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approveModal, setApproveModal] = useState({ visible: false, id: null });
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [licenseEffectiveDate, setLicenseEffectiveDate] = useState(null);
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await sellerRegistrationService.getAll();
      setData(res);
    } catch (err) {
      message.error('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    const today = new Date();
    const threeYearsLater = new Date(today);
    threeYearsLater.setFullYear(today.getFullYear() + 3);
    setApproveModal({ visible: true, id });
    setLicenseEffectiveDate(today);
    setLicenseExpiryDate(threeYearsLater);
  };

  const submitApprove = async () => {
    let effective = licenseEffectiveDate;
    let expiry = licenseExpiryDate;
    if (!effective) {
      effective = new Date();
    } else if (effective.$d) {
      effective = effective.$d;
    }
    if (!expiry) {
      expiry = new Date(effective);
      expiry.setFullYear(expiry.getFullYear() + 3);
    } else if (expiry.$d) {
      expiry = expiry.$d;
    }
    try {
      await sellerRegistrationService.approve({
        RegistrationId: approveModal.id,
        Approve: true,
        LicenseEffectiveDate: effective,
        LicenseExpiryDate: expiry
      });
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
    setLicenseEffectiveDate(null);
    setLicenseExpiryDate(null);
  };

  const submitReject = async () => {
    if (!rejectReason) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    if (!licenseEffectiveDate || !licenseExpiryDate) {
      message.warning('Vui lòng nhập ngày hiệu lực và hết hạn');
      return;
    }
    try {
      await sellerRegistrationService.approve({
        RegistrationId: rejectModal.id,
        Approve: false,
        RejectionReason: rejectReason,
        LicenseEffectiveDate: licenseEffectiveDate,
        LicenseExpiryDate: licenseExpiryDate
      });
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
    { title: 'Tên cửa hàng', dataIndex: 'storeName', key: 'storeName' },
    { title: 'Địa chỉ', dataIndex: 'storeAddress', key: 'storeAddress' },
    { title: 'Chợ', dataIndex: 'marketName', key: 'marketName' },
    { title: 'Giấy phép', dataIndex: 'businessLicense', key: 'businessLicense', render: (val) => val ? <a href={val} target="_blank" rel="noopener noreferrer">Xem</a> : 'Chưa có' },
    { title: 'Hiệu lực', dataIndex: 'licenseEffectiveDate', key: 'licenseEffectiveDate', render: val => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Hết hạn', dataIndex: 'licenseExpiryDate', key: 'licenseExpiryDate', render: val => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange'}>{status}</Tag> },
    { title: 'Lý do từ chối', dataIndex: 'rejectionReason', key: 'rejectionReason' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: val => val ? new Date(val).toLocaleString() : '' },
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
      <h2>Danh sách đăng ký bán hàng</h2>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
      {/* Modal duyệt */}
      <Modal
        title="Nhập ngày hiệu lực và hết hạn giấy phép"
        open={approveModal.visible}
        onOk={submitApprove}
        onCancel={() => setApproveModal({ visible: false, id: null })}
      >
        <div style={{ marginBottom: 8 }}>Ngày hiệu lực:</div>
        <DatePicker
          style={{ width: '100%', marginBottom: 16 }}
          value={licenseEffectiveDate}
          onChange={setLicenseEffectiveDate}
          format="DD/MM/YYYY"
        />
        <div style={{ marginBottom: 8 }}>Ngày hết hạn:</div>
        <DatePicker
          style={{ width: '100%' }}
          value={licenseExpiryDate}
          onChange={setLicenseExpiryDate}
          format="DD/MM/YYYY"
        />
      </Modal>
      {/* Modal từ chối */}
      <Modal
        title="Nhập lý do từ chối và ngày hiệu lực/hết hạn"
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
          style={{ marginBottom: 16 }}
        />
        <div style={{ marginBottom: 8 }}>Ngày hiệu lực:</div>
        <DatePicker
          style={{ width: '100%', marginBottom: 16 }}
          value={licenseEffectiveDate}
          onChange={setLicenseEffectiveDate}
          format="DD/MM/YYYY"
        />
        <div style={{ marginBottom: 8 }}>Ngày hết hạn:</div>
        <DatePicker
          style={{ width: '100%' }}
          value={licenseExpiryDate}
          onChange={setLicenseExpiryDate}
          format="DD/MM/YYYY"
        />
      </Modal>
    </div>
  );
};

export default SellerRegisterList;
