export async function callApi(endpoint, method = "GET", data = null, token = null) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = {
        method,
        headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${config.apiUrl}${endpoint}`, options);
    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized access
            window.location.href = "/login";
        } else if (response.status === 403) {
            // Handle forbidden access
            window.location.href = "/403";
        } else if (response.status === 400){
            console.log('Lỗi người dùng');
        } else {
            throw new Error(`Error: ${response.statusText}`);
        }
    }
    const result = await response.json();
    return await result;
}