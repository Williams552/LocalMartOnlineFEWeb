// src/services/userService.js
import axios from "axios";

const API_URL = "http://localhost:5183/api/User"; // không có dấu / cuối

export const getAllUsers = async () => {
    try {
        // Lấy token từ localStorage (hoặc nơi bạn lưu trữ token)
        const token = localStorage.getItem("token");
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        throw error;
    }
};

