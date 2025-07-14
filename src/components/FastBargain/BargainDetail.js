import React, { useState, useEffect } from 'react';
import { FaHandshake, FaUser, FaClock, FaCheck, FaTimes, FaReply } from 'react-icons/fa';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import fastBargainService from '../../services/fastBargainService';
import authService from '../../services/authService';

const BargainDetail = ({ bargainId, onClose, onUpdate }) => {
    const [bargain, setBargain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [counterPrice, setCounterPrice] = useState('');
    const [showCounterInput, setShowCounterInput] = useState(false);
    const [error, setError] = useState(null);

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (bargainId) {
            loadBargainDetail();
        }
    }, [bargainId]);

    useEffect(() => {
        // Auto refresh every 10 seconds for pending bargains
        if (bargain && bargain.status === 'Pending') {
            const interval = setInterval(loadBargainDetail, 10000);
            return () => clearInterval(interval);
        }
    }, [bargain]);

    const loadBargainDetail = async () => {
        try {
            setLoading(true);
            const result = await fastBargainService.getBargainById(bargainId);

            if (result.success) {
                setBargain(result.data);
                setError(null);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Lỗi khi tải thông tin thương lượng');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        await takeAction('Accept');
    };

    const handleReject = async () => {
        await takeAction('Reject');
    };

    const handleCounter = async () => {
        if (!counterPrice || isNaN(counterPrice) || parseFloat(counterPrice) <= 0) {
            alert('Vui lòng nhập giá phản đề xuất hợp lệ');
            return;
        }

        await takeAction('Counter', parseFloat(counterPrice));
        setShowCounterInput(false);
        setCounterPrice('');
    };

    const takeAction = async (action, counterPriceValue = null) => {
        try {
            setActionLoading(true);

            const actionData = {
                bargainId: bargain.bargainId,
                userId: currentUser.id,
                action: action
            };

            if (action === 'Counter' && counterPriceValue) {
                actionData.counterPrice = counterPriceValue;
            }

            const result = await fastBargainService.takeAction(actionData);

            if (result.success) {
                // Reload bargain detail
                await loadBargainDetail();
                onUpdate?.(result.data);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Lỗi khi thực hiện hành động');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <FiLoader className="animate-spin text-2xl text-green-600" />
                <span className="ml-2">Đang tải...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={loadBargainDetail}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!bargain) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600">Không tìm thấy thông tin thương lượng</p>
            </div>
        );
    }

    const statusInfo = fastBargainService.formatStatus(bargain.status);
    const canAct = fastBargainService.canTakeAction(bargain, currentUser.id);
    const timeRemaining = fastBargainService.getTimeRemaining(bargain.expiresAt);
    const lastProposal = bargain.proposals?.[bargain.proposals.length - 1];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <FaHandshake className="text-green-600 text-xl" />
                        <h2 className="text-xl font-semibold">Chi tiết thương lượng</h2>
                    </div>
                    <button
                        onClick={loadBargainDetail}
                        className="text-gray-500 hover:text-green-600"
                        title="Làm mới"
                    >
                        <FiRefreshCw />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Trạng thái:</span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <span className="mr-1">{statusInfo.icon}</span>
                            {statusInfo.name}
                        </div>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">ID thương lượng:</span>
                        <p className="font-mono text-sm">{bargain.bargainId}</p>
                    </div>
                    {timeRemaining && (
                        <div>
                            <span className="text-sm text-gray-500">Thời gian còn lại:</span>
                            <p className="text-sm font-medium text-orange-600">
                                <FaClock className="inline mr-1" />
                                {timeRemaining}
                            </p>
                        </div>
                    )}
                </div>

                {bargain.finalPrice && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-600">Giá cuối cùng:</span>
                        <p className="text-lg font-semibold text-green-600">
                            {fastBargainService.formatCurrency(bargain.finalPrice)}
                        </p>
                    </div>
                )}
            </div>

            {/* Proposals Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Lịch sử đề xuất</h3>

                {bargain.proposals && bargain.proposals.length > 0 ? (
                    <div className="space-y-4">
                        {bargain.proposals.map((proposal, index) => (
                            <div
                                key={proposal.id || index}
                                className={`flex items-start space-x-4 p-4 rounded-lg ${proposal.userId === currentUser.id ? 'bg-blue-50' : 'bg-gray-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${proposal.userId === currentUser.id ? 'bg-blue-600' : 'bg-gray-600'
                                    }`}>
                                    <FaUser className="text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                            {proposal.userId === currentUser.id ? 'Bạn' : 'Đối tác'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(proposal.proposedAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <p className="text-lg font-semibold text-green-600">
                                        {fastBargainService.formatCurrency(proposal.proposedPrice)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có đề xuất nào</p>
                )}
            </div>

            {/* Action Buttons */}
            {bargain.status === 'Pending' && canAct.canAct && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Thực hiện hành động</h3>

                    {lastProposal && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                Đề xuất hiện tại:
                                <span className="font-semibold text-green-600 ml-1">
                                    {fastBargainService.formatCurrency(lastProposal.proposedPrice)}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Accept/Reject buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAccept}
                                disabled={actionLoading}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                <FaCheck />
                                <span>Chấp nhận</span>
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                <FaTimes />
                                <span>Từ chối</span>
                            </button>
                        </div>

                        {/* Counter offer */}
                        <div>
                            {!showCounterInput ? (
                                <button
                                    onClick={() => setShowCounterInput(true)}
                                    disabled={actionLoading}
                                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    <FaReply />
                                    <span>Phản đề xuất</span>
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        value={counterPrice}
                                        onChange={(e) => setCounterPrice(e.target.value)}
                                        placeholder="Nhập giá phản đề xuất"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        min="0"
                                        step="1000"
                                    />
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleCounter}
                                            disabled={actionLoading || !counterPrice}
                                            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            Gửi phản đề xuất
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCounterInput(false);
                                                setCounterPrice('');
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {actionLoading && (
                        <div className="mt-4 flex items-center justify-center">
                            <FiLoader className="animate-spin mr-2" />
                            <span>Đang xử lý...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Status message for non-actionable bargains */}
            {bargain.status === 'Pending' && !canAct.canAct && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">{canAct.reason}</p>
                </div>
            )}
        </div>
    );
};

export default BargainDetail;
