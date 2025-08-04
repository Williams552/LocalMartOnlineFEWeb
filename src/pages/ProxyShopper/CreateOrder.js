import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiSearch, FiUser, FiMapPin, FiPackage, FiPhone } from 'react-icons/fi';

const CreateOrder = () => {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState([]);
    const [searchQuantities, setSearchQuantities] = useState({});
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [proxyFee, setProxyFee] = useState(0);
    const [note, setNote] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [sendSuccess, setSendSuccess] = useState("");

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5183/api/ProxyShopper/requests/${id}`, {
            headers: {
                "Authorization": token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json"
            },
        });
        if (res.ok) {
            const requestData = await res.json();
            console.log('Request data with market info:', requestData); // Debug log
            console.log('ProxyOrderId for proposal:', requestData.proxyOrderId); // Debug proxyOrderId
            setRequest(requestData);
        }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        // Gọi API tìm kiếm sản phẩm cho proxy shopper với thông tin market
        const token = localStorage.getItem("token");
        let searchUrl = `http://localhost:5183/api/ProxyShopper/products/advanced-search?query=${encodeURIComponent(search)}`;
        
        // Nếu có marketId trong request, thêm vào query để lọc sản phẩm theo chợ
        if (request?.marketId) {
            searchUrl += `&marketId=${request.marketId}`;
        }
        
        const res = await fetch(searchUrl, {
            headers: {
                "Authorization": token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json"
            },
        });
        if (res.ok) {
            const productsData = await res.json();
            console.log('Products data:', productsData); // Debug log
            setProducts(productsData);
        }
    };

    const handleSelect = (product, quantity) => {
        setSelected(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.map(p => p.id === product.id ? { ...p, quantity } : p);
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const handleSendProposal = async () => {
        setSending(true);
        setSendError("");
        setSendSuccess("");
        const token = localStorage.getItem("token");
        const body = {
            items: selected.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unitName || item.unit || "",
                price: item.price || 0
            })),
            TotalProductPrice: selected.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0),
            proxyFee: Number(proxyFee),
            note,
            // Bao gồm marketId nếu có trong request
            ...(request?.marketId && { marketId: request.marketId })
        };
        
        console.log('Sending proposal with body:', body); // Debug log
        
        // Sử dụng proxyOrderId từ request data thay vì id từ params
        const proposalId = request.proxyOrderId || id;
        console.log('Using proposalId:', proposalId); // Debug log
        
        try {
            const res = await fetch(`http://localhost:5183/api/ProxyShopper/orders/${proposalId}/proposal`, {
                method: "POST",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setSendSuccess("Gửi đề xuất thành công!");
                setShowProposalModal(false);
                // Có thể redirect về trang orders sau khi gửi thành công
                setTimeout(() => {
                    window.location.href = '/proxy-shopper/orders';
                }, 2000);
            } else {
                const err = await res.json().catch(() => ({}));
                setSendError(err.message || "Gửi đề xuất thất bại.");
            }
        } catch (e) {
            setSendError("Gửi đề xuất thất bại.");
        }
        setSending(false);
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!request) return <div className="p-8 text-center text-red-600">Không tìm thấy yêu cầu đơn hàng.</div>;
    
    // Validation: Đảm bảo request có thông tin Market và proxyOrderId
    if (!request.marketId) {
        return (
            <div className="p-8 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">Thiếu thông tin chợ</h3>
                    <p className="text-yellow-700">
                        Yêu cầu này không có thông tin chợ cụ thể. Đây có thể là dữ liệu cũ hoặc có lỗi xảy ra.
                        Vui lòng liên hệ hỗ trợ hoặc quay lại danh sách đơn hàng.
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!request.proxyOrderId) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Thiếu thông tin đơn hàng</h3>
                    <p className="text-red-700">
                        Yêu cầu này không có ProxyOrderId. Không thể tạo đề xuất.
                        Vui lòng liên hệ hỗ trợ hoặc quay lại danh sách đơn hàng.
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Thông tin request khách hàng */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-2 text-supply-primary flex items-center"><FiUser className="mr-2" /> Yêu cầu của khách hàng</h2>
                
                {/* Thông tin chợ */}
                {request.marketName && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Chợ được yêu cầu</h4>
                        <div className="flex items-center text-blue-700">
                            <FiMapPin className="mr-1" size={16} />
                            <span className="font-semibold">{request.marketName}</span>
                            {request.marketId && (
                                <span className="ml-2 text-xs text-blue-600">(ID: {request.marketId})</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-2 flex flex-wrap gap-4">
                    <div className="flex items-center text-gray-700"><FiUser className="mr-1" /> {request.buyerName}</div>
                    <div className="flex items-center text-gray-700"><FiPhone className="mr-1" /> {request.buyerPhone}</div>
                    <div className="flex items-center text-gray-700"><FiMapPin className="mr-1" /> {request.deliveryAddress}</div>
                </div>
                <div className="mb-2">
                    <span className="font-medium text-lg">Sản phẩm khách yêu cầu:</span>
                    <div className="overflow-x-auto mt-2">
                        <table className="min-w-[350px] w-full border text-lg">
                            <thead>
                                <tr className="bg-supply-primary text-white">
                                    <th className="py-2 px-4 text-left">Tên sản phẩm</th>
                                    <th className="py-2 px-4 text-left">Số lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.items?.map((item, idx) => (
                                    <tr key={idx} className="border-b hover:bg-supply-primary/10 group transition">
                                        <td className="py-3 px-4 font-semibold text-xl align-top">
                                            <div className="flex items-center gap-2">
                                                <span>{item.name}</span>
                                                <button
                                                    type="button"
                                                    className="text-supply-primary opacity-60 hover:opacity-100 text-base"
                                                    title="Copy tên sản phẩm"
                                                    onClick={() => navigator.clipboard.writeText(item.name)}
                                                >📋</button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-xl align-top">
                                            <div className="flex items-center gap-2">
                                                <span>{item.quantity} {item.unit}</span>
                                                <button
                                                    type="button"
                                                    className="text-supply-primary opacity-60 hover:opacity-100 text-base"
                                                    title="Copy số lượng"
                                                    onClick={() => navigator.clipboard.writeText(`${item.quantity} ${item.unit}`)}
                                                >📋</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-2 text-sm text-gray-500">Bạn có thể bấm vào biểu tượng 📋 để copy tên hoặc số lượng sản phẩm.</div>
                    </div>
                </div>
            </div>

            {/* Thanh tìm kiếm sản phẩm */}
            <form onSubmit={handleSearch} className="flex mb-4 gap-2">
                <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-supply-primary"
                    placeholder="Tìm sản phẩm trong chợ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="px-4 py-2 bg-supply-primary text-white rounded flex items-center gap-1"><FiSearch /> Tìm kiếm</button>
            </form>

            {/* Danh sách sản phẩm tìm được */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
                <h3 className="font-semibold mb-2 flex items-center"><FiPackage className="mr-2" />Sản phẩm tìm kiếm</h3>
                {products.length === 0 ? (
                    <div className="text-gray-500">Chưa có sản phẩm nào.</div>
                ) : (
                    <div className="space-y-3">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center justify-between border-b py-3 hover:bg-gray-50">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{product.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-semibold text-green-600">{product.price?.toLocaleString()} đ</span>
                                        <span className="mx-2">•</span>
                                        <span>Cửa hàng: {product.storeName || product.marketName}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span>⭐ {product.sellerReputation}</span>
                                        <span className="mx-2">•</span>
                                        <span>Đã bán: {product.purchaseCount}</span>
                                        <span className="mx-2">•</span>
                                        <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                                            {product.inStock ? "Còn hàng" : "Hết hàng"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <input
                                        type="number"
                                        min={0.1}
                                        step={0.1}
                                        className="w-20 border rounded px-2 py-1"
                                        placeholder="Số lượng"
                                        value={selected.find(p => p.id === product.id)?.quantity || ''}
                                        onChange={e => handleSelect(product, parseFloat(e.target.value) || 0)}
                                        disabled={!product.inStock}
                                    />
                                    <button
                                        type="button"
                                        className={`px-3 py-1 rounded ${
                                            product.inStock 
                                                ? "bg-green-500 text-white hover:bg-green-600" 
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                        onClick={() => handleSelect(product, selected.find(p => p.id === product.id)?.quantity || 1)}
                                        disabled={!product.inStock}
                                    >
                                        {product.inStock ? "Chọn" : "Hết hàng"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Danh sách sản phẩm đã chọn */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4 text-lg">Sản phẩm sẽ mua</h3>
                {selected.length === 0 ? (
                    <div className="text-gray-500">Chưa chọn sản phẩm nào.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-lg">
                            <thead>
                                <tr className="bg-supply-primary text-white">
                                    <th className="py-2 px-4 text-left">Tên sản phẩm</th>
                                    <th className="py-2 px-4 text-left">Số lượng</th>
                                    <th className="py-2 px-4 text-left">Đơn giá</th>
                                    <th className="py-2 px-4 text-left">Thành tiền</th>
                                    <th className="py-2 px-4 text-left">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selected.map((item, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="py-2 px-4 font-semibold">{item.name}</td>
                                        <td className="py-2 px-4">
                                            <input
                                                type="number"
                                                min={0.1}
                                                step={0.1}
                                                className="w-20 border rounded px-2 py-1 text-lg"
                                                value={item.quantity}
                                                onChange={e => handleSelect(item, parseFloat(e.target.value) || 0)}
                                            />
                                            {item.unitName && <span className="ml-1 text-sm text-gray-500">{item.unitName}</span>}
                                        </td>
                                        <td className="py-2 px-4 text-green-600 font-semibold">
                                            {item.price?.toLocaleString()} đ
                                            {item.unitName && <span className="text-sm text-gray-500">/{item.unitName}</span>}
                                        </td>
                                        <td className="py-2 px-4 text-green-600 font-semibold">
                                            {((item.price || 0) * item.quantity).toLocaleString()} đ
                                        </td>
                                        <td className="py-2 px-4">
                                            <button
                                                className="px-3 py-1 bg-red-500 text-white rounded mr-2"
                                                onClick={() => setSelected(prev => prev.filter(p => p.id !== item.id))}
                                            >Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td colSpan="3" className="py-3 px-4 text-right font-semibold text-lg">
                                        Tổng cộng:
                                    </td>
                                    <td className="py-3 px-4 text-green-600 font-bold text-lg">
                                        {selected.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0).toLocaleString()} đ
                                    </td>
                                    <td className="py-3 px-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="mt-2 text-sm text-gray-500">Bạn có thể chỉnh sửa số lượng hoặc xóa sản phẩm khỏi danh sách.</div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="px-6 py-2 bg-supply-primary text-white rounded font-semibold hover:bg-supply-primary/90"
                                onClick={() => setShowProposalModal(true)}
                            >
                                Gửi đề xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {showProposalModal && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowProposalModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Gửi đề xuất đơn hàng</h2>
            <div className="mb-3">
                <label className="block font-medium mb-1">Phí proxy (VNĐ)</label>
                <input
                    type="number"
                    min={0}
                    step={1000}
                    className="w-full border rounded px-3 py-2"
                    value={proxyFee}
                    onChange={e => setProxyFee(e.target.value)}
                    placeholder="Nhập phí proxy..."
                />
            </div>
            <div className="mb-3">
                <label className="block font-medium mb-1">Ghi chú</label>
                <textarea
                    className="w-full border rounded px-3 py-2"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ghi chú cho khách hàng (nếu có)..."
                    rows={3}
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setShowProposalModal(false)}
                    disabled={sending}
                >Hủy</button>
                <button
                    className="px-4 py-2 bg-supply-primary text-white rounded font-semibold hover:bg-supply-primary/90 disabled:opacity-60"
                    onClick={handleSendProposal}
                    disabled={sending || proxyFee < 0}
                >{sending ? "Đang gửi..." : "Gửi đề xuất"}</button>
            </div>
            {sendError && <div className="text-red-600 mt-2">{sendError}</div>}
            {sendSuccess && <div className="text-green-600 mt-2">{sendSuccess}</div>}
        </div>
    </div>
)}
        </div>
    );
};

export default CreateOrder;
