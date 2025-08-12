import React from 'react';
import { FaUser, FaStore, FaBox, FaFileAlt, FaClock, FaIdCard } from 'react-icons/fa';
import reportService from '../../services/reportService';

const ReportDetails = ({ report }) => {
    if (!report) return null;

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return `${price.toLocaleString('vi-VN')}đ`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getTargetIcon = (targetType) => {
        const icons = {
            Product: FaBox,
            Store: FaStore,
            Seller: FaUser,
            Buyer: FaUser
        };
        const Icon = icons[targetType] || FaFileAlt;
        return <Icon className="text-blue-500" />;
    };

    return (
        <div className="space-y-6">
            {/* Report Basic Info */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaFileAlt className="mr-2 text-blue-500" />
                    Thông tin báo cáo
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Tiêu đề:</label>
                        <p>{report.Title || report.title || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Lý do:</label>
                        <p>{report.Reason || report.reason}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Trạng thái:</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(report.Status || report.status) === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            (report.Status || report.status) === 'Resolved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {report.Status || report.status}
                        </span>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Ngày tạo:</label>
                        <p className="flex items-center">
                            <FaClock className="mr-1 text-gray-400" size={12} />
                            {formatDate(report.CreatedAt || report.createdAt)}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Cập nhật lần cuối:</label>
                        <p className="flex items-center">
                            <FaClock className="mr-1 text-gray-400" size={12} />
                            {formatDate(report.UpdatedAt || report.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reporter Info */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaUser className="mr-2 text-green-500" />
                    Người báo cáo
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Tên:</label>
                        <p>{report.ReporterName || report.reporterName || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Số điện thoại:</label>
                        <p>{report.ReporterPhone || report.reporterPhone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Target Info */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    {getTargetIcon(report.TargetType || report.targetType)}
                    <span className="ml-2">Đối tượng bị báo cáo</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Loại:</label>
                        <p>{reportService.getTargetTypeLabel(report.TargetType || report.targetType)}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Tên:</label>
                        <p>{report.TargetName || report.targetName}</p>
                    </div>

                    {/* Product specific fields */}
                    {(report.TargetType || report.targetType) === 'Product' && (
                        <>
                            {(report.TargetPrice || report.targetPrice) && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Giá:</label>
                                    <p>{formatPrice(report.TargetPrice || report.targetPrice)}</p>
                                </div>
                            )}
                            {(report.TargetUnit || report.targetUnit) && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Đơn vị:</label>
                                    <p>{report.TargetUnit || report.targetUnit}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Target Images */}
                {(report.TargetImages || report.targetImages) && (
                    <div className="mt-4">
                        <label className="text-sm font-medium text-gray-600 block mb-2">Hình ảnh:</label>
                        <div className="flex flex-wrap gap-2">
                            {(report.TargetImages || report.targetImages).map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Evidence */}
            {(report.EvidenceImage || report.evidenceImage) && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Bằng chứng</h3>
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">Hình ảnh bằng chứng:</label>
                        <img
                            src={report.EvidenceImage || report.evidenceImage}
                            alt="Evidence"
                            className="max-w-md h-auto rounded-lg border"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <p className="text-sm text-gray-500 mt-2 hidden">
                            Không thể tải hình ảnh bằng chứng
                        </p>
                    </div>
                </div>
            )}

            {/* Admin Response */}
            {(report.AdminResponse || report.adminResponse) && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Phản hồi của Admin</h3>
                    <p className="text-blue-700">{report.AdminResponse || report.adminResponse}</p>
                </div>
            )}
        </div>
    );
};

export default ReportDetails;
