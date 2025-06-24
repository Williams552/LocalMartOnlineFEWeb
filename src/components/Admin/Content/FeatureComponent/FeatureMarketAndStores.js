import React from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";

import mng_user from "../../../../assets/image/logo.jpg";
import mng_account from "../../../../assets/image/logo.jpg";

const MarketAndStoreComponent = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="flex items-center text-2xl font-semibold text-gray-800 mb-2">
                <FaUser className="text-3xl text-blue-500 mr-2" />
                <h5 className="relative">
                    Quản lý Chợ và Sạp
                    <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
                </h5>
            </div>

            {/* Feature Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full justify-items-center">

                {/* Card 1 */}
                <Card
                    link="/system/admin/manage-markets"
                    title="Quản lý Chợ"
                    description="Quản lý thông tin Chợ"
                    image={mng_user}
                />

                {/* Card 2 */}
                <Card
                    link="/system/admin/manage-stores"
                    title="Quản lý Sạp"
                    description="Quản lý thông tin Sạp"
                    image={mng_account}
                />

            </div>
        </div>
    );
};

const Card = ({ link, title, description, image }) => (
    <div className="relative w-full max-w-xs h-[240px] cursor-pointer rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
        <Link
            to={link}
            className="w-full h-full flex flex-col justify-center items-center text-white text-sm font-bold transition-all duration-300"
        >
            {/* Background */}
            <div
                className="absolute top-0 left-0 right-0 bottom-0 bg-contain bg-no-repeat bg-center rounded-xl"
                style={{
                    backgroundImage: `url(${image})`,
                    filter: "blur(2px)",
                }}
            ></div>

            {/* Overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-xl"></div>

            {/* Text content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
                <h6 className="text-lg font-semibold hover:border-b-2 hover:border-yellow-300">
                    {title}
                </h6>
                <p className="text-sm text-white mt-1 hover:border-b-2 hover:border-yellow-300">
                    {description}
                </p>
            </div>
        </Link>
    </div>
);

export default MarketAndStoreComponent;