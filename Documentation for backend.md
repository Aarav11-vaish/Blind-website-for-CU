#  📘 API Documentation 

## User Profile API Documentation

## 1. Get User Profile

**API Name:** Get User Profile\
**Description:** Fetches the profile details of a user using their
`user_id`.

------------------------------------------------------------------------

### **Endpoint**

`GET /user/:user_id/profile`

### **Authentication Required**

No (Can be added if required)

------------------------------------------------------------------------

### **Request**

#### **Method**

`GET`

#### **Headers**

 Key            Value              Required   Description
 -------------- ------------------ ---------- ----------------
  Content-Type   application/json   Yes        Request format

#### **Path Parameters**

  Parameter   Type     Required   Description
  ----------- -------- ---------- -----------------------
  user_id     string   Yes        Unique ID of the user

------------------------------------------------------------------------

### **Response**

#### **Success Response**

**Status Code:** `200 OK`

``` json
{
  "user": {
    "email": "user@example.com",
    "user_id": "uuid-123",
    "user_name": "John Doe",
    "graduation_year": 2026,
    "isverified": true,
    "joinedCommunities": []
  }
}
```

#### **Error Responses**

  Code   Meaning                 When it happens
  ------ ----------------------- --------------------------
  404    Not Found               User does not exist
  500    Internal Server Error   Database or server issue

------------------------------------------------------------------------

## 2. Update User Profile

**API Name:** Update User Profile\
**Description:** Allows user to update `user_name` and
`graduation_year`.

------------------------------------------------------------------------

### **Endpoint**

`PUT /user/:user_id/profile/submit`

### **Authentication Required**

No (Can be added if required)

------------------------------------------------------------------------

### **Request**

#### **Method**

`PUT`

#### **Headers**

  Key            Value              Required   Description
  -------------- ------------------ ---------- ----------------
  Content-Type   application/json   Yes        Request format

#### **Path Parameters**

  Parameter   Type     Required   Description
  ----------- -------- ---------- -----------------------
  user_id     string   Yes        Unique ID of the user

#### **Body Parameters**

``` json
{
  "user_name": "New Name",
  "graduation_year": 2027
}
```

  Field             Type     Required   Description
  ----------------- -------- ---------- -------------------------
  user_name         string   No         Updated user name
  graduation_year   number   No         Updated graduation year

------------------------------------------------------------------------

### **Response**

#### **Success Response**

**Status Code:** `200 OK`

``` json
{
  "message": "Profile updated",
  "user": {
    "email": "user@example.com",
    "user_id": "uuid-123",
    "user_name": "New Name",
    "graduation_year": 2027,
    "isverified": true
  }
}
```

#### **Error Responses**

  Code   Meaning                 When it happens
  ------ ----------------------- -----------------------
  404    Not Found               User does not exist
  500    Internal Server Error   Server/database error

------------------------------------------------------------------------

## Notes

-   Only `user_name` and `graduation_year` can be updated.
-   No authentication added yet --- recommended for production.

------------------------------------------------------------------------

------------------------------------------------------------------------


# Community API Documentation

## Overview
This API manages communities in the Blind CU application, including fetching all communities, joining a community, and leaving a community.

---

# 1. Get All Communities  
**Endpoint:** `GET /community/getcommunities`  
**Authentication Required:** Yes  

### **Description**  
Fetches the list of all available communities.

---

## **Request**
### Method  
`GET`

### Headers
| Key | Value | Required | Description |
|------|---------|----------|-------------|
| Authorization | Bearer `<token>` | Yes | User authentication token |
| Content-Type | application/json | Yes | Request format |

### Path Params  
_None_

### Query Params  
_None_

---

## **Success Response**
**Status Code:** `200 OK`

```json
{
  "communities": [
    {
      "community_id": "CSE101",
      "name": "CSE Community",
      "description": "Computer Science Students",
      "icon": "📚",
      "memberCount": 120,
      "createdAt": "2025-01-10T14:00:00.000Z"
    }
  ]
}
```

---

## **Error Responses**
| Status | Meaning | When |
|--------|---------|------|
| 500 | Internal Server Error | Database error |

---

# 2. Join Community  
**Endpoint:** `POST /community/joincommunity`  
**Authentication Required:** Yes  

---

## **Description**  
Allows a user to join a specific community.

---

## **Request**
### Method  
`POST`

### Headers
| Key | Value | Required | Description |
|------|---------|----------|-------------|
| Authorization | Bearer `<token>` | Yes | Authentication token |
| Content-Type | application/json | Yes | Body format |

### **Body Parameters**
```json
{
  "user_id": "user123",
  "community_id": "CSE101"
}
```

| Field | Type | Required | Description |
|--------|--------|----------|-------------|
| user_id | string | Yes | ID of user joining |
| community_id | string | Yes | ID of the community |

---

## **Success Response**
**Status Code:** `200 OK`

```json
{
  "message": "Joined Community Successfully"
}
```

---

## **Error Responses**
| Status | Message | When |
|--------|-----------|------|
| 400 | User not found | Invalid user_id |
| 500 | Server Error | DB operation failed |

---

# 3. Leave Community  
**Endpoint:** `POST /community/leavecommunity`  
**Authentication Required:** Yes  

---

## **Description**  
Allows a user to leave a previously joined community.

---

## **Request**
### Method  
`POST`

### Body Parameters
```json
{
  "user_id": "user123",
  "community_id": "CSE101"
}
```

| Field | Type | Required | Description |
|--------|--------|-----------|-------------|
| user_id | string | Yes | User identifier |
| community_id | string | Yes | Community ID |

---

## **Success Response**
**Status Code:** `200 OK`

```json
{
  "message": "Left Community Successfully"
}
```

---

## **Error Responses**
| Status | Meaning | When |
|--------|---------|------|
| 400 | User not found | Invalid user_id |
| 500 | Server Error | DB update failure |

---


# Global Posts API Documentation

## Overview
This API manages the Global Feed system of Blind CU — posting globally, uploading images, fetching feed, and liking posts.

---

# 1. Create Global Post  
**Endpoint:** `POST /globalpost/createglobalposts`  
**Authentication Required:** Yes  
**Uploads:** Images (up to 4)

---

## Description  
Creates a new global post. Supports content + optional multiple images uploaded via Cloudinary.

---

## Request  
### Method  
`POST`

### Headers  
| Key | Value | Required | Description |
|------|---------|----------|-------------|
| Authorization | Bearer `<token>` | Yes | Auth token |
| Content-Type | multipart/form-data | Yes | Required for image upload |

### Body (multipart/form-data)
| Field | Type | Required | Description |
|--------|--------|----------|-------------|
| user_id | string | Yes | ID of posting user |
| randomName | string | Yes | Anonymized display name |
| content | string | Yes | Text content |
| images | file[] | No | Up to 4 images |

---

## Success Response  
**Status:** `201 Created`

```json
{
  "message": "Global post created successfully",
  "post": {
    "_id": "675adb21e021",
    "user_id": "u123",
    "randomName": "WildTiger92",
    "content": "Hello CU!",
    "images": [
      "https://res.cloudinary.com/.../image1.jpg"
    ],
    "likes": 0,
    "likedBy": [],
    "createdAt": "2025-01-10T14:00:00.000Z"
  }
}
```

---

## Errors  
| Status | Message | When |
|--------|-----------|------|
| 400 | Missing fields | Required data not provided |
| 500 | Server Error | DB/Cloudinary error |

---

---

# 2. Get Global Feed  
**Endpoint:** `GET /globalpost/getglobalposts`  
**Authentication Required:** Yes  

---

## Description  
Returns all global posts, sorted with newest first.

---

## Request  
### Method  
`GET`

### Headers  
Same as above.

---

## Success Response  
**Status:** `200 OK`

```json
{
  "posts": [
    {
      "_id": "675adb21e021",
      "user_id": "u123",
      "randomName": "WildTiger92",
      "content": "Hello CU!",
      "images": [],
      "likes": 10,
      "likedBy": ["u995", "u771"],
      "createdAt": "2025-01-10T14:00:00.000Z"
    }
  ]
}
```

---

## Errors  
| Status | Meaning |
|--------|---------|
| 500 | Server Error |

---

---

# 3. Like / Unlike Global Post  
**Endpoint:** `POST /globalpost/:id/like`  
**Authentication Required:** Yes  

---

## Description  
Likes or unlikes a global post depending on whether the user already liked it.

---

## Request  
### Method  
`POST`

### Path Params  
| Param | Type | Required | Description |
|--------|--------|----------|-------------|
| id | string | Yes | Global post ID |

### Body  
```json
{
  "user_id": "u123"
}
```

---

## Success Response  
**Status:** `200 OK`

```json
{
  "message": "Liked",
  "likes": 11
}
```

or  

```json
{
  "message": "Unliked",
  "likes": 10
}
```

---

## Errors  
| Status | Message | When |
|--------|-----------|------|
| 404 | Post not found | Invalid post ID |
| 500 | Internal server error | DB operation failed |

---

# Schema Reference  

## GlobalPost Schema
```js
{
  user_id: String,
  randomName: String,
  content: String,
  images: [String],
  likes: Number,
  likedBy: [String],
  commentsCount: Number,
  comments: [
    {
      user_id: String,
      randomName: String,
      content: String
    }
  ]
}
```

---

# Notes  
- Cloudinary image uploads handled via `multer` (`upload.array("images", 4)`).
- `images` field stores Cloudinary URLs.
- Global Feed is separate from Community Posts.
- All posts are anonymized using `randomName`.

---

# Related Endpoints  
- `POST /community/:id/post` — Create a community post  
- `GET /posts` — Global feed for all communities  

---

# Community posting messages 


### community posting system uses Socket.IO for real-time messaging within communities. Messages are stored in MongoDB and broadcast to all users in that community room.
- `How It Works:`
1. Join a Community (Socket Event)
javascriptsocket.emit("join_community", community_id);

User joins a Socket.IO room named after the community_id
All messages sent to this community will be received by users in this room

2. Send a Message (Socket Event)
   
```javascriptsocket.emit("send_message", {
    community_id: "placements",
    user_id: "user123",
    randomName: "CoolPanda",
    message: "Hey everyone!",
    images: ["base64_image_data"] // optional
});
```
Backend Process:

Uploads images to Cloudinary (if provided)
Saves message to MongoDB
Broadcasts message to all users in the community room via received_message event

```
3. Receive Messages (Socket Event - Client Side)
javascriptsocket.on("received_message", (newMessage) => {
    console.log(newMessage);
    // Display message in UI
});

```
```

#### **4. Fetch Message History (REST API)**
```
GET /communitypost/:community_id/messages
Authorization: Bearer <token>






# Global Post Comment API Documentation

## Overview
This API allows users to add comments to **Global Posts**.  
Comments are anonymous (via `randomName`) and are stored inside the global post document.

---

## Endpoint
**POST** `/globalpost/:id/comment`

---

## Authentication Required
✅ Yes (JWT via `authmiddleware`)

---

## Description
Adds a new comment to a global post identified by its post ID.  
Each comment updates the `commentsCount` automatically.

---

## Request

### Method
`POST`

### Headers
| Key | Value | Required | Description |
|-----|------|----------|-------------|
| Authorization | Bearer `<token>` | Yes | User authentication token |
| Content-Type | application/json | Yes | Request body format |

---

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Global post ID |

---

### Body Parameters
```json
{
  "user_id": "u123",
  "randomName": "SilentEagle",
  "comment": "This is a comment"
}
```

| Field | Type | Required | Description |
|------|------|----------|-------------|
| user_id | string | Yes | ID of the commenting user |
| randomName | string | Yes | Anonymous display name |
| comment | string | Yes | Comment text |

---

## Success Response

### Status Code
`201 Created`

### Sample Response
```json
{
  "message": "Comment added successfully",
  "comment": {
    "user_id": "u123",
    "randomName": "SilentEagle",
    "content": "This is a comment"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "comment cannot be empty"
}
```

### 404 Not Found
```json
{
  "message": "Post not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server Error"
}
```

---

## Schema Reference

### Comment Subdocument
```js
{
  user_id: String,
  randomName: String,
  content: String,
  createdAt: Date
}
```

---

## Notes
- Comments are embedded inside the `GlobalPost` document.
- `commentsCount` is recalculated after every comment.
- No image support for comments (text-only).
- Comments are returned in chronological order (oldest → newest).

---

## Related Endpoints
- `POST /globalpost/createglobalposts`
- `GET /globalpost/getglobalposts`
- `POST /globalpost/:id/like`

---

## Example (cURL)

```bash
curl -X POST https://api.example.com/globalpost/123/comment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "u123",
    "randomName": "SilentEagle",
    "comment": "Nice post!"
  }'
```


# Community post like docs.