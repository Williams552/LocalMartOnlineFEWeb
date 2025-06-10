import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import sellerAvatar from "../../assets/image/logo.jpg";

const ChatBox = ({ sellerName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (!input.trim()) return;
        const newMsg = {
            from: "user",
            text: input.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, newMsg]);
        setInput("");

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    from: "seller",
                    text: "Cảm ơn bạn, mình sẽ phản hồi sớm!",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        }, 1500);
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white shadow-2xl rounded-lg border z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-supply-primary text-white px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img
                        src={sellerAvatar}
                        alt="Seller"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-semibold">{sellerName}</span>
                </div>
                <button onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-gray-50 max-h-80">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">
                        <p className="text-sm">Hãy bắt đầu trò chuyện với {sellerName}...</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`p-2 rounded-lg max-w-[70%] ${msg.from === "user" ? "bg-green-100" : "bg-white border"
                                    }`}
                            >
                                <p>{msg.text}</p>
                                <p className="text-[10px] text-gray-500 text-right mt-1">{msg.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="border-t px-3 py-2 bg-white flex items-center gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                    placeholder="Nhập tin nhắn..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-supply-primary text-white px-4 py-2 rounded-full text-sm hover:bg-green-600"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
