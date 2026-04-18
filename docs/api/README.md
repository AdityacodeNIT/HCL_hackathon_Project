# API Notes

## Current Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/vaccines`
- `GET /api/v1/admin/master-data`
- `POST /api/v1/admin/hospitals`
- `PUT /api/v1/admin/hospitals/:hospitalId`
- `POST /api/v1/admin/vaccines`
- `POST /api/v1/admin/offerings`
- `PATCH /api/v1/admin/offerings/:offeringId`

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
