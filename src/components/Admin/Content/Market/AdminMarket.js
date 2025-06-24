import React, { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Form,
  message,
} from "antd";
import { BiBlock, BiCheckShield } from "react-icons/bi";
import { FaStoreAlt, FaPlus } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";

const mockMarketsInit = [
  {
    _id: "1",
    market_name: "Chợ Cái Khế",
    address: "01 Trần Văn Khéo, Ninh Kiều, Cần Thơ",
    stalls_count: 150,
    is_locked: false,
  },
  {
    _id: "2",
    market_name: "Chợ Xuân Khánh",
    address: "Đường 30/4, Ninh Kiều, Cần Thơ",
    stalls_count: 90,
    is_locked: true,
  },
  {
    _id: "3",
    market_name: "Chợ Phong Điền",
    address: "TT. Phong Điền, Cần Thơ",
    stalls_count: 60,
    is_locked: false,
  },
];

const MarketManagementComponent = () => {
  const [markets, setMarkets] = useState(mockMarketsInit);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const handleLockToggle = (marketId, isCurrentlyLocked) => {
    Modal.confirm({
      title: isCurrentlyLocked ? "Xác nhận mở khóa" : "Xác nhận khóa chợ",
      content: isCurrentlyLocked
        ? "Bạn có chắc muốn mở khóa chợ này không?"
        : "Bạn có chắc muốn khóa chợ này không?",
      onOk: () => {
        setMarkets((prev) =>
          prev.map((m) =>
            m._id === marketId ? { ...m, is_locked: !isCurrentlyLocked } : m
          )
        );
      },
    });
  };

  const handleCreateMarket = (values) => {
    const newMarket = {
      _id: `${Date.now()}`,
      ...values,
      is_locked: false,
    };
    setMarkets((prev) => [...prev, newMarket]);
    setIsCreateModalOpen(false);
    form.resetFields();
    message.success("Tạo chợ mới thành công!");
  };

  const filteredMarkets = markets.filter((m) =>
    m.market_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tên chợ",
      dataIndex: "market_name",
      key: "market_name",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Số lượng sạp",
      dataIndex: "stalls_count",
      key: "stalls_count",
    },
    {
      title: "Tình trạng",
      dataIndex: "is_locked",
      key: "status",
      render: (isLocked) => (
        <Tag
          color={isLocked ? "red" : "green"}
          style={{ fontWeight: "bold", padding: "4px 10px" }}
        >
          {isLocked ? "Bị khóa" : "Hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      render: (_, record) => (
        <Button
          type={record.is_locked ? "default" : "primary"}
          danger={record.is_locked}
          icon={record.is_locked ? <BiCheckShield /> : <BiBlock />}
          onClick={() => handleLockToggle(record._id, record.is_locked)}
        >
          {record.is_locked ? "Mở khóa" : "Khóa"}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaStoreAlt size={28} style={{ color: "#1890ff" }} />
          <h2 style={{ color: "#1890ff", margin: 0 }}>Quản lý chợ</h2>
        </div>

        <Space>
          <Input
            allowClear
            placeholder="Tìm tên chợ..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo chợ mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMarkets}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Tạo chợ mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateMarket}>
          <Form.Item
            label="Tên chợ"
            name="market_name"
            rules={[{ required: true, message: "Vui lòng nhập tên chợ" }]}
          >
            <Input placeholder="Nhập tên chợ..." />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input placeholder="Nhập địa chỉ..." />
          </Form.Item>

          <Form.Item
            label="Số lượng sạp"
            name="stalls_count"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng sạp" },
              {
                type: "number",
                min: 1,
                message: "Số lượng sạp phải là số nguyên dương",
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input type="number" placeholder="VD: 100" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo chợ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MarketManagementComponent;
