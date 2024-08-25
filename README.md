# Detoxy Fusion
[Live Link]([URL](https://detoxy-fusion-1.onrender.com/))

Detoxy Fusion is a modern chat application that combines real-time messaging with AI-based toxicity filtering, image generation, and a flexible, user-friendly interface. It ensures user safety while providing a premium chat experience with various features like feed sections, JWT-based route protection, and more.


## Features

- **Live Chat App**: Engage in real-time conversations with other users.
- !["Detoxy Fusion Login Interface")](https://res.cloudinary.com/drvntsbpo/image/upload/v1724586718/2_jwyuaj.jpg)
- **Filter Detection**: Automatically detects and filters toxic messages.
  e.g.  
  
        They killed my dreams ✅ (Undetcted)
        
        I wanna kill uh ❌ (Detected)
- **Image Generation**: High Quality AI-powered image generation based on user prompts.
- **Flexible UI**: A sleek, responsive, and customizable user interface.
- **Recreate & Feed Section**: Share and view posts in the community feed.
- !["Detoxy Fusion Feed Interface")](https://res.cloudinary.com/drvntsbpo/image/upload/v1724586369/1_cas15q.jpg)
- **User Management**: Create and manage user accounts.
- **JWT-Based Route Protection**: Secure routes and login authentication with JSON Web Tokens.

## Technologies Used

- **Backend**: Express.js, Node.js, MongoDB, Google OAuth, Gradio, JWT, Nodemailer, WebSockets
- **Frontend**: React, TailwindCSS

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files in both `/server` and `/client` directories:

### Server Environment Variables


- `MONGODB_URI`="your_mongodb_uri"
- `RENDER_BACKEND_URL`="your_render_backend_url"
- `JWT_EXPIRE`="your_jwt_expiration_time"
- `JWT_SECRET`="your_jwt_secret"
- `SMTP_HOST`="smtp.gmail.com"
- `SMTP_MAIL`="your_email_address"
- `SMTP_PASSWORD`="your_smtp_password"
- `SMTP_PORT`="465 || 587"
- `SMTP_SERVICE`="gmail"


### Client Environment Variables

- `VITE_BACKEND_URL`="your_backend_url"
- `VITE_WEBSOCKET_URL`="your_websocket_url"
- `VITE_REACT_APP_GOOGLE_API_TOKEN`="your_google_api_token"

## Usage

1. Run both the backend and frontend as described in the installation section.
2. Access the chat application via your web browser.
3. Sign up or log in using Google OAuth.
4. Start chatting, generate images, and interact with the community.

## Frontend Setup
1. ``` cd client ```
2. ```npm install```
3. ```npm run build```
4. ```npm run dev```

## Backend Setup
1. ``` cd server ```
2. ```npm install```
3. ```node index.js```

## To Do

- [ ] Implement video calling and voice chats feature
- [ ] Add user profile editing functionality
- [ ] Allow users to add and remove friends
- [ ] Enhance AI capabilities for better filtering
- [ ] Improve performance and speed of the chat app

## Completed To Do

- [x] Set up real-time chat functionality
- [x] Implement AI-based toxicity filtering
- [x] Integrate image generation based on user prompts
- [x] Design and develop a flexible, responsive UI
- [x] Add community feed section
- [x] Implement JWT-based route protection

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## Contact

If you have any questions or feedback, please feel free to reach out sauravmaheshwari8@gmail.com

Enjoy using **Detoxy Fusion**!
