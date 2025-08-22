import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Typography, Divider, Select } from "antd";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);
const { Title } = Typography;

const StoreAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marketList, setMarketList] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(null);

  useEffect(() => {
    fetchAllMarkets();
  }, []);

  useEffect(() => {
    if (selectedMarketId) {
      fetchStats(selectedMarketId);
    }
  }, [selectedMarketId]);

  // Lấy danh sách tất cả chợ
  const fetchAllMarkets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5183/api/store/statistics");
      if (res.data && res.data.success && res.data.data && res.data.data.marketNames) {
        const markets = Object.entries(res.data.data.marketNames).map(([id, name]) => ({ value: id, label: name }));
        setMarketList(markets);
        // Chọn chợ đầu tiên mặc định
        if (markets.length > 0) setSelectedMarketId(markets[0].value);
      }
    } catch (err) {
      // Xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  // Lấy thống kê theo chợ
  const fetchStats = async (marketId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5183/api/store/statistics?marketId=${marketId}`);
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      // Xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  // Chart hiệu suất cửa hàng
  let performanceBarData = {};
  if (stats) {
    performanceBarData = {
      labels: Object.keys(stats.storePerformanceTiers || {}),
      datasets: [{
        label: "Số lượng cửa hàng",
        data: Object.values(stats.storePerformanceTiers || {}),
        backgroundColor: "#1890ff"
      }]
    };
  }
  // Chart tăng trưởng
  let growthLineData = {};
  if (stats) {
    // growthTrends: { 'YYYY-MM-DD': số lượng }
    const trendEntries = Object.entries(stats.growthTrends || {});
    // Sắp xếp theo ngày tăng dần
    trendEntries.sort(([a], [b]) => new Date(a) - new Date(b));
    const labels = trendEntries.map(([date]) => date);
    const data = trendEntries.map(([, value]) => value);
    growthLineData = {
      labels,
      datasets: [{
        label: "Số lượng cửa hàng mới theo ngày",
        data,
        borderColor: "#faad14",
        backgroundColor: "#faad14",
        fill: false,
        tension: 0.2
      }]
    };
  }

  // Bảng chi tiết cửa hàng với tên cửa hàng và tên chợ
  const storeIds = stats ? Object.keys(stats.revenuePerStore || {}) : [];
  const tableData = storeIds.map(id => ({
    key: id,
    storeId: id,
    storeName: stats.storeNames?.[id] || "(Không rõ)",
    revenue: stats.revenuePerStore[id],
    rating: stats.storePerformanceRanking[id],
    products: stats.productCatalogSize[id],
    engagement: stats.customerEngagement[id],
    // Tìm tên chợ cho cửa hàng này (nếu có mapping storeId -> marketId, cần cập nhật logic)
    marketName: (() => {
      // Nếu có mapping storeId -> marketId, dùng nó. Nếu không, lấy marketId từ stats.marketId
      if (stats.marketId && stats.marketNames) {
        return stats.marketNames[stats.marketId] || "(Không rõ)";
      }
      // Nếu không có marketId, trả về rỗng
      return "";
    })()
  }));
  const columns = [
    // { title: "ID cửa hàng", dataIndex: "storeId", key: "storeId" }, // Ẩn cột ID cửa hàng
    { title: "Tên cửa hàng", dataIndex: "storeName", key: "storeName" },
    // { title: "Tên chợ", dataIndex: "marketName", key: "marketName" }, // Bỏ cột tên chợ
    { title: "Doanh thu", dataIndex: "revenue", key: "revenue", render: val => Math.round(val).toLocaleString("vi-VN") + "đ" },
    { title: "Điểm đánh giá", dataIndex: "rating", key: "rating" },
    { title: "Số sản phẩm", dataIndex: "products", key: "products" },
    { title: "Tương tác khách hàng", dataIndex: "engagement", key: "engagement" }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Title level={2} style={{ marginBottom: 0 }}>
            Thống kê cửa hàng
          </Title>
        </Col>
        <Col>
          <Select
            style={{ minWidth: 220 }}
            value={selectedMarketId}
            onChange={setSelectedMarketId}
            options={marketList}
            placeholder="Chọn chợ"
            loading={loading}
          />
        </Col>
      </Row>
      {stats && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Tổng số cửa hàng" value={stats.totalStoreCount} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Cửa hàng đang mở" value={stats.storesByStatus?.Open || 0} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Cửa hàng tạm ngưng" value={stats.storesByStatus?.Suspended || 0} valueStyle={{ color: '#ff4d4f' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Điểm đánh giá TB" value={stats.averageStoreRating} valueStyle={{ color: '#faad14' }} />
              </Card>
            </Col>
          </Row>
          <Divider orientation="left">Hiệu suất cửa hàng</Divider>
          <Card style={{ marginBottom: 24 }}>
            <Bar data={performanceBarData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={180} />
          </Card>
          <Divider orientation="left">Tăng trưởng cửa hàng mới</Divider>
          <Card style={{ marginBottom: 24 }}>
            <Line data={growthLineData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={180} />
          </Card>
          <Divider orientation="left">Chi tiết cửa hàng</Divider>
          <Table columns={columns} dataSource={tableData} loading={loading} pagination={{ pageSize: 5 }} />
        </>
      )}
    </div>
  );
};

export default StoreAnalytics;
