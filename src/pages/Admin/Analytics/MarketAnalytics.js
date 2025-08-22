import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Collapse, Typography, Space, Divider } from "antd";
import { ShopOutlined, CheckCircleOutlined, CloseCircleOutlined, AppstoreOutlined, UserOutlined, DollarCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import './MarketAnalytics.css'; // Add a CSS file for custom styling
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MarketAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5183/api/market/statistics?year=2025");
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      // Xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    const key = record.marketId;
    setExpandedRowKeys((prevKeys) =>
      prevKeys.includes(key) ? prevKeys.filter((k) => k !== key) : [...prevKeys, key]
    );
  };

  const columns = [
  { title: "Tên chợ", dataIndex: "marketName", key: "marketName" },
  { title: "Trạng thái", dataIndex: "status", key: "status", render: status => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag> },
  { title: "Số cửa hàng", dataIndex: "storeCount", key: "storeCount" },
  { title: "Số người bán", dataIndex: "sellerCount", key: "sellerCount" },
  { title: "Tổng doanh thu", dataIndex: "totalRevenue", key: "totalRevenue", render: val => Math.round(val).toLocaleString("vi-VN") + "đ" },
  { title: "Số đơn hàng", dataIndex: "orderCount", key: "orderCount" },
  { title: "Doanh thu TB/cửa hàng", dataIndex: "averageStoreRevenue", key: "averageStoreRevenue", render: val => Math.round(val).toLocaleString("vi-VN") + "đ" },
  { title: "Đơn hàng TB/cửa hàng", dataIndex: "averageOrdersPerStore", key: "averageOrdersPerStore", render: val => typeof val === 'number' ? val.toFixed(2) : val }
  ];

  // Chart data
  let barData = {}, pieData = {}, top5BarData = {}, pieOrderData = {};
  if (stats) {
  const labels = stats.marketStatistics.map(m => m.marketName);
  const revenues = stats.marketStatistics.map(m => m.totalRevenue);
  const orders = stats.marketStatistics.map(m => m.orderCount);
    // Bar chart: doanh thu từng chợ
    barData = {
      labels,
      datasets: [{
        label: "Doanh thu từng chợ",
        data: revenues,
        backgroundColor: "#1890ff"
      }]
    };
    // Pie chart: tỷ lệ chợ hoạt động/đã đóng
    pieData = {
      labels: ["Đang hoạt động", "Đã đóng"],
      datasets: [{
        data: [stats.activeMarkets, stats.closedMarkets],
        backgroundColor: ["#52c41a", "#ff4d4f"]
      }]
    };
    // Bar chart: top 5 chợ doanh thu cao nhất
    const top5 = [...stats.marketStatistics].sort((a,b) => b.totalRevenue - a.totalRevenue).slice(0,5);
    top5BarData = {
      labels: top5.map(m => m.marketName),
      datasets: [{
        label: "Top 5 chợ doanh thu cao nhất",
        data: top5.map(m => m.totalRevenue),
        backgroundColor: "#faad14"
      }]
    };
    // Pie chart: tỷ lệ đơn hàng từng chợ (top 5 + Khác)
    const sortedMarkets = stats.marketStatistics.slice().sort((a,b) => b.orderCount - a.orderCount);
    const top5Markets = sortedMarkets.slice(0,5);
    const otherMarkets = sortedMarkets.slice(5);
    const top5Labels = top5Markets.map(m => m.marketName);
    const top5Orders = top5Markets.map(m => m.orderCount);
    const otherOrders = otherMarkets.reduce((sum, m) => sum + m.orderCount, 0);
    const pieLabels = otherOrders > 0 ? [...top5Labels, 'Khác'] : top5Labels;
    const pieDataArr = otherOrders > 0 ? [...top5Orders, otherOrders] : top5Orders;
    const pieColors = ["#1890ff", "#52c41a", "#faad14", "#ff4d4f", "#13c2c2", "#eb2f96"];
    // Tính phần trăm
    const totalOrders = pieDataArr.reduce((a,b) => a+b, 0);
  const piePercentArr = pieDataArr.map(v => totalOrders ? +(v/totalOrders*100).toFixed(2) : 0);
    // Tooltip custom
    const otherMarketNames = otherMarkets.map(m => m.marketName).join(', ');
    pieOrderData = {
      labels: pieLabels,
      datasets: [{
        data: piePercentArr,
        backgroundColor: pieColors.slice(0, pieLabels.length)
      }],
      // Custom tooltip
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                if (label === 'Khác' && otherMarketNames) {
                  return `${label}: ${value}%\n(${otherMarketNames})`;
                }
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    };
  }

  return (
    <div style={{ padding: 24, background: '#f4f6fa', minHeight: '100vh' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        <ShopOutlined style={{ color: '#1890ff', marginRight: 12 }} /> Thống kê chợ
      </Title>
      {stats && (
        <>
          {/* 2 hàng 2 cột chart */}
          <Row gutter={[24,24]} style={{ marginBottom: 32 }} justify="center">
            <Col xs={24} md={12}>
              <Card title="Doanh thu từng chợ" style={{ minHeight: 270, padding: 8 }}>
                <div style={{ height: 250, width: '100%' }}>
                  <Bar data={barData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={250} />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Tỷ lệ chợ hoạt động/đã đóng" style={{ minHeight: 270, padding: 8 }}>
                <div style={{ height: 250, width: '100%' }}>
                  <Pie data={pieData} options={{ maintainAspectRatio: false }} height={250} />
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[24,24]} style={{ marginBottom: 32 }} justify="center">
            <Col xs={24} md={12}>
              <Card title="Top 5 chợ doanh thu cao nhất" style={{ minHeight: 270, padding: 8 }}>
                <div style={{ height: 250, width: '100%' }}>
                  <Bar data={top5BarData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={250} />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Tỷ lệ đơn hàng từng chợ" style={{ minHeight: 270, padding: 8 }}>
                <div style={{ height: 250, width: '100%' }}>
                  <Pie data={pieOrderData} options={{ ...pieOrderData.options, maintainAspectRatio: false }} height={250} />
                </div>
              </Card>
            </Col>
          </Row>
          <Divider orientation="left" style={{ fontSize: 18, color: '#1890ff' }}>Danh sách chợ</Divider>
          <Table
            columns={columns}
            dataSource={stats.marketStatistics}
            rowKey="marketId"
            loading={loading}
            bordered
            pagination={{ pageSize: 8 }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: 'clickable-row'
            })}
            rowClassName={() => 'market-analytics-row'}
            expandedRowKeys={expandedRowKeys}
            expandable={{
              expandedRowRender: record => (
                <Collapse style={{ background: '#fff' }}>
                  <Panel header={<span><AppstoreOutlined /> Danh sách cửa hàng</span>} key="stores">
                    {record.marketStores.length > 0 ? (
                      <ul style={{ paddingLeft: 20 }}>
                        {record.marketStores.map(store => (
                          <li key={store.storeId} style={{ marginBottom: 6 }}>
                            <ShopOutlined style={{ color: '#1890ff' }} /> <b>{store.storeName}</b> <Tag color={store.status === "Open" ? "green" : "orange"}>{store.status}</Tag>
                          </li>
                        ))}
                      </ul>
                    ) : <Text type="secondary">Không có cửa hàng</Text>}
                  </Panel>
                  <Panel header={<span><ShoppingCartOutlined /> Danh sách đơn hàng</span>} key="orders">
                    {record.marketOrders.length > 0 ? (
                      <ul style={{ paddingLeft: 20 }}>
                        {record.marketOrders.map(order => (
                          <li key={order.orderId} style={{ marginBottom: 6 }}>
                            <DollarCircleOutlined style={{ color: '#faad14' }} /> Đơn <b>#{order.orderId}</b>: <b style={{ color: '#1890ff' }}>{order.amount.toLocaleString("vi-VN")}đ</b>
                          </li>
                        ))}
                      </ul>
                    ) : <Text type="secondary">Không có đơn hàng</Text>}
                  </Panel>
                </Collapse>
              )
            }}
          />
        </>
      )}
    </div>
  );
};

export default MarketAnalytics;