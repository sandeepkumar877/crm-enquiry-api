# CRM Enquiry REST API

A Node.js + Express + MongoDB REST API for a CRM where prospective students submit enquiries and counselors can claim them. JWT protects employee endpoints.

## Requirements covered

- Employee registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Public enquiry form endpoint without authentication
- Authenticated employees can view unclaimed enquiries
- Claim endpoint assigns an enquiry to one employee only
- Employees can view enquiries assigned to themselves
- Validation, pagination, error responses, and environment configuration

## Tech stack

Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens, bcryptjs, express-validator.

## Setup

1. Install Node.js (LTS) and MongoDB, or create a MongoDB Atlas database.
2. Extract this project and open a terminal in its root folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`.
5. Set `MONGODB_URI` and replace `JWT_SECRET` with a long, random secret.
6. Start the server:

   ```bash
   npm run dev
   ```

   Or use `npm start` for normal execution.

The server defaults to `http://localhost:5000`.

## API endpoints

| Method | Endpoint | Auth? | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register employee |
| POST | `/api/auth/login` | No | Login and receive JWT |
| POST | `/api/enquiries` | No | Submit public enquiry |
| GET | `/api/enquiries/unclaimed` | Yes | List unclaimed enquiries |
| PATCH | `/api/enquiries/:id/claim` | Yes | Claim one enquiry |
| GET | `/api/enquiries/mine` | Yes | List enquiries claimed by logged-in employee |

Protected endpoints require this header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

List endpoints accept optional `page` and `limit` query parameters. The limit is capped at 100.

## Request examples

### 1. Register an employee

`POST /api/auth/register`

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "StrongPassword123"
}
```

### 2. Login

`POST /api/auth/login`

```json
{
  "email": "asha@example.com",
  "password": "StrongPassword123"
}
```

Copy the `token` from the response and use it as a Bearer token for protected endpoints.

### 3. Submit a public enquiry

`POST /api/enquiries`

No Authorization header is needed.

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "courseInterest": "Full Stack Development",
  "message": "Please share course details.",
  "source": "website"
}
```

New enquiries start with `status: "unclaimed"` and `assignedTo: null`.

### 4. Get unclaimed enquiries

`GET /api/enquiries/unclaimed?page=1&limit=20`

Add the Bearer token. Only enquiries that have not been claimed are returned.

### 5. Claim an enquiry

`PATCH /api/enquiries/ENQUIRY_ID/claim`

Add the Bearer token. The update is atomic: the database changes the record only if its status is still `unclaimed` and `assignedTo` is `null`. If two counselors attempt to claim it simultaneously, only one succeeds; the other receives HTTP 409.

### 6. Get enquiries claimed by the logged-in employee

`GET /api/enquiries/mine?page=1&limit=20`

Add the Bearer token. The server uses the employee ID from the verified JWT, not an ID supplied by the client.

## Test with Postman

1. Start the API and verify `GET http://localhost:5000/api/health`.
2. Register two employees using `/api/auth/register`.
3. Submit an enquiry using `POST /api/enquiries` without a token.
4. Login as employee A and copy the returned token.
5. Call `/api/enquiries/unclaimed` with employee A's token.
6. Claim the enquiry using `PATCH /api/enquiries/<id>/claim`.
7. Call `/api/enquiries/mine` with employee A's token; the enquiry should appear.
8. Login as employee B and try claiming the same enquiry. The API should return `409 Conflict`.
9. Confirm the claimed enquiry no longer appears in `/api/enquiries/unclaimed`.

## Example error behavior

- `400 Bad Request`: invalid input or malformed MongoDB ID
- `401 Unauthorized`: missing, invalid, or expired JWT
- `404 Not Found`: unknown route or enquiry ID
- `409 Conflict`: duplicate employee email or already-claimed enquiry
- `500 Internal Server Error`: unexpected server-side error

## Design decisions

- Passwords are never stored in plaintext; bcrypt hashes them.
- The JWT contains the employee ID in `sub`. Protected requests load the employee from the database.
- Public enquiries can be submitted without authentication, as required.
- Only unclaimed enquiries are visible in the shared unclaimed list.
- Claiming is an atomic conditional database update, preventing two employees from owning the same enquiry.
- `assignedTo` references the employee document.
- Pagination prevents list endpoints from returning an unlimited number of records.

## Before production

- Add rate limiting and abuse protection to public routes.
- Use HTTPS and a strong secret stored in a secrets manager.
- Configure a specific `CLIENT_ORIGIN` instead of `*`.
- Add email verification, password reset, audit logging, and automated tests if required.
- Consider making employee registration admin-only for a real company deployment.
