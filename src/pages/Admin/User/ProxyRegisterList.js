import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Table, Tag, Button, Space, Modal, Input, DatePicker, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import proxyShopperRegistrationService from '../../../services/proxyShopperRegistrationService';

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
    { title: 'Khu vực hoạt động', dataIndex: 'operatingArea', key: 'operatingArea' },
    { title: 'Phương tiện', dataIndex: 'transportMethod', key: 'transportMethod' },
    { title: 'Phương thức thanh toán', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange'}>{status}</Tag> },
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
      <h2>Danh sách đăng ký proxy shopper</h2>
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
