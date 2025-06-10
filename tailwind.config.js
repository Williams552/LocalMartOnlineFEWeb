// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customGreen: "#2ecc71", // Xanh lá dịu
        "supply-primary": "#27ae60", // Xanh lá chính
        "supply-sec": "#a3e635", // Xanh nhạt (phụ)
        "btn-blue": "#34d399", // Nút chính màu xanh ngọc
        "btn-blue-hover": "#059669", // Hover đậm hơn
      },
      fontFamily: {
        instrument: ['"Instrument Sans"', "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      boxShadow: {
        "right-bottom": "8px 8px 2px rgba(0, 0, 0, 0.2)",
        "top-left": "-8px -8px 2px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
