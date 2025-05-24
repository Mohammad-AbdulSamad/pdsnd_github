### Date created
5/24/2025

# US Bikeshare Data Analysis

This project is a Flask-based web application for analyzing US bikeshare data. It provides insights into time, station, trip, and user statistics based on user-selected filters.

## 🔍 Features
- Upload and analyze bikeshare CSV data by city

- Optional filtering by month and/or day of week

- View a paginated data table (5 rows per page) displaying all records for the selected city — not affected by the time filters

- Interactive charts (JavaScript-based) for key statistics:

- Most frequent start and end stations

- Most common trips

- Trip durations

- User demographics

- Paginated data table (5 rows per page)

- Clean HTML/CSS frontend

- Organized Flask backend with modular structure

## 📌 Important Notes
- The charts and stats are generated based on city + optional time filters (month and/or day).

- The data table, however, always displays all records for the selected city, regardless of any time filtering.

## ⚙️ Technologies Used
- Backend: Python, Flask

- Frontend: HTML, CSS, JavaScript

- Data: CSV (pandas, datetime)

- Charts: JavaScript + Chart.js 

## Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

## Installation

1. Clone the repository:
```
git clone https://github.com/Mohammad-AbdulSamad/US_Bikeshare.git
cd US_Bikeshare
```
2. Create and activate a virtual environment:
```
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```
pip install Flask pandas
```
4. Run the application:
```
python app.py
```

5. Open your browser and navigate to:
```
http://127.0.0.1:5000/
```

## Screenshots
![image](https://github.com/user-attachments/assets/b9ae52dc-d108-4228-965c-316f26602c40)

![image](https://github.com/user-attachments/assets/95c1ab22-4851-494f-8ec5-04c02022996e)



## Copyright
© 2025 Mohammad Abdul-Samad. All rights reserved.

   
