// src/pages/ProxyShopper/RegisterProxyShopper.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import marketService from "../../services/marketService";
import proxyShopperRegistrationService from "../../services/proxyShopperRegistrationService";
import authService from "../../services/authService";

const RegisterProxyShopper = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        operatingArea: "",
        transportMethod: "",
        paymentMethod: "",
    });

    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [existingRegistration, setExistingRegistration] = useState(null);

    const transportMethods = [
        { value: "motorbike", label: "Xe máy" },
        { value: "bicycle", label: "Xe đạp" },
        { value: "walk", label: "Đi bộ" },
        { value: "car", label: "Ô tô" },
    ];

    const paymentMethods = [
        { value: "cash", label: "Tiền mặt" },
        { value: "transfer", label: "Chuyển khoản" },
        { value: "momo", label: "MoMo" },
        { value: "zalopay", label: "ZaloPay" },
    ];

    useEffect(() => {
        loadMarkets();
        checkExistingRegistration();
    }, []);

    const loadMarkets = async () => {
        try {
            const marketsData = await marketService.getActiveMarkets();
            console.log('🏪 Loaded markets for proxy registration:', marketsData);
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
            const registration = await proxyShopperRegistrationService.getMyRegistration();
            if (registration) {
                setExistingRegistration(registration);
            }
        } catch (error) {
            console.error('Error checking registration:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate required fields
        if (!formData.operatingArea) {
            setError("Vui lòng chọn chợ hoạt động");
            setLoading(false);
            return;
        }

        if (!formData.transportMethod) {
            setError("Vui lòng chọn phương tiện di chuyển");
            setLoading(false);
            return;
        }

        if (!formData.paymentMethod) {
            setError("Vui lòng chọn phương thức thanh toán");
            setLoading(false);
            return;
        }

        try {
            console.log('🚀 Submitting proxy registration with data:', {
                marketId: formData.operatingArea, // Selected market ID
                transportMethod: formData.transportMethod,
                paymentMethod: formData.paymentMethod
            });
            
            console.log('📝 Form data before submit:', formData);
            
            await proxyShopperRegistrationService.registerProxyShopper(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Check if user is already registered
    if (existingRegistration) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">
                    Đăng ký làm người đi chợ dùm
                </h1>
                <div className="bg-white p-6 rounded shadow">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-xl font-semibold mb-4">Đã có đăng ký</h2>
                        <p className="text-gray-600 mb-4">
                            Bạn đã đăng ký làm người đi chợ dùm. Trạng thái:
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${existingRegistration.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    existingRegistration.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {existingRegistration.status === 'Approved' ? 'Đã duyệt' :
                                    existingRegistration.status === 'Rejected' ? 'Bị từ chối' :
                                        'Đang chờ duyệt'}
                            </span>
                        </p>
                        {existingRegistration.rejectionReason && (
                            <p className="text-red-600 mb-4">
                                Lý do từ chối: {existingRegistration.rejectionReason}
                            </p>
                        )}
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-6 py-2 bg-supply-primary text-white rounded-full hover:opacity-90"
                        >
                            Quay về trang cá nhân
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success message
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">
                    Đăng ký làm người đi chợ dùm
                </h1>
                <div className="bg-white p-6 rounded shadow">
                    <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-xl font-semibold mb-4">Đăng ký thành công!</h2>
                        <p className="text-gray-600 mb-4">
                            Đăng ký của bạn đã được gửi và đang chờ admin duyệt.
                        </p>
                        <p className="text-sm text-gray-500">
                            Chuyển hướng về trang cá nhân trong giây lát...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">
                Đăng ký làm người đi chợ dùm
            </h1>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow space-y-5"
            >
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Chợ hoạt động <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="operatingArea"
                        value={formData.operatingArea}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-supply-primary focus:border-supply-primary transition"
                    >
                        <option value="">-- Chọn chợ hoạt động --</option>
                        {markets.map((market, idx) => (
                            <option key={market.id || idx} value={market.id || market}>
                                {market.name || market} {market.address && `- ${market.address}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Phương tiện di chuyển <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="transportMethod"
                        value={formData.transportMethod}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                    >
                        <option value="">-- Chọn phương tiện --</option>
                        {transportMethods.map((method) => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Phương thức thanh toán <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                    >
                        <option value="">-- Chọn phương thức thanh toán --</option>
                        {paymentMethods.map((method) => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-supply-primary text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang gửi..." : "Gửi đăng ký"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterProxyShopper;
