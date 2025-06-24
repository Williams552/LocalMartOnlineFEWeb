import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiMessageSquare } from "react-icons/fi";

const ChatboxBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: "Chào bạn! Hôm nay bạn muốn ăn gì?" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const handleSend = () => {
        if (input.trim() === "") return;
        const userMessage = { from: "user", text: input };
        const botReply = { from: "bot", text: "Cảm ơn bạn! Tôi đang tìm gợi ý phù hợp..." };
        setMessages([...messages, userMessage, botReply]);
        setInput("");
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-supply-primary text-white p-3 flex justify-between items-center">
                        <span className="font-semibold">Gợi ý từ LocalBot</span>
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    {/* Messages */}
                    <div className="p-3 h-64 overflow-y-auto text-sm space-y-2 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-lg max-w-[75%] ${msg.from === "user"
                                        ? "bg-supply-primary text-white"
                                        : "bg-white border"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center border-t px-3 py-2">
                        <input
                            type="text"
                            className="flex-1 text-sm px-3 py-1 border rounded-full mr-2"
                            placeholder="Nhập nội dung..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="text-supply-primary hover:text-supply-secondary"
                        >
                            <FiSend size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-supply-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition"
                    title="Chat với LocalBot"
                >
                    <FiMessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default ChatboxBot;
