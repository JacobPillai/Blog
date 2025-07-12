# Horizone - A Modern Travel Blog

This repository contains the source code for Horizone, a modern and responsive travel blog application. The project is built with HTML, CSS, and vanilla JavaScript, focusing on a clean user interface and a great user experience.

## Live Demo

You can view the live demo of the application here:
**https://jacobpillai.github.io/Blog/**

## Features

- **Responsive Design**: The application is fully responsive and works on all devices.
- **Dynamic Content**: The blog section features dynamic filtering by category and pagination.
- **User Authentication**: Front-end templates for Login, Signup, and a User Profile page.
- **Booking Pages**: Styled forms for booking Hotels, Flights, Trains, and Car Rentals.
- **Interactive UI**: Smooth transitions and a clean, modern design.

## Development Journey

This project was developed iteratively, focusing on building a solid front-end foundation before moving to more complex features.

### 1. Initial Setup & Design
- The project began with a well-structured file system for HTML, CSS, and JavaScript.
- The initial design was based on a visual reference, with significant effort put into matching the layout, typography, and color scheme.
- Placeholders for blog posts and other content were used to populate the layout for styling purposes.

### 2. Core Pages Implementation
- All secondary pages (`Login`, `Signup`, `Hotel`, `Flight`, `Train`, `Travel`, `Car Rental`) were created and linked from the main navigation.
- Each booking page was equipped with a styled, functional form to capture user input.

### 3. Dynamic Features
- **Category Filtering**: The blog posts on the main page can be filtered by category. Clicking a category button dynamically shows or hides relevant posts.
- **Pagination**: The blog section is paginated, with page links generated dynamically based on the number of posts (and the current filter). This ensures a clean and organized browsing experience.

### 4. User Authentication Flow
- The Login and Signup pages were created with HTML forms and styled for a clean user experience.
- Basic front-end validation was added via JavaScript to simulate form submission.
- Upon a successful "login," users are redirected to a static profile page template.

## Getting Started

To run this project locally, simply clone the repository and open the `index.html` file in your browser.

```bash
git clone https://github.com/JacobPillai/Blog.git
cd Blog
# Open index.html in your browser
```

## Detailed Roadmap: From Front-End to Full-Stack Blog Platform

This roadmap is divided into two major phases. Phase 1 focuses on high-impact features we can add to the existing front-end without a backend. Phase 2 outlines the transition to a full-stack application with a server and database to unlock dynamic, user-driven content.

---

### Completed Features for the blog app
- **Individual Blog Post Pages**: Users can now click a post on the homepage to read the full article on its own dedicated page.
- **Client-Side Search**: A search bar on the homepage now allows users to filter posts in real-time. This was implemented using Fuse.js for fuzzy search capabilities.

---

### Phase 1: Immediate Front-End Enhancements (No Backend Required) Plan

This phase is about adding significant value and core blog features using only HTML, CSS, and client-side JavaScript.

#### 1. Enhanced "Persistent" Profile Page
*   **Goal**: Create a more personal and continuous experience by using the browser's `localStorage` to "remember" a user's name after they sign up or log in.
*   **Implementation Steps**:
    *   **Save User Data**: After a user fills out the signup or login form, we'll use `localStorage.setItem('username', ...)` to save their name directly in their browser.
    *   **Personalize the Profile**: When the `profile.html` page loads, it will check `localStorage` for a saved username. If one is found, it will dynamically update the page to display a personalized welcome message, like "Welcome, Theodore!".

#### 2. Dark/Light Mode Toggle
*   **Goal**: Introduce a modern UI feature that improves accessibility and user comfort by allowing them to switch between a light and dark theme.
*   **Implementation Steps**:
    *   **Add a UI Toggle**: We'll add a theme-switcher button (e.g., with a sun/moon icon) to the main navigation.
    *   **Create Dark Theme Styles**: In `style.css`, we will define a set of styles for the dark theme that will be applied when a `dark-mode` class is added to the `<body>`.
    *   **Enable Toggling**: A JavaScript function will toggle this `dark-mode` class on the body when the button is clicked.
    *   **Persist Preference**: We'll use `localStorage` to save the user's chosen theme, so their preference is remembered on their next visit.

---

### Phase 2: Full-Stack Transformation (The Major Leap)

This phase marks the evolution into a dynamic web application by adding a backend server and a database. This is how we'll implement the core features from your list, like user-generated content and comments.

#### 1. Backend Setup & Real User Authentication
*   **Goal**: Build a secure and robust system for users to sign up, log in, and manage their accounts.
*   **Implementation Steps**:
    *   **Choose Tech Stack**: We'll select a backend technology (e.g., **Node.js with Express**) and a database (e.g., **PostgreSQL** or **MongoDB**).
    *   **Build an API**: We will develop API endpoints for user registration, login, and profile management.
    *   **Ensure Security**: This is critical. We'll implement password hashing (e.g., with `bcrypt`) to protect user credentials and use JSON Web Tokens (JWT) for secure session management.
    *   **Connect Front-End to Backend**: The login and signup forms will be updated to make API calls to our new server to authenticate users instead of just simulating it.

#### 2. Full Content Management System (CMS)
*   **Goal**: Empower users to create, read, update, and delete (CRUD) their own blog posts through a user-friendly interface.
*   **Implementation Steps**:
    *   **Design Database Schema**: We'll create a database structure for posts, linking each post to a `userId`.
    *   **Build Content API**: We will create the necessary API endpoints for all CRUD operations on posts.
    *   **Integrate a Rich Text Editor**: We'll add a WYSIWYG (What You See Is What You Get) editor like **TinyMCE** or **Quill.js** to the post creation page, allowing users to format text, add headings, create lists, and more.
    *   **Handle Image Uploads**: We'll implement a system for users to upload images with their posts. This involves processing files on the server and storing them either locally or on a cloud service like AWS S3.

#### 3. Interactive Engagement Features
*   **Goal**: Build a community around the content by enabling comments and subscriptions.
*   **Implementation Steps**:
    *   **Comments System**: We will add a `comments` table to our database and build API endpoints to handle creating and fetching comments for each post. The front-end will be updated to display comments and allow logged-in users to post new ones.
    *   **Email Subscriptions**: The subscription form will be connected to an API endpoint that saves emails to the database. To actually send newsletters, we would integrate a third-party email service like **SendGrid** or **Mailgun**.

## Photo Credits
- **Lisa**: https://www.pexels.com/photo/eyeglasses-beside-bowl-of-food-and-magazine-on-table-1438190/
- **Benni Fish**: https://www.pexels.com/photo/display-rack-with-newspapers-on-street-12418421/
- **Michael D Beckwith**: https://www.pexels.com/photo/elegant-historical-library-interior-in-scotland-31488463/
- **Unsplash**: Various images used for blog post placeholders.
