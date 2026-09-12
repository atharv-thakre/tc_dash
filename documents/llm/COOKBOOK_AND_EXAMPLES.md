# Cookbook & Code Recipes

Ready-to-use recipes and production patterns for integrating `tc_auth`.

---

## 1. Full Production FastAPI Backend Setup

### `connect.py`
```python
import os
from sqlalchemy import create_engine
from tc_auth import Auth

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/my_app_db")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# 1. Instantiate Auth
auth = Auth(engine=engine)

# 2. Configure JWT (Dual-Token mode for enhanced security)
auth.jwt.config(
    secret_key=os.getenv("JWT_SECRET", "super-secure-production-secret-key"),
    algorithm="HS256",
    session_duration_days=7,
    dual_token_mode=True,
    access_token_expire_minutes=15,
    refresh_token_expire_days=7,
)

# 3. Configure Email SMTP
auth.email.config(
    host=os.getenv("SMTP_HOST", "smtp.resend.com"),
    port=587,
    username=os.getenv("SMTP_USER", "resend"),
    password=os.getenv("SMTP_PASS", "re_123456789"),
    sender=os.getenv("SMTP_SENDER", "auth@myapp.com"),
    sender_name="MyApp Security",
    use_tls=True,
)

# 4. Configure Google OAuth
auth.google.config(
    client_id=os.getenv("GOOGLE_CLIENT_ID", ""),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET", ""),
    redirect_uri=os.getenv("GOOGLE_REDIRECT_URI", "https://api.myapp.com/tc-auth/google/callback"),
)
```

### `routers/posts.py`
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from connect import auth

router = APIRouter(prefix="/posts", tags=["Posts"])

class CreatePostSchema(BaseModel):
    title: str
    content: str

# Protected Route (Any Active Authenticated User)
@router.post("/")
def create_post(
    body: CreatePostSchema,
    user=Depends(auth.deps.get_current_user),
    active_check=Depends(auth.status.require("active")),
):
    account = user["account"]
    return {
        "post_id": 101,
        "title": body.title,
        "author_id": account["id"],
        "author_name": account["name"],
    }

# Admin-Only Route
@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    admin=Depends(auth.role.require("admin")),
):
    return {
        "status": "deleted",
        "post_id": post_id,
        "deleted_by": admin["email"],
    }
```

### `run.py`
```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from connect import auth
from routers.posts import router as posts_router

app = FastAPI(title="MyApp API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.myapp.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
auth.init()

# Wire tc_auth routes under /tc-auth
auth.include_routes(app, prefix="/tc-auth")

# Include domain routers
app.include_router(posts_router)

if __name__ == "__main__":
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 2. Frontend Axios Interceptor with Auto Token Refresh

This Axios instance automatically adds the Bearer access token to requests, catches `401 Unauthorized` responses, refreshes the token in the background using `POST /tc-auth/token/refresh`, queues pending requests, and retries seamlessly:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "https://api.myapp.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/tc-auth/token/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token || refreshToken;

        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 3. Passwordless OTP Signup & Login Flow

### Flow Walkthrough

```typescript
// 1. Send OTP to User's Email
async function requestOTP(email: string, purpose: "signup" | "login") {
  await apiClient.post(`/tc-auth/send/email/otp/${purpose}`, {
    email: email,
    frontend_url: window.location.origin,
  });
  alert("Check your email for your 6-digit OTP code!");
}

// 2A. Complete Signup with OTP
async function submitOTPSignup(data: { name: string; email: string; otp: string; password: string }) {
  const response = await apiClient.post("/tc-auth/signup/otp", data);
  const { access_token, refresh_token, account } = response.data;
  localStorage.setItem("access_token", access_token);
  if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
  return account;
}

// 2B. Complete Login with OTP
async function submitOTPLogin(email: string, otp: string) {
  const response = await apiClient.post("/tc-auth/login/otp", { email, otp });
  const { access_token, refresh_token, account } = response.data;
  localStorage.setItem("access_token", access_token);
  if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
  return account;
}
```
