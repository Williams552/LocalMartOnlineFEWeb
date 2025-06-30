import { React, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { Outlet, useNavigate } from "react-router-dom";

// icons libraries
import { CgBell } from "react-icons/cg";
import { FaGear } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { FaStore } from "react-icons/fa6";
import { FaHockeyPuck } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { SlArrowLeft } from "react-icons/sl";
import { SlArrowRight } from "react-icons/sl";
import { MdDashboardCustomize } from "react-icons/md";
import { FaLemon } from "react-icons/fa6";
import { FaFileInvoice } from "react-icons/fa6";
import { FaListAlt } from 'react-icons/fa';
import { FaQuestionCircle } from 'react-icons/fa';  
import { FaRegFileAlt } from 'react-icons/fa'; 
import { FaHandsHelping } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa6';




import "./Admin.scss";
import "react-pro-sidebar/dist/css/styles.css";

const Admin = (props) => {
    const [collapsed, setCollapsed] = useState(true);
    const navigate = useNavigate();

    const [toggleIcons, setToggleIcons] = useState("dashboard");

    const navigationsData = [
        {
            icon: <MdDashboardCustomize className="text-2xl" />,
            label: "dashboard",
            text: "Dashboard",
            href: "/system/admin",
        },
        {
            icon: <FaUserGear Gear className="text-2xl" />,
            label: "users",
            text: "Người dùng",
            href: "feature_users",
        },
        {
            icon: <FaStore className="text-2xl" />,
            text: "Chợ và Sạp",
            label: "market_and_stores",
            href: "feature_market_stores",
        }
        ,
        {
            icon: <FaListAlt className="text-2xl" />, // Icon Danh mục
            label: "categories",
            text: "Danh mục",
            href: "feature_categories",
        },
         {
        icon: <FaQuestionCircle className="text-2xl" />,
        label: "faq",
        text: "Quản lý FAQ",
        href: "feature_faq",
    },
    {
        icon: <FaRegFileAlt className="text-2xl" />,
        label: "policy",
        text: "Quản lý Chính sách Nền tảng",
        href: "feature_policy",
    },
    {
        icon: <FaHandsHelping className="text-2xl" />,
        label: "support",
        text: "Quản lý Yêu cầu Hỗ trợ",
        href: "feature_support",
    },
    {
        icon: <FaBell className="text-2xl" />,
        label: "notification",
        text: "Quản lý Thông báo",
        href: "feature_notification",
    },

    
    ];

    const renderNavigations = () => {
        return navigationsData.map(({ icon, label, href, text }, index) => (
            <div
                key={index}
                className={`relative group flex flex-col justify-center items-center gap-4 cursor-pointer rounded-[50%] p-2 transition-all duration-200 group ${toggleIcons === label
                    ? "bg-gray-100  text-blue-500"
                    : "bg-black hover:bg-gray-100"
                    }`}
                onClick={() => handleTogge(label, href)} // Cập nhật trạng thái khi nhấp
            >
                <button className="flex justify-center items-center">{icon}</button>
                <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
                    {text}
                </span>
            </div>
        ));
    };

    const handleTogge = (label, href) => {
        setToggleIcons(label);
        navigate(href);
    };

    return (
        <div className="admin-container min-h-screen overflow-y-auto">
            {/* Admin-Sidebar - [AS] */}
            <div className="admin-sidebar min-h-screen">
            </div>
            <div className="admin-content w-full overflow-x-hidden">
                {/* New Nav */}
                <div className="flex items-center bg-gray-400 px-6 py-2 rounded-b-[50px] space-x-4">
                    <div className="flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-gray-200  hover:text-black p-2 transition-all duration-200 group rounded-[50%]">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="flex justify-center items-center"
                        >
                            {!collapsed ? (
                                <SlArrowLeft className="text-xl transition-colors duration-200" />
                            ) : (
                                <SlArrowRight className="text-xl transition-colors duration-200" />
                            )}
                        </button>
                    </div>
                    <div className="flex items-center w-full justify-center gap-[30px]">
                        {renderNavigations()}
                    </div>
                    <div
                        className="flex justify-center items-center text-black gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                        onClick={() => navigate("/home")}
                    >
                        <AiOutlineHome className="text-2xl" />
                    </div>
                </div>

                {/* admin-main-content */}
                <div className="admin-main px-3 py-2 mt-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Admin;