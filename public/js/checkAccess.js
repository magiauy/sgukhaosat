export async function checkAccess() {
    const token = sessionStorage.getItem('token');
    const permission = document.body.getAttribute('data-token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    const controller = new AbortController();
    const signal = controller.signal;

    // Optionally cancel the fetch on unload
    window.addEventListener('beforeunload', () => {
        controller.abort();
    });
    try {
        const response = await fetch(`${config.apiUrl}/verify-access`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permission }),
            signal: signal
        });
        if (response.status === 401) {
            console.log("401")
            window.location.href= '/401';
        }else if (response.status === 403) {
            console.log("403")
            window.location.href = '/403';
        }
        document.body.removeAttribute('data-token');
    } catch (error) {
        // console.error('Error:', error);
        if (error.name === 'AbortError') {
            // Abort initiated by beforeunload so do nothing
            return;
        }
        window.location.href = '/login';
    }
}
