import React from "react";
import { Card, Statistic, Table, Button, DatePicker, Tabs } from "antd";
import { Bar } from "react-chartjs-2";
import {
  FilePdfOutlined,
  FileExcelOutlined,
  AreaChartOutlined,
  WarningOutlined,
  ShopOutlined,
  DollarCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { RangePicker } = DatePicker;

const statistics = [
  { title: "Tổng doanh thu", value: "120,000,000₫", icon: <DollarCircleOutlined /> },
  { title: "Số lượng người bán", value: 320, icon: <UserOutlined /> },
  { title: "Sạp vi phạm", value: 5, icon: <WarningOutlined /> },
  { title: "Tổng số sạp", value: 88, icon: <ShopOutlined /> },
];

const columns = [
  {
    title: "Tên Chợ",
    dataIndex: "market",
    key: "market",
  },
  {
    title: "Doanh thu",
    dataIndex: "revenue",
    key: "revenue",
  },
  {
    title: "Số sạp",
    dataIndex: "stalls",
    key: "stalls",
  },
  {
    title: "Sạp bị cảnh báo",
    dataIndex: "violations",
    key: "violations",
  },
];

const data = [
  {
    key: "1",
    market: "Chợ Bến Thành",
    revenue: "45,000,000₫",
    stalls: 35,
    violations: 2,
  },
  {
    key: "2",
    market: "Chợ Hạnh Thông Tây",
    revenue: "33,000,000₫",
    stalls: 28,
    violations: 1,
  },
];

const chartData = {
  labels: ["Chợ Bến Thành", "Chợ Hạnh Thông Tây"],
  datasets: [
    {
      label: "Doanh thu",
      data: [45000000, 33000000],
    },
  ],
};

const AdminDashboardStatistics = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statistics.map((stat, index) => (
          <Card key={index}>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.icon}
            />
          </Card>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Biểu đồ doanh thu theo chợ</h2>
          <RangePicker />
        </div>
        <Bar data={chartData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chi tiết doanh thu từng chợ</h2>
          <div className="space-x-2">
            <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>
            <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
          </div>
        </div>
        <Table columns={columns} dataSource={data} pagination={false} />
      </div>
    </div>
  );
};

export default AdminDashboardStatistics;
