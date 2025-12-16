const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // receive cookie
        body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
        if (Array.isArray(data.detail)) {
            const message = data.detail
            .map((err: any) => `${err.loc?.slice(-1)[0]}: ${err.msg}`)
            .join(", ");
            throw new Error(message);
        }

        if (typeof data.detail === "string") {
        throw new Error(data.detail);
        }

        throw new Error("Login failed");
    }

    return data;
}

export async function login(email: string, password: string) {
    
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",    // <<< critical to receive cookie
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
        if (Array.isArray(data.detail)) {
            const message = data.detail
            .map((err: any) => `${err.loc?.slice(-1)[0]}: ${err.msg}`)
            .join(", ");
            throw new Error(message);
        }

        if (typeof data.detail === "string") {
        throw new Error(data.detail);
        }

        throw new Error("Login failed");
    }

    return data;
}

export async function logout() {
    return await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}


export async function userProfile() {
    return await fetch(
        `${API_URL}/user/profile`,
        { credentials: "include" }
    );
}


export async function refreshUserToken() {
    const res = await fetch(
        `${API_URL}/auth/refresh`,
        { method: "POST", credentials: "include" }
    );

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error("Failed to refresh");
    }

    return data;
}


export async function forgotPassword(email: string) {
    const res = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        }
    );

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error("Failed ...");
    }

    return data;
}


export async function resetPassword(token: string, password: string) {
    const res = await fetch(
        `${API_URL}/auth/reset-password`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
        }
    );

    const data = await res.json();
    
    if (!res.ok) {
        if (Array.isArray(data.detail)) {
            const message = data.detail
            .map((err: any) => `${err.loc?.slice(-1)[0]}: ${err.msg}`)
            .join(", ");
            throw new Error(message);
        }

        if (typeof data.detail === "string") {
        throw new Error(data.detail);
        }

        throw new Error("Login failed");
    }

    return data;
}