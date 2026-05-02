# Auth Context

## Purpose

Define the official authentication contract for the backend and clarify the auth context behavior.

## Auth Scheme

- The backend requires `Authorization: Bearer <JWT>`.
- JWTs must be signed with a server-side secret and verified on each request.

## Error Codes

- `401 AUTH_CONTEXT_MISSING`: no authorization header present.
- `401 AUTH_CONTEXT_INVALID_TOKEN`: token invalid, expired, or signature mismatch.
- `404 AUTH_CONTEXT_USER_NOT_FOUND`: the user referenced by the JWT does not exist.
- `403 AUTH_CONTEXT_USER_INACTIVE`: the user exists but is not active.

## Notes

- The transitional `x-user-id` header is replaced by JWT bearer authentication in v1.
- Every request requiring user context must validate the token before authorizing access.
