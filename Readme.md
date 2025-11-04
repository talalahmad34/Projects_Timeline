# PES Projects Timeline

A self-hosted internal project tracking and status management system developed to enhance transparency, communication, and reporting of internal projects across departments.

## Tech Stack

* **Backend:** Python (Flask)
* **Database:** SQLite
* **Frontend:** JavaScript & Tailwind CSS
* **Deployment (Internal):** Waitress WSGI Server

## Features

* Admin-only portal for project creation and editing.
* General user access for status updates.
* Color-coded project timeline view (Green/Orange/Red) for quick status checks.
* Automatic timestamps and user attribution for all updates.

## Installation

1.  Clone the repository:
    ```sh
    git clone [https://github.com/your-username/Projects_Timeline.git](https://github.com/your-username/Projects_Timeline.git)
    cd Projects_Timeline
    ```

2.  Create and activate a virtual environment:
    ```sh
    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install the required dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4.  Initialize the database (if applicable - adjust command as needed):
    ```sh
    flask db init
    flask db migrate -m "Initial migration"
    flask db upgrade
    ```

## Usage

Run the Flask application:

```sh
flask run