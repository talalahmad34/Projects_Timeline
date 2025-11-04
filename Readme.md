Projects Timeline & Status Tracker

<p align="center">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Python-3.8%252B-blue.svg%3Flogo%3Dpython%26logoColor%3Dwhite" alt="Python 3.8+">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Flask-black.svg%3Flogo%3Dflask%26logoColor%3Dwhite" alt="Flask">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg%3Flogo%3Dtailwind-css%26logoColor%3Dwhite" alt="Tailwind CSS">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/SQLite-003B57.svg%3Flogo%3Dsqlite%26logoColor%3Dwhite" alt="SQLite">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
</p>

A self-hosted internal project tracking and status management system designed to enhance transparency and communication. It provides a real-time, high-level overview of project statuses across different departments, complete with update histories and user attribution.

This tool was developed internally at Pakistan Engineering Services (Pvt.) Ltd. to solve the challenge of tracking multiple project statuses in a centralized, accessible way.

📚 Table of Contents

Overview

Key Features

Technology Stack

Getting Started

Prerequisites

Installation

Usage

Contributing

Author

License

Overview

Here is a look at the main project timeline interface.

(To add your own screenshot: take a screenshot of your app, add it to your project folder, and change the URL above to its filename, e.g., app_screenshot.png)

Key Features

Real-time Status Timeline: A color-coded (Green/Orange/Red) visual timeline for quick, at-a-glance project status checks.

Admin & User Roles:

Admin: Full CRUD (Create, Read, Update, Delete) capabilities for managing all projects and users.

User: Can view all projects and post new status updates to their assigned projects.

Complete Update History: Every status update is automatically timestamped and attributed to the user who posted it.

Centralized Reporting: Provides a single source of truth for project progress, eliminating the need for scattered emails and manual status reports.

🛠️ Technology Stack

This project is built with a modern, lightweight stack:

Backend: Python (using the Flask framework)

Database: SQLite (for simple, file-based storage)

Frontend: JavaScript (for dynamic updates)

Styling: Tailwind CSS (for a utility-first, responsive design)

WSGI Server (Internal): Waitress (a production-ready WSGI server)

🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

Prerequisites

Python 3.8 or newer

pip (Python package installer)

Installation

Clone the repository:
(Change YourUsername to your actual GitHub username after you publish it)

git clone [https://github.com/YourUsername/Projects_Timeline.git](https://github.com/YourUsername/Projects_Timeline.git)
cd Projects_Timeline


Create and activate a virtual environment:

# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate


Install the required dependencies:

pip install -r requirements.txt


Initialize the database:
(This step may vary depending on your app's setup. This assumes you are using Flask-Migrate. If not, you may need to run a db.create_all() script.)

flask db upgrade


Run the application:

flask run


Open your browser and navigate to http://127.0.0.1:5000

💡 Usage

Admin Portal: Access the admin dashboard (e.g., /admin) to create new projects and manage users.

User Updates: Log in as a standard user, navigate to a project, and post a new status update in the text-box.

Timeline View: The homepage displays the main timeline, which updates in real-time as new statuses are posted.

🤝 Contributing

Contributions are what make the open-source community such an amazing place. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

👤 Author

Talal Ahmad

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
