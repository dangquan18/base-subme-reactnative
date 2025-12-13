# API Documentation for Subme App

This document provides a detailed specification for the API required to power the Subme mobile application. It outlines the necessary endpoints, data structures, and database modifications.

## Database Modifications

Before implementing the API, please apply the following changes to your database schema:

1.  **Create `user_interests` table:** To store user category preferences.

    ```sql
    CREATE TABLE `user_interests` (
      `user_id` BIGINT NOT NULL,
      `category_id` BIGINT NOT NULL,
      PRIMARY KEY (`user_id`, `category_id`),
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
    );
    ```

2.  **Add `auto_renew` to `subscriptions`:** To manage subscription auto-renewal.

    ```sql
    ALTER TABLE `subscriptions`
    ADD COLUMN `auto_renew` BOOLEAN DEFAULT FALSE;
    ```

3.  **Add `is_featured` to `plans`:** To mark plans as featured on the explore screen.

    ```sql
    ALTER TABLE `plans`
    ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
    ```

4.  **Add `avatar_url` to `users`:** To store user profile pictures.
    ```sql
    ALTER TABLE `users`
    ADD COLUMN `avatar_url` VARCHAR(255) DEFAULT NULL;
    ```

---

## API Endpoints

### 1. Auth (`/auth`)

#### **`POST /auth/signup`**

-   **Description:** Registers a new user.
-   **Request Body:**
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string"
    }
    ```
-   **Response:**
    ```json
    {
      "token": "your_jwt_token",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user"
      }
    }
    ```

#### **`POST /auth/login`**

-   **Description:** Authenticates a user and returns a JWT.
-   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
-   **Response:** (Same as signup)

#### **`GET /auth/me`**

-   **Description:** Retrieves the profile of the currently authenticated user.
-   **Authentication:** `Bearer Token` required.
-   **Response:**
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "0987654321",
      "address": "123 Main St, City",
      "date_of_birth": "1990-01-01",
      "avatar_url": "https://example.com/avatar.png"
    }
    ```

#### **`PATCH /auth/me`**

-   **Description:** Updates the profile of the currently authenticated user.
-   **Authentication:** `Bearer Token` required.
-   **Request Body:**
    ```json
    {
      "name": "John Doe Updated",
      "phone": "1122334455",
      "address": "456 New Ave, Town",
      "date_of_birth": "1991-02-02",
      "avatar_url": "https://example.com/new-avatar.png"
    }
    ```
-   **Response:** The updated user object.

#### **`GET /auth/interests`**

-   **Description:** Gets the user's selected interests (categories).
-   **Authentication:** `Bearer Token` required.
-   **Response:**
    ```json
    {
      "interests": [1, 3, 5]
    }
    ```

#### **`PUT /auth/interests`**

-   **Description:** Updates the user's interests.
-   **Authentication:** `Bearer Token` required.
-   **Request Body:**
    ```json
    {
      "interests": [1, 2, 4]
    }
    ```
-   **Response:**
    ```json
    { "message": "Interests updated successfully" }
    ```

---

### 2. Packages/Plans (`/packages`)

#### **`GET /packages`**

-   **Description:** Retrieves a paginated list of all available plans.
-   **Query Parameters:**
    -   `category` (string): Filter by category name.
    -   `q` (string): Search term.
    -   `page` (integer): Page number for pagination.
    -   `limit` (integer): Number of items per page.
-   **Response:**
    ```json
    {
      "packages": [
        {
          "id": 1,
          "name": "Netflix Premium",
          "price": 260000,
          "vendor_name": "Netflix",
          "category_name": "Giải trí",
          "imageUrl": "https://example.com/image.png"
        }
      ],
      "totalPages": 5
    }
    ```

#### **`GET /packages/:id`**

-   **Description:** Retrieves details for a single plan.
-   **Response:**
    ```json
    {
      "id": 1,
      "name": "Netflix Premium",
      "description": "Full description here.",
      "price": 260000,
      "duration_unit": "tháng",
      "duration_value": 1,
      "vendor": { "id": 1, "name": "Netflix" },
      "category": { "id": 1, "name": "Giải trí" },
      "imageUrl": "https://example.com/image.png"
    }
    ```

#### **`GET /packages/categories`**

-   **Description:** Retrieves all available categories.
-   **Response:**
    ```json
    [
      { "id": 1, "name": "Giải trí" },
      { "id": 2, "name": "Học tập" }
    ]
    ```

---

### 3. Subscriptions (`/subscriptions`)

#### **`GET /subscriptions`**

-   **Description:** Retrieves all subscriptions for the authenticated user.
-   **Authentication:** `Bearer Token` required.
-   **Response:**
    ```json
    [
      {
        "id": 1,
        "plan_name": "Netflix Premium",
        "vendor_name": "Netflix",
        "start_date": "2025-11-20",
        "end_date": "2025-12-20",
        "status": "active",
        "price": 260000,
        "imageUrl": "https://example.com/image.png"
      }
    ]
    ```

#### **`POST /subscriptions`**

-   **Description:** Creates a new subscription and initiates payment.
-   **Authentication:** `Bearer Token` required.
-   **Request Body:**
    ```json
    {
      "plan_id": 1,
      "payment_method": "VNPay"
    }
    ```
-   **Response:**
    ```json
    {
      "subscription_id": 123,
      "payment_url": "https://vnpay.vn/..."
    }
    ```

#### **`POST /subscriptions/:id/cancel`**

-   **Description:** Cancels an active subscription.
-   **Authentication:** `Bearer Token` required.
-   **Response:**
    ```json
    { "message": "Subscription cancelled successfully" }
    ```

---

### 4. Vendor Endpoints (`/vendor`)

These endpoints require the user to have the `vendor` role.

#### **`GET /vendor/dashboard`**

-   **Description:** Retrieves dashboard statistics for the vendor.
-   **Authentication:** `Bearer Token` (vendor role) required.
-   **Response:**
    ```json
    {
      "totalRevenue": 50000000,
      "newOrders": 150,
      "activePackages": 5
    }
    ```

#### **`GET /vendor/packages`**

-   **Description:** Retrieves all packages owned by the vendor.
-   **Authentication:** `Bearer Token` (vendor role) required.
-   **Response:**
    ```json
    [
        {
          "id": 1,
          "name": "My Awesome Package",
          "price": 100000,
          "status": "active",
          "subscribers": 120
        }
    ]
    ```
#### **`POST /vendor/packages`**

-   **Description:** Create a new package for the vendor.
-   **Authentication:** `Bearer Token` (vendor role) required.
-   **Request Body:**
    ```json
    { 
        "name": "New Package", 
        "description": "Details about the new package", 
        "price": 150000, 
        "category_id": 2, 
        "duration_unit": "tháng", 
        "duration_value": 1
    }
    ```
-   **Response:** The newly created package object.

#### **`GET /vendor/orders`**

-   **Description:** Retrieves all orders for the vendor's packages.
-   **Authentication:** `Bearer Token` (vendor role) required.
-   **Response:**
    ```json
    [
        {
          "id": 1,
          "customer_name": "Jane Doe",
          "plan_name": "My Awesome Package",
          "amount": 100000,
          "status": "active",
          "created_at": "2025-11-20T10:00:00Z"
        }
    ]
    ```