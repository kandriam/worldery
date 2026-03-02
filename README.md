---
title: "Worldery ReadMe"
---
# How To Run
## How to Run Frontend (Angular App)
1. cd into the main directory for this application ('worldery')

2. In one terminal window, (to build and serve the application) run
    `ng serve`

3. Then Follow the next steps in a different terminal window

## How to Run Backend (Django App)
1. cd into the main directory for this application ('worldery')
2. Create a virtual environment that will exist on your machine (only do this once, this is automatically gitignored. Creating a virtual environment might look differently depending on your OS, look it up if you get an error):
    `python -m venv venv`
3. Activate the virtual enviroment that you just created:
    `.\\venv\\Scripts\\activate`
    You can exit the virtual environment by entering:
    `deactivate`
4. Install the requirements (unless you make any changes to the code, you should only have to do this once):
    `python3 -m pip install -r requirements.txt`
5. Start a local server by running:
    `python manage.py runserver`
6. Open the link printed by the console

# How to access admin user interface
1. To enter the admin user interface, run the local server using:
    `python manage.py runserver`
2. Go to [127.0.0.1:8000/admin/](127.0.0.1:8000/admin/)

# OUTDATED
## How to Run FrontEnd (Angular App) Only Version
1. In the terminal window, run
    `yarn dev`
OR
1. In one terminal window, (to build and serve the application) run
    `ng serve`
2. In a separate terminal (to run the database servers), run
    `json-server --watch db.json`
2. Go to [http://localhost:4200/](http://localhost:4200/)


# Features
- Home page
    - World information
- Timeline
- World
- Characters
- Stories


# Tech Stack
## Front End
- Typescript, CSS/HTML
- Angular
- JSon server database
## Backend
- Python
- Django (SQLite)