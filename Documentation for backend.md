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
