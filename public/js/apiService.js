export async function callApi(endpoint, method = "GET", data = null,FormData=null, token = null, isRetry = false) {
    const headers = {
        "Content-Type": "application/json",
    };

    // Use provided token or get from cookies
    if (!token) {
        const tokens = getTokens();
        token = tokens.access_token;
    }

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = {
        method,
        headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }
    if (FormData) {
        options.body = FormData;
        delete headers["Content-Type"]; // Let the browser set the correct Content-Type
    }
    const response = await fetch(`${config.apiUrl}${endpoint}`, options);
    // alert("link : " + `${config.apiUrl}${endpoint}`);
    if (!response.ok) {
        if (response.status === 401 && !isRetry) {
            // Try to refresh token only once
            const refreshedToken = await refreshTokens();
            if (refreshedToken) {
                // Retry original request with new token (with isRetry flag)
                return callApi(endpoint, method, data,FormData, refreshedToken, true);
            } else {
                // Token refresh failed, redirect to login
                window.location.href = "/login";
            }
        } else if (response.status === 403) {
            window.location.href = "/403";
        } else if (response.status === 400) {
            console.log('Lỗi người dùng');
            throw new Error(`Bad Request: ${response.statusText}`);
        } else {
            throw new Error(`Error: ${response.statusText}`);
        }
    }

    const result = await response.json();
    return result;
}
function getTokens() {
    //Lấy từ cookie
    const cookies = document.cookie.split('; ');
    const tokens = {};
    cookies.forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (name === 'access_token' || name === 'refresh_token') {
            tokens[name] = decodeURIComponent(value);
        }
    });
    return tokens;
}


async function refreshTokens() {
    const tokens = getTokens();
    const refreshToken = tokens.refresh_token;



    if (!refreshToken) {
        window.location.href = '/login';
        return null;
    }

    try {
        const response = await fetch(`${config.apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();
        return tokens.access_token;
    } catch (error) {
        console.error('Refresh token failed:', error);
        removeTokens();
        window.location.href = '/login';
        return null;
    }

}
/**
 * Removes all authentication tokens from cookies
 */
function removeTokens() {
    // Expire the cookies by setting max-age to 0
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
    document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Strict";
}