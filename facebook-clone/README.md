# Facebook Clone Project

This project is a web application that mimics the interface of Facebook, allowing users to log in, sign up, and interact with a simulated news feed. It is built using Node.js and Express for the backend, and HTML, CSS, and JavaScript for the frontend.

## Project Structure

```
facebook-clone
├── public
│   ├── css
│   │   └── style.css
│   ├── js
│   │   ├── login.js
│   │   ├── signup.js
│   │   └── home.js
│   ├── index.html
│   ├── signup.html
│   └── home.html
├── server.js
├── database.sqlite
├── package.json
└── README.md
```

## Features

- **Login Page**: Users can enter their email and password to access their accounts.
- **Signup Page**: New users can create an account by providing their full name, email, password, date of birth, and gender.
- **Home Page**: After logging in, users can post statuses and view a simulated news feed.
- **Client-side Validation**: Ensures that user inputs meet specified criteria before submission.
- **Server-side Validation**: Validates user inputs on the server to enhance security.
- **SQLite Database**: Stores user accounts and hashed passwords securely.

## Installation Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd facebook-clone
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node server.js
   ```

4. Open your browser and navigate to `http://localhost:3000` to access the application.

## Deployment

To deploy the application on a free hosting platform, follow these general steps:

1. Choose a hosting provider that supports Node.js (e.g., Heroku, Vercel).
2. Follow the provider's instructions to set up a new application.
3. Push your code to the hosting provider's repository.
4. Ensure that your database is set up correctly on the hosting platform.
5. Start the application as per the provider's guidelines.

## Technologies Used

- Node.js
- Express
- SQLite
- bcrypt
- HTML
- CSS
- JavaScript

## License

This project is open-source and available for modification and distribution.