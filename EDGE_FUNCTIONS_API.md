# Worklane Edge Functions API Documentation

This document outlines all the Edge Functions available for the Worklane freelancing marketplace.

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Job Management

### 1. Create Job
**Endpoint:** `POST /functions/v1/jobs-create`

**Authentication:** Required (Client only)

**Request Body:**
```json
{
  "title": "Build a React Dashboard",
  "description": "Create a responsive dashboard with charts and analytics",
  "budget": 5000,
  "deadline": "2024-03-15",
  "required_skills": ["React", "TypeScript", "Node.js"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "title": "Build a React Dashboard",
  "description": "...",
  "budget": 5000,
  "deadline": "2024-03-15",
  "required_skills": ["React", "TypeScript", "Node.js"],
  "status": "open",
  "hired_freelancer_id": null,
  "created_at": "2024-02-19T10:00:00Z",
  "updated_at": "2024-02-19T10:00:00Z"
}
```

**Error Responses:**
- `400`: Missing required fields or invalid budget
- `403`: Only clients can create jobs
- `401`: Unauthorized

---

### 2. List Jobs
**Endpoint:** `GET /functions/v1/jobs-list?limit=10&offset=0&status=open`

**Authentication:** Not required

**Query Parameters:**
- `limit` (number): Max results per page (default: 10, max: 100)
- `offset` (number): Pagination offset (default: 0)
- `status` (string): Filter by status (default: "open")

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Build a React Dashboard",
      "description": "...",
      "budget": 5000,
      "deadline": "2024-03-15",
      "required_skills": ["React", "TypeScript"],
      "status": "open",
      "created_at": "2024-02-19T10:00:00Z",
      "client": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "..."
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3. Complete Job
**Endpoint:** `POST /functions/v1/jobs-complete`

**Authentication:** Required (Job owner only)

**Request Body:**
```json
{
  "job_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Job marked as completed successfully",
  "job_id": "uuid"
}
```

**Error Responses:**
- `400`: Only in-progress jobs can be completed
- `403`: Only the job owner can complete a job
- `404`: Job not found
- `401`: Unauthorized

---

## Bid Management

### 4. Create Bid
**Endpoint:** `POST /functions/v1/bids-create`

**Authentication:** Required (Freelancer only)

**Request Body:**
```json
{
  "job_id": "uuid",
  "amount": 4500,
  "proposal": "I have 5+ years experience with React and can deliver high-quality work...",
  "delivery_time": 14
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "job_id": "uuid",
  "freelancer_id": "uuid",
  "amount": 4500,
  "proposal": "...",
  "delivery_time": 14,
  "status": "pending",
  "created_at": "2024-02-19T10:30:00Z"
}
```

**Error Responses:**
- `400`: Cannot bid on closed/completed jobs or duplicate bid
- `403`: Only freelancers can create bids
- `404`: Job not found
- `401`: Unauthorized

---

### 5. List Bids for Job
**Endpoint:** `GET /functions/v1/bids-list?job_id=uuid&status=pending`

**Authentication:** Required (Job owner only)

**Query Parameters:**
- `job_id` (string): Required. The job ID
- `status` (string): Optional. Filter by bid status (pending, accepted, rejected)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "freelancer_id": "uuid",
      "amount": 4500,
      "proposal": "...",
      "delivery_time": 14,
      "status": "pending",
      "created_at": "2024-02-19T10:30:00Z",
      "freelancer": {
        "id": "uuid",
        "full_name": "Jane Smith",
        "avatar_url": "...",
        "skills": ["React", "Node.js"],
        "bio": "...",
        "hourly_rate": 50
      }
    }
  ]
}
```

**Error Responses:**
- `403`: Only the job owner can view bids
- `404`: Job not found
- `401`: Unauthorized

---

### 6. List Freelancer Bids
**Endpoint:** `GET /functions/v1/bids-freelancer?limit=20&offset=0&status=pending`

**Authentication:** Required (Current user only)

**Query Parameters:**
- `limit` (number): Max results per page (default: 20, max: 100)
- `offset` (number): Pagination offset (default: 0)
- `status` (string): Optional. Filter by bid status (pending, accepted, rejected)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "freelancer_id": "uuid",
      "amount": 4500,
      "proposal": "...",
      "delivery_time": 14,
      "status": "pending",
      "created_at": "2024-02-19T10:30:00Z",
      "job": {
        "id": "uuid",
        "title": "Build a React Dashboard",
        "budget": 5000,
        "status": "open",
        "client": {
          "id": "uuid",
          "full_name": "John Doe",
          "avatar_url": "..."
        }
      }
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Error Responses:**
- `401`: Unauthorized

---

### 7. Hire Freelancer
**Endpoint:** `POST /functions/v1/hire-freelancer`

**Authentication:** Required (Job owner only)

**Request Body:**
```json
{
  "bid_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Freelancer hired successfully",
  "job_id": "uuid",
  "freelancer_id": "uuid"
}
```

**Side Effects:**
- Job status changes to `in_progress`
- Selected bid status changes to `accepted`
- Other bids status changes to `rejected`
- Notifications sent to both freelancer and rejected bidders

**Error Responses:**
- `400`: Job is no longer open for hiring
- `403`: Only the job owner can hire
- `404`: Bid or job not found
- `401`: Unauthorized

---

## Notification Management

### 8. List Notifications
**Endpoint:** `GET /functions/v1/notifications-list?limit=20&offset=0&unread_only=false`

**Authentication:** Required

**Query Parameters:**
- `limit` (number): Max results per page (default: 20, max: 100)
- `offset` (number): Pagination offset (default: 0)
- `unread_only` (boolean): Show only unread notifications (default: false)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "bid_placed",
      "title": "New Bid Received",
      "message": "Jane Smith has bid ₹4500 on your job",
      "related_job_id": "uuid",
      "related_bid_id": "uuid",
      "is_read": false,
      "created_at": "2024-02-19T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Notification Types:**
- `bid_placed`: A freelancer placed a bid on a job
- `bid_accepted`: A freelancer's bid was accepted
- `job_completed`: A job was marked as completed

**Error Responses:**
- `401`: Unauthorized

---

### 9. Mark Notification as Read
**Endpoint:** `POST /functions/v1/notifications-read`

**Authentication:** Required

**Request Body:**
```json
{
  "notification_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

**Error Responses:**
- `403`: Cannot modify other users notifications
- `404`: Notification not found
- `401`: Unauthorized

---

## Payment (Placeholder)

### 10. Prepare Payment
**Endpoint:** `POST /functions/v1/payment-prepare`

**Authentication:** Required (Client only)

**Request Body:**
```json
{
  "job_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "transaction_id": "uuid",
  "payment_data": {
    "amount": 450000,
    "currency": "INR",
    "description": "Payment for job: Build a React Dashboard",
    "customer_name": "John Doe",
    "customer_email": "john@example.com"
  },
  "message": "Payment prepared successfully. Ready for Razorpay integration."
}
```

**Error Responses:**
- `400`: Payment can only be made for completed jobs
- `403`: Only the job owner can initiate payment
- `404`: Job or freelancer not found
- `401`: Unauthorized

---

## Security Features

All Edge Functions include:
1. **JWT Verification**: Every request validates the JWT token
2. **Role-Based Access Control**: Functions verify user role (client/freelancer)
3. **Ownership Verification**: Users can only access their own resources
4. **Input Validation**: All inputs are validated before database operations
5. **Error Handling**: Proper error messages for debugging
6. **CORS Support**: All functions support CORS preflight requests

---

## Client Usage Example

```typescript
import {
  createJob,
  listJobs,
  listBidsForJob,
  hireFreelancer,
  completeJob
} from './lib/edge-functions';

// Create a job
const job = await createJob({
  title: "Build API",
  description: "Create REST API...",
  budget: 5000,
  deadline: "2024-03-15",
  required_skills: ["Node.js", "PostgreSQL"]
});

// List all open jobs
const jobs = await listJobs(10, 0, 'open');

// View bids for a job
const bids = await listBidsForJob(job.id);

// Hire a freelancer
await hireFreelancer(bids.data[0].id);

// Complete job after work is done
await completeJob(job.id);
```

---

## Freelancer Usage Example

```typescript
import {
  createBid,
  listFreelancerBids,
  listNotifications
} from './lib/edge-functions';

// Place a bid on a job
const bid = await createBid({
  job_id: "job-uuid",
  amount: 4500,
  proposal: "I can deliver...",
  delivery_time: 14
});

// View my bids
const myBids = await listFreelancerBids(20, 0);

// Check notifications
const notifications = await listNotifications(20, 0, true); // unread only
```
