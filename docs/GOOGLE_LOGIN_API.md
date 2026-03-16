# Google Login API Documentation

## Overview

The Google Login API allows users to authenticate using their Google account. The frontend obtains an **ID token** from Google's Sign-In flow and sends it to the backend for verification. The backend returns a JWT access token and user profile (including profile image, name, email).

---

## Endpoint

```
POST /auth/google
```

**Content-Type:** `application/json`

---

## Request

### Headers

| Header          | Value             | Required |
|-----------------|-------------------|----------|
| Content-Type    | application/json  | Yes      |

### Body

| Field     | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| idToken   | string | One required | Google ID token (from `GoogleLogin` → `credentialResponse.credential`) |
| accessToken | string | One required | Google access token (from `useGoogleLogin` → `tokenResponse.access_token`) |

### Example Request

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Response

### Success (200 OK)

| Field         | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| access_token  | string | JWT token for authenticated API requests         |
| user          | object | User profile object                              |
| user.id       | string | Unique user ID (UUID)                            |
| user.email    | string | User's email address                             |
| user.fullName | string | User's full name from Google                     |
| user.profileImageUrl | string \| null | Google profile picture URL (or null if not set) |
| message       | string | Success message                                  |

### Example Success Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@gmail.com",
    "fullName": "John Doe",
    "profileImageUrl": "https://lh3.googleusercontent.com/a/ACg8ocK..."
  },
  "message": "Logged In Successfully !"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 Bad Request | Missing or invalid `idToken` in request body |
| 401 Unauthorized | Invalid or expired Google ID token |

### Example Error Response (401)

```json
{
  "statusCode": 401,
  "message": "Invalid Google ID token",
  "error": "Unauthorized"
}
```

---

## Frontend Integration Guide

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Google+ API** / **Google Identity Services**
4. Go to **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID** (Web application type)
6. Add your frontend origin (e.g. `http://localhost:3001`) to **Authorized JavaScript origins**
7. Copy the **Client ID** and set it in your backend `.env` as `GOOGLE_CLIENT_ID`

### 2. Important: Use the Correct Credential

| Frontend Component | What to Send | Field Name |
|--------------------|---------------|------------|
| `GoogleLogin` (recommended) | `credentialResponse.credential` | `idToken` |
| `useGoogleLogin` | `tokenResponse.access_token` | `accessToken` |

**For best results**, use the `GoogleLogin` component and send `credential` as `idToken`. The backend supports both `idToken` and `accessToken`.

**Client ID must match**: The frontend and backend must use the **exact same** Web Client ID from Google Cloud Console. An "audience mismatch" error means they differ.

### 3. Frontend Flow (React example with @react-oauth/google)

```bash
npm install @react-oauth/google
```

```tsx
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

function LoginButton() {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // tokenResponse.access_token is for Google APIs
      // For backend, we need id_token - use credentialResponse from GoogleLogin
    },
    flow: 'implicit',
  });

  return <button onClick={() => login()}>Sign in with Google</button>;
}

// Better: Use GoogleLogin to get id_token directly
import { GoogleLogin } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;
          if (!idToken) return;

          const res = await fetch('http://localhost:3000/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('access_token', data.access_token);
            console.log('User:', data.user);
            // data.user contains: id, email, fullName, profileImageUrl
          }
        }}
        onError={() => console.error('Login Failed')}
      />
    </GoogleOAuthProvider>
  );
}
```

### 4. Fetch Profile (for avatar, etc.)

To get the current user with `profileImageUrl` (e.g. on page load/refresh):

```
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@gmail.com",
  "fullName": "John Doe",
  "profileImageUrl": "https://lh3.googleusercontent.com/a/ACg8ocK..."
}
```

Use `profileImageUrl` in your avatar: `<img src={user.profileImageUrl} alt={user.fullName} />` (fallback to initials when null).

### 5. Using the Access Token

After successful login, include the `access_token` in subsequent API requests:

```
Authorization: Bearer <access_token>
```

---

## Summary

| What Frontend Sends | What Backend Returns |
|--------------------|----------------------|
| `{ idToken: "..." }` (Google ID token) | `access_token` (JWT) + `user` object with `id`, `email`, `fullName`, `profileImageUrl` |
