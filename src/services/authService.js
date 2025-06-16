const API_URL = process.env.REACT_APP_API_URL || "https://localhost:5001";

export async function login(username, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Login failed");
    return result;
}
