# Campus Management System - Frontend

This is the frontend for the Campus Management System, built with React (Vite) and Tailwind CSS.

## Authentication - Story 1: Login Page UI

The Login Page UI is implemented and ready. It features responsive design, client-side validation, and a simulated loading state.

### Expected Login Payload (For Story 2)

When integrating the frontend with the real Authentication API in Story 2, the `LoginForm.jsx` component will send a `POST` request to `/api/auth/login`.

The expected payload shape sent by the client is:

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "rememberMe": true
}
```

The backend should be prepared to handle this exact shape.
