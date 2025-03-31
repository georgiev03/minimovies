
1. Project Overview

The goal of this project is to develop a web-based movie application that allows users to browse and watch short videos, while administrators manage and upload content. The application will leverage Supabase as the backend for database management and authentication. Users will be able to register, log in, and stream available videos, while admins will have access to content management tools.

Key functionalities of the project include:

User Authentication: Registration and login via a popup menu using Supabase Auth.

Admin & User Areas: Users can watch movies, while admins manage and upload content.

Video Management: Admins can upload short videos that will be stored in a Supabase database.

Browsing & Viewing: Users can explore available videos categorized by genre.

User Profiles: Each user will have a profile for personalized recommendations.

Responsive Design: The application should be optimized for both desktop and mobile devices.

The final deliverable is a full-stack web application built using modern web technologies, with a frontend in React.js and a backend powered by Supabase.

2. Functional Requirements

2.1. Authentication

Register & Login: Users should be able to create an account and log in using a popup menu.

Login Menu: When clicking on login, users should have an option to register.

Registration Form: Should include fields for email, password, and confirm password.

Supabase Auth: The authentication system should be implemented using Supabase's built-in authentication services.

Session Management: Users should remain logged in across sessions unless they explicitly log out.

2.2. Admin & User Areas

User Area: Users can browse and watch available movies.

Admin Area: Admins can upload, edit, and manage videos.

Role-Based Access: Users can only watch content, while admins have upload and management privileges.

2.3. Video Management (Admin Only)

Upload Movies: Admins should be able to upload short movies with titles, descriptions, and categories.

Database Storage: Video metadata and user data will be stored in Supabase's PostgreSQL database.

Video Streaming: Videos should be streamed directly from Supabase Storage.

Content Moderation: Admins can edit or remove uploaded videos.

2.4. Browsing & Viewing (User Only)

Homepage Feed: A list of available movies should be displayed.

Categorization: Movies should be tagged with genres to allow filtering.

Search Functionality: Users should be able to search for movies based on titles or categories.

Video Playback: Users should be able to stream movies seamlessly.

2.5. User Profiles

Personalized Recommendations: Users should get suggested movies based on watch history.

Watch History: Users should be able to view previously watched movies.

Profile Settings: Users should have options to update their profile details.

2.6. Responsive UI

Mobile & Desktop Compatibility: The application should be fully responsive, ensuring a seamless experience across different devices.

3. Tech Stack

Frontend: React.js with Tailwind CSS for styling.

Backend: Supabase (PostgreSQL database & authentication).

Video Storage: Supabase Storage for hosting video files.

Deployment: Vercel or Netlify for frontend deployment, Supabase for backend hosting.

4. API Endpoints

4.1. Authentication Endpoints

POST /auth/register

Input: JSON payload with { email, password, confirm_password }.

Output: Success message or error response.

POST /auth/login

Input: JSON payload with { email, password }.

Output: Authentication token and user data.

4.2. Video Endpoints

POST /admin/videos/upload (Admin Only)

Input: Video file with metadata (title, description, category).

Output: Video ID and success response.

GET /videos/{id} (User Only)

Input: Video ID as URL parameter.

Output: Video data including streaming link.

GET /videos (User Only)

Input: Optional query parameters for filtering (e.g., category).

Output: List of available movies.

5. Additional Features (Optional)

Like & Comment System: Users can like and comment on movies.

Admin Panel: A dashboard for managing uploaded content.

Analytics: Track movie views and user engagement.

