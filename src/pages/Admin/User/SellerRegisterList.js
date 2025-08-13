import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Input, DatePicker, message, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import sellerRegistrationService from '../../../services/sellerRegistrationService';
import marketService from '../../../services/marketService';
import dayjs from 'dayjs';

const SellerRegisterList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState({});
  const [approveModal, setApproveModal] = useState({ visible: false, id: null });
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null });
  const [detailModal, setDetailModal] = useState({ visible: false, record: null });
  const [rejectReason, setRejectReason] = useState('');
  const [licenseEffectiveDate, setLicenseEffectiveDate] = useState(null);
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(null);

  useEffect(() => {
    fetchMarkets();
    fetchData();
  }, []);

  const fetchMarkets = async () => {
    try {
      console.log('Đang tải danh sách chợ...'); // Debug
      const marketRes = await marketService.getAllMarkets(1, 1000); // Lấy tất cả markets
      console.log('Market response:', marketRes); // Debug

      const marketMap = {};
      if (marketRes && marketRes.markets) {
        console.log('Markets found:', marketRes.markets.length); // Debug
        marketRes.markets.forEach(market => {
          marketMap[market.id] = market.name;
          console.log(`Market mapping: ${market.id} -> ${market.name}`); // Debug
        });
      } else if (marketRes && Array.isArray(marketRes)) {
        console.log('Markets array found:', marketRes.length); // Debug
        marketRes.forEach(market => {
          marketMap[market.id] = market.name;
          console.log(`Market mapping: ${market.id} -> ${market.name}`); // Debug
        });
      } else {
        console.log('No markets structure found:', marketRes); // Debug
      }

      console.log('Final market map:', marketMap); // Debug
      setMarkets(marketMap);
    } catch (err) {
      console.error('Không thể tải danh sách chợ:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await sellerRegistrationService.getAll();
      console.log('Seller registrations:', res); // Debug
      if (res && res.length > 0) {
        console.log('First seller registration marketId:', res[0].marketId); // Debug
      }
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
    setLicenseEffectiveDate(dayjs(today));
    setLicenseExpiryDate(dayjs(threeYearsLater));
  };

  const submitApprove = async () => {
    let effective = licenseEffectiveDate;
    let expiry = licenseExpiryDate;
    // Chuyển về kiểu Date nếu là dayjs
    if (effective && effective.$d) effective = effective.$d;
    if (expiry && expiry.$d) expiry = expiry.$d;
    // Chuyển về ISO string
    if (effective) effective = new Date(effective).toISOString();
    if (expiry) expiry = new Date(expiry).toISOString();
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
  };

  const submitReject = async () => {
    if (!rejectReason) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await sellerRegistrationService.approve({
        RegistrationId: rejectModal.id,
        Approve: false,
        RejectionReason: rejectReason
      });
      message.success('Đã từ chối đăng ký');
      setRejectModal({ visible: false, id: null });
      setRejectReason('');
      fetchData();
    } catch {
      message.error('Từ chối thất bại');
    }
  };

  const handleViewDetails = (record) => {
    setDetailModal({ visible: true, record });
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Chờ duyệt';
      case 'Approved':
        return 'Đã duyệt';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Thông tin cơ bản',
      key: 'basicInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.email}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.phoneNumber}</div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Cửa hàng',
      key: 'storeInfo',
      render: (_, record) => {
        const marketName = markets[record.marketId] || 'Không có dữ liệu';
        console.log(`Looking for marketId: ${record.marketId}, found: ${marketName}`); // Debug
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.storeName || 'Chưa có tên'}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{marketName}</div>
          </div>
        );
      },
      width: 180
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange'}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: val => val ? new Date(val).toLocaleDateString() : '',
      width: 120
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'Pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleApprove(record.id)}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleReject(record.id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
      width: 200
    }
  ];

  return (
    <div>
      <h2>Danh sách đăng ký bán hàng</h2>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
        }}
      />

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết đăng ký bán hàng"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null })}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, record: null })}>
            Đóng
          </Button>
        ]}
      >
        {detailModal.record && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Người đăng ký" span={1}>
              {detailModal.record.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={1}>
              {detailModal.record.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại" span={1}>
              {detailModal.record.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Tên cửa hàng" span={1}>
              {detailModal.record.storeName}
            </Descriptions.Item>
            <Descriptions.Item label="Chợ đăng ký" span={1}>
              {markets[detailModal.record.marketId] || 'Không có dữ liệu'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ cửa hàng" span={1}>
              {detailModal.record.storeAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Giấy phép kinh doanh" span={2}>
              {detailModal.record.businessLicense ? (
                <a href={detailModal.record.businessLicense} target="_blank" rel="noopener noreferrer">
                  Xem giấy phép
                </a>
              ) : 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hiệu lực" span={1}>
              {detailModal.record.licenseEffectiveDate ?
                new Date(detailModal.record.licenseEffectiveDate).toLocaleDateString() :
                'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn" span={1}>
              {detailModal.record.licenseExpiryDate ?
                new Date(detailModal.record.licenseExpiryDate).toLocaleDateString() :
                'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={detailModal.record.status === 'Approved' ? 'green' :
                detailModal.record.status === 'Rejected' ? 'red' : 'orange'}>
                {getStatusText(detailModal.record.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {detailModal.record.createdAt ?
                new Date(detailModal.record.createdAt).toLocaleString() : ''}
            </Descriptions.Item>
            {detailModal.record.rejectionReason && (
              <Descriptions.Item label="Lý do từ chối" span={2}>
                <div style={{ color: 'red' }}>
                  {detailModal.record.rejectionReason}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

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

export default SellerRegisterList;
