### Real-Time Chat Application Backend

This repository contains the backend code for a real-time chat application built using the MERN stack. The backend is responsible for managing user authentication, message storage, online status management, and integration with third-party APIs for language processing.

### Features

- **User Authentication:** Users can register and log in using email and password. JWT (JSON Web Tokens) are used for managing authentication.
- **Chat Functionality:** Users can send and receive real-time messages using Socket.io for efficient communication.
- **Message Storage:** All messages are stored in MongoDB, ensuring they are retrievable for conversation between users.
- **User Online Status:** Users can set their status as 'AVAILABLE' or 'BUSY'. The backend handles online status management and allows users to chat only when they are online.
- **LLM Integration:** Integration with third-party Language Model APIs allows automatic response generation when a user is 'BUSY'. If the recipient is 'BUSY', an appropriate response is generated using the Language Model API. If the API does not respond within 10 seconds, a standard message indicating the user is unavailable is sent.

### Technologies Used

- **Node.js:** Backend server runtime environment.
- **Express.js:** Web application framework for Node.js used for routing and middleware.
- **MongoDB:** NoSQL database for storing user data and messages.
- **Socket.io:** Library for real-time, bidirectional communication between web clients and servers.
- **JWT (JSON Web Tokens):** Secure authentication mechanism.
- **Prisma:** ORM (Object-Relational Mapping) tool for interacting with the database.
- **Third-Party Language Model API:** Integration with third-party APIs for language processing.



### Setup and Run Instructions

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Install Dependencies:**
   ```bash
   cd real-time-chat-backend
   npm install
   ```

3. **Set Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add the following environment variables to the `.env` file:
     ```plaintext
     DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority"
     PORT=5000
     SERVER_ORIGIN="http://localhost:5000"
     CLIENT_ORIGIN="http://localhost:3000"
     GOOGLE_GEMINI_API_KEY=<your-google-gemini-api-key>
     JWT_SECRET=<your-jwt-secret>
     ```

4. **Start the Server:**
   ```bash
   npm start
   ```




### User Routes

#### 1. POST /status/available

- **Description:** Set user status as 'AVAILABLE'.
- **Expected Input:**
  - Request Body:
    ```json
    {
      "userId": "<user-id>"
    }
    ```
- **Logic:**
  - Updates the status of the user with the specified `userId` to 'AVAILABLE'.
  - Returns the updated user object with the new status.

#### 2. POST /status/busy

- **Description:** Set user status as 'BUSY'.
- **Expected Input:**
  - Request Body:
    ```json
    {
      "userId": "<user-id>"
    }
    ```
- **Logic:**
  - Updates the status of the user with the specified `userId` to 'BUSY'.
  - Returns the updated user object with the new status.

### Message Routes

#### 1. GET /get-initial-users/:userId

- **Description:** Retrieve initial users with messages for a given user.
- **Expected Input:**
  - Path Parameters:
    - `userId`: ID of the user for whom initial users with messages are to be retrieved.
- **Logic:**
  - Retrieves initial users with messages associated with the specified `userId`.
  - Includes sent and received messages for the user.
  - Returns an array of users with their associated messages and online status.

#### 2. POST /add-message

- **Description:** Add a new message to the database.
- **Expected Input:**
  - Request Body:
    ```json
    {
      "message": "<message-content>",
      "to": "<receiver-id>",
      "from": "<sender-id>"
    }
    ```
- **Logic:**
  - Adds a new message to the database with the specified content (`message`), sender ID (`from`), and receiver ID (`to`).
  - Checks the status of the receiver:
    - If the receiver is 'BUSY' or offline, generates an appropriate response using a language model API.
    - If the API does not respond within 10 seconds, sends a standard message indicating the user is unavailable.
  - Emits the received message to the sender using Socket.io.
  - Returns the newly created message object.

#### 3. GET /get-messages/:from/:to

- **Description:** Retrieve messages between two users.
- **Expected Input:**
  - Path Parameters:
    - `from`: ID of the sender.
    - `to`: ID of the receiver.
- **Logic:**
  - Retrieves messages exchanged between the sender (`from`) and receiver (`to`).
  - Marks unread messages as 'read' and updates the database.
  - Returns an array of messages between the specified sender and receiver.

### Auth Routes

#### 1. POST /check-user

- **Description:** Check if a user exists based on email.
- **Expected Input:**
  - Request Body:
    ```json
    {
      "email": "<user-email>"
    }
    ```
- **Logic:**
  - Checks if a user with the specified email exists in the database.
  - Returns a response indicating whether the user exists or not.

#### 2. POST /onboard

- **Description:** Create a new user and onboard them.
- **Expected Input:**
  - Request Body:
    ```json
    {
      "name": "<user-name>",
      "email": "<user-email>",
      "password": "<user-password>",
      "about": "<user-about>"
    }
    ```
- **Logic:**
  - Creates a new user with the provided name, email, password, and about information.
  - Hashes the password for security.
  - Generates a JWT token for authentication.
  - Returns a response indicating successful user creation along with the JWT token.

#### 3. POST /login-user

- **Description:** Log in an existing user.
- **Expected Input:**
  - Request Body:
    ```json
    {
      "email": "<user-email>",
      "password": "<user-password>"
    }
    ```
- **Logic:**
  - Verifies the user's credentials (email and password) against the stored data in the database.
  - If the credentials are valid, generates a JWT token for authentication.
  - Returns a response indicating successful login along with the JWT token.

#### 4. GET /get-all-users

- **Description:** Retrieve all users.
- **Expected Input:**
  - Authorization Header: JWT token for authentication.
- **Logic:**
  - Retrieves all users from the database.
  - Groups users by initial letters of their names.
  - Returns an object containing users grouped by initial letters.



Sure, here are sample inputs and outputs for each route:

### User Routes

#### 1. POST /status/available

- **Sample Input:**
  - Request Body:
    ```json
    {
      "userId": "123456789"
    }
    ```
- **Sample Output:**
  - Response Body:
    ```json
    {
      "id": "123456789",
      "email": "user@example.com",
      "name": "John Doe",
      "about": "Hey there!, i am using chat app.",
      "status": "available"
    }
    ```

#### 2. POST /status/busy

- **Sample Input:**
  - Request Body:
    ```json
    {
      "userId": "123456789"
    }
    ```
- **Sample Output:**
  - Response Body:
    ```json
    {
      "id": "123456789",
      "email": "user@example.com",
      "name": "John Doe",
      "about": "Hey there!, i am using chat app.",
      "status": "busy"
    }
    ```

### Message Routes

#### 1. GET /get-initial-users/:userId

- **Sample Input:**
  - Path Parameters:
    - `userId`: "123456789"
- **Sample Output:**
  - Response Body:
    ```json
    {
      "users": [
        {
          "userId": "987654321",
          "data": {
            "id": "987654321",
            "email": "friend@example.com",
            "name": "Jane Smith",
            "about": "Nice to meet you!",
            "status": "available",
            "sentMessages": [
              {
                "id": "1",
                "message": "Hello, how are you?",
                "senderId": "987654321",
                "receiverId": "123456789",
                "type": "text",
                "messageStatus": "sent",
                "createdAt": "2024-05-10T12:00:00Z"
              }
            ],
            "receivedMessages": [
              {
                "id": "2",
                "message": "I'm doing well, thanks!",
                "senderId": "123456789",
                "receiverId": "987654321",
                "type": "text",
                "messageStatus": "sent",
                "createdAt": "2024-05-10T12:05:00Z"
              }
            ],
            "totalUnreadMessages": 0
          }
        }
      ],
      "onlineUsers": ["987654321"]
    }
    ```

#### 2. POST /add-message

- **Sample Input:**
  - Request Body:
    ```json
    {
      "message": "Hi there!",
      "to": "987654321",
      "from": "123456789"
    }
    ```
- **Sample Output:**
  - Response Body:
    ```json
    {
      "id": "3",
      "message": "Hi there!",
      "senderId": "123456789",
      "receiverId": "987654321",
      "type": "text",
      "messageStatus": "sent",
      "createdAt": "2024-05-10T12:10:00Z"
    }
    ```

#### 3. GET /get-messages/:from/:to

- **Sample Input:**
  - Path Parameters:
    - `from`: "123456789"
    - `to`: "987654321"
- **Sample Output:**
  - Response Body:
    ```json
    {
      "status": true,
      "messages": {
        "allMessages": [
          {
            "id": "1",
            "message": "Hello, how are you?",
            "senderId": "987654321",
            "receiverId": "123456789",
            "type": "text",
            "messageStatus": "read",
            "createdAt": "2024-05-10T12:00:00Z"
          },
          {
            "id": "2",
            "message": "I'm doing well, thanks!",
            "senderId": "123456789",
            "receiverId": "987654321",
            "type": "text",
            "messageStatus": "read",
            "createdAt": "2024-05-10T12:05:00Z"
          },
          {
            "id": "3",
            "message": "Hi there!",
            "senderId": "123456789",
            "receiverId": "987654321",
            "type": "text",
            "messageStatus": "sent",
            "createdAt": "2024-05-10T12:10:00Z"
          }
        ],
        "unreadMessages": []
      }
    }
    ```

### Auth Routes

#### 1. POST /check-user

- **Sample Input:**
  - Request Body:
    ```json
    {
      "email": "user@example.com"
    }
    ```
- **Sample Output:**
  - Response Body (User Found):
    ```json
    {
      "msg": "user found",
      "status": true,
      "data": {
        "id": "123456789",
        "email": "user@example.com",
        "name": "John Doe",
        "about": "Hey there!, i am using chat app.",
        "status": "available"
      }
    }
    ```
  - Response Body (User Not Found):
    ```json
    {
      "msg": "user not found",
      "status": false
    }
    ```

#### 2. POST /onboard

- **Sample Input:**
  - Request Body:
    ```json
    {
      "name": "John Doe",
      "email": "user@example.com",
      "password": "password123",
      "about": "Hey there!, i am using chat app."
    }
    ```
- **Sample Output:**
  - Response Body:
    ```json
    {
      "message": "user created successfully",
      "status": true,
      "user": {
        "id": "123456789",
        "email": "user@example.com",
        "name": "John Doe",
        "about": "Hey there!, i am using chat app.",
        "status": "available"
      },
      "token": "<JWT-token>"
    }
    ```

#### 3. POST /login-user

- **Sample Input:**
  -Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
- **Sample Output:**
  - Response Body (Successful Login):
    ```json
    {
      "msg": "user found",
      "status": true,
      "user": {
        "id": "123456789",
        "email": "user@example.com",
        "name": "John Doe",
        "about": "Hey there!, i am using chat app.",
        "status": "available"
      },
      "token": "<JWT-token>"
    }
    ```
  - Response Body (Invalid Credentials):
    ```json
    {
      "msg": "password incorrect",
      "status": false
    }
    ```

#### 4. GET /get-all-users

- **Sample Output:**
  - Response Body:
    ```json
    {
      "status": true,
      "users": {
        "A": [
          {
            "id": "123456789",
            "email": "user@example.com",
            "name": "John Doe",
            "about": "Hey there!, i am using chat app.",
            "status": "available"
          },
          {
            "id": "987654321",
            "email": "friend@example.com",
            "name": "Jane Smith",
            "about": "Nice to meet you!",
            "status": "available"
          }
        ],
        "B": [
          {
            "id": "654321987",
            "email": "another@example.com",
            "name": "Alice",
            "about": "Hello!",
            "status": "busy"
          }
        ]
      }
    }
    ```

