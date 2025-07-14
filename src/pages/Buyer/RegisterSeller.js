import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import marketService from "../../services/marketService";
import sellerRegistrationService from "../../services/sellerRegistrationService";
import authService from "../../services/authService";

const RegisterSeller = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        storeName: "",
        storeAddress: "",
        marketId: "",
        description: "",
        contractFile: null,
    });

    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [existingRegistration, setExistingRegistration] = useState(null);

    useEffect(() => {
        loadMarkets();
        checkExistingRegistration();
    }, []);

    const loadMarkets = async () => {
        try {
            const marketsData = await marketService.getActiveMarkets();
            setMarkets(marketsData || []);
        } catch (error) {
            console.error('Error loading markets:', error);
            // Fallback to static markets if API fails
            setMarkets([
                { id: "1", name: "Chợ Tân An" },
                { id: "2", name: "Chợ An Hòa" },
                { id: "3", name: "Chợ Xuân Khánh" },
                { id: "4", name: "Chợ Cái Khế" },
                { id: "5", name: "Chợ Hưng Lợi" },
            ]);
        }
    };

    const checkExistingRegistration = async () => {
        try {
            // Check if user is authenticated first
            if (!authService.isAuthenticated()) {
                console.log('User not authenticated, skipping registration check');
                return;
            }

            const registration = await sellerRegistrationService.getMyRegistration();
            if (registration) {
                setExistingRegistration(registration);
            }
        } catch (error) {
            console.error('Error checking registration:', error);
            // Don't show error for this as it's a background check
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError(""); // Clear error when user types
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, contractFile: e.target.files[0] }));
    };

    const validateForm = () => {
        if (!form.storeName.trim()) {
            setError("Tên gian hàng không được để trống");
            return false;
        }
        if (!form.marketId) {
            setError("Vui lòng chọn chợ");
            return false;
        }
        if (!form.storeAddress.trim()) {
            setError("Địa chỉ gian hàng không được để trống");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Check if user is authenticated
            if (!authService.isAuthenticated()) {
                setError("Vui lòng đăng nhập để đăng ký làm người bán");
                navigate("/login");
                return;
            }

            // Prepare registration data
            const registrationData = {
                storeName: form.storeName.trim(),
                storeAddress: form.storeAddress.trim(),
                marketId: form.marketId,
                businessLicense: form.contractFile ? form.contractFile.name : null
            };

            const result = await sellerRegistrationService.registerSeller(registrationData);

            if (result.success) {
                setSuccess(true);
                setForm({
                    storeName: "",
                    storeAddress: "",
                    marketId: "",
                    description: "",
                    contractFile: null,
                });
                // Refresh registration status after successful registration
                setTimeout(() => {
                    checkExistingRegistration();
                }, 1000);
            } else {
                setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (error.message.includes('Phiên đăng nhập')) {
                navigate("/login");
            } else {
                setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    // If user already has a registration, show status
    if (existingRegistration) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-supply-primary mb-4">
                        Trạng thái đăng ký người bán
                    </h2>

                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold">Thông tin đăng ký</h3>
                            <p><strong>Tên gian hàng:</strong> {existingRegistration.storeName}</p>
                            <p><strong>Địa chỉ gian hàng:</strong> {existingRegistration.storeAddress}</p>
                            <p><strong>ID Chợ:</strong> {existingRegistration.marketId}</p>
                            {existingRegistration.businessLicense && (
                                <p><strong>Giấy phép kinh doanh:</strong> {existingRegistration.businessLicense}</p>
                            )}
                            <p><strong>Trạng thái:</strong>
                                <span className={`ml-2 px-2 py-1 rounded text-sm ${existingRegistration.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    existingRegistration.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {existingRegistration.status === 'Approved' ? 'Đã duyệt' :
                                        existingRegistration.status === 'Rejected' ? 'Bị từ chối' : 'Đang chờ duyệt'}
                                </span>
                            </p>
                            {existingRegistration.rejectionReason && (
                                <p><strong>Lý do từ chối:</strong> {existingRegistration.rejectionReason}</p>
                            )}
                        </div>

                        {existingRegistration.status === 'Approved' && (
                            <div className="text-green-600 font-medium">
                                🎉 Chúc mừng! Bạn đã được duyệt làm người bán. Bạn có thể bắt đầu bán hàng ngay bây giờ.
                            </div>
                        )}

                        {existingRegistration.status === 'Pending' && (
                            <div className="text-yellow-600 font-medium">
                                ⏳ Đăng ký của bạn đang được xem xét. Chúng tôi sẽ liên hệ sớm nhất có thể.
                            </div>
                        )}

                        {existingRegistration.status === 'Rejected' && (
                            <div className="space-y-4">
                                <div className="text-red-600 font-medium">
                                    ❌ Đăng ký của bạn đã bị từ chối.
                                </div>
                                <button
                                    onClick={() => setExistingRegistration(null)}
                                    className="px-4 py-2 bg-supply-primary text-white rounded-full hover:bg-green-600"
                                >
                                    Đăng ký lại
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-supply-primary mb-4">
                    Đăng ký trở thành người bán
                </h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-green-600 font-medium">
                        ✅ Đăng ký thành công! Chúng tôi sẽ liên hệ xác nhận sớm.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tên gian hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="storeName"
                                value={form.storeName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-supply-primary"
                                placeholder="Nhập tên gian hàng của bạn"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Chợ bạn muốn đăng ký <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="marketId"
                                value={form.marketId}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-supply-primary"
                            >
                                <option value="">-- Chọn chợ --</option>
                                {markets.map((market) => (
                                    <option key={market.id || market._id} value={market.id || market._id}>
                                        {market.name || market.marketName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Địa chỉ gian hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="storeAddress"
                                value={form.storeAddress}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-supply-primary"
                                placeholder="Nhập địa chỉ cụ thể của gian hàng (VD: Lô A1, Chợ Tân An)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mô tả gian hàng
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                disabled={loading}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-supply-primary"
                                placeholder="Mô tả về loại sản phẩm bạn bán, kinh nghiệm bán hàng..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tên file giấy phép kinh doanh
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                                disabled={loading}
                                className="w-full text-sm"
                            />
                            {form.contractFile && (
                                <p className="mt-1 text-sm text-green-600">
                                    📎 {form.contractFile.name}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Lưu ý: Hiện tại chỉ lưu tên file. File thực tế sẽ được gửi sau khi đăng ký được duyệt.
                            </p>
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-full text-white font-medium ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-supply-primary hover:bg-green-600'
                                    }`}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi đăng ký'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterSeller;
