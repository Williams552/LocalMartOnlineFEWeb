import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiHome, FiArrowLeft } from 'react-icons/fi';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <FiAlertCircle className="mx-auto h-16 w-16 text-red-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Không có quyền truy cập
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-supply-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supply-primary transition duration-200"
                    >
                        <FiHome className="mr-2 h-4 w-4" />
                        Về trang chủ
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supply-primary transition duration-200"
                    >
                        <FiArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </button>
                </div>

                <div className="mt-8">
                    <p className="text-xs text-gray-500">
                        @2025 bản quyền thuộc về SEP490_22
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
