import React, { useState } from "react";
import { Button, Select, Table, Tag } from "antd";
import { FaStore } from "react-icons/fa";
import { BiBlock, BiCheckShield } from "react-icons/bi";

// Danh sách chợ mẫu
const mockMarkets = [
  { id: "1", name: "Chợ Cái Khế" },
  { id: "2", name: "Chợ Xuân Khánh" },
];

// Danh sách sạp mẫu
const mockStalls = [
  {
    _id: "s1",
    market_id: "1",
    name: "Sạp Thịt Bò A",
    owner: "Nguyễn Văn A",
    phone: "0901111111",
    address: "Lô A12, dãy 1, Chợ Cái Khế",
    is_active: true,
  },
  {
    _id: "s2",
    market_id: "1",
    name: "Sạp Rau Củ B",
    owner: "Trần Thị B",
    phone: "0902222222",
    address: "Lô B5, dãy 2, Chợ Cái Khế",
    is_active: false,
  },
  {
    _id: "s3",
    market_id: "2",
    name: "Sạp Hải Sản C",
    owner: "Lê Văn C",
    phone: "0903333333",
    address: "Lô C3, dãy 3, Chợ Xuân Khánh",
    is_active: true,
  },
];

const StallManagementComponent = () => {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [stalls, setStalls] = useState(mockStalls);

  const handleToggleStall = (stallId, currentStatus) => {
    const updated = stalls.map((s) =>
      s._id === stallId ? { ...s, is_active: !currentStatus } : s
    );
    setStalls(updated);
  };

  const filteredStalls = stalls.filter(
    (s) => s.market_id === selectedMarket
  );

  const columns = [
    {
      title: "Tên sạp",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Chủ sạp",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Địa chỉ sạp",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "status",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      render: (_, record) => (
        <Button
          type={record.is_active ? "default" : "primary"}
          danger={record.is_active}
          icon={record.is_active ? <BiBlock /> : <BiCheckShield />}
          onClick={() => handleToggleStall(record._id, record.is_active)}
        >
          {record.is_active ? "Tạm ngưng" : "Mở lại"}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Tiêu đề trên bên trái */}
      <div className="flex items-center gap-2 mb-6">
        <FaStore size={24} style={{ color: "#1890ff" }} />
        <h2 style={{ margin: 0, color: "#1890ff" }}>Quản lý sạp</h2>
      </div>

      {/* Dropdown chọn chợ nằm chính giữa */}
      <div className="flex justify-center mb-6">
        <Select
          value={selectedMarket}
          onChange={setSelectedMarket}
          placeholder="Chọn chợ để hiển thị sạp"
          style={{ width: 300 }}
          options={mockMarkets.map((m) => ({
            label: m.name,
            value: m.id,
          }))}
        />
      </div>

      {/* Bảng danh sách sạp */}
      {selectedMarket ? (
        <Table
          columns={columns}
          dataSource={filteredStalls}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <div style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
          <p>Vui lòng chọn một chợ để hiển thị danh sách sạp.</p>
        </div>
      )}
    </div>
  );
};

export default StallManagementComponent;
