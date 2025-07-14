import React, { useState } from 'react';
import { FaHandshake, FaHistory, FaPlus, FaInfoCircle } from 'react-icons/fa';
import BargainHistory from '../../components/FastBargain/BargainHistory';
import '../../styles/fast-bargain.css';

const FastBargainPage = () => {
    const [activeTab, setActiveTab] = useState('history');

    const tabs = [
        {
            id: 'history',
            name: 'Lịch sử thương lượng',
            icon: FaHistory,
            component: BargainHistory
        }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FaHandshake className="text-green-600 text-3xl" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Mua hộ nhanh (Fast Bargain)</h1>
                                <p className="text-gray-600">Thương lượng giá trực tiếp với người bán</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <FaInfoCircle className="text-blue-600 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-medium text-blue-800 mb-2">Cách thức hoạt động:</h3>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p>• Bạn đề xuất giá thấp hơn giá gốc cho sản phẩm mong muốn</p>
                                    <p>• Người bán có thể chấp nhận, từ chối hoặc phản đề xuất giá khác</p>
                                    <p>• Quá trình thương lượng diễn ra trong thời gian giới hạn</p>
                                    <p>• Khi đạt được thỏa thuận, đơn hàng sẽ được tạo với giá đã thương lượng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="py-8">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
};

export default FastBargainPage;
