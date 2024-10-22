# Backend API Documentation
## Auth Endpoints


Endpoint 1: `POST` /api/auth/signup
```bash
Description: 
For traditional sign up using email and password authentication
```
Send this in body
```json
{
    name:String, 
    email:String, 
    password:String, 
    username:String, 
    profilePicture:[URL:String]
}
```

Endpoint 2: `POST` /api/auth/google-signup
```bash
Description: 
For sign up using google oauth authentication
```
Either send it in body or as Authorization : Bearer token
Get this jwt token from google oauth authentication
```json
{
    token:String
}
```

Endpoint 3: `POST` /api/auth/signin
```bash
Description: 
For traditional sign in using email and password authentication
```
send this in body
```json

{
    email:String,
    password:String
}
```


Endpoint 4: `POST` /api/google-signin
```bash
Description: 
For google sign in using google oauth authentication
```
Either send it in body or as Authorization : Bearer token
Get this jwt token from google oauth authentication
```json
{
    token:String
}
```

Endpoint 5: `POST` /api/forgot
```bash
Description: 
For sending password token to mail for reset password
```

Endpoint 6: `POST` /api/reset/:token
```bash
Description: 
For resetting password using token from "/api/forgot"
```