# API Notes

## Current Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

## Auth Response Shape

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "fullName": "Sample User",
      "email": "user@example.com",
      "role": "patient"
    }
  }
}
```

## Error Shape

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required."
  }
}
```
