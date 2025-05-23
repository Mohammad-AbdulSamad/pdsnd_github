from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Define file paths for the dataset
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
CITY_DATA = {
    'chicago': os.path.join(DATA_DIR, 'chicago.csv'),
    'new york city': os.path.join(DATA_DIR, 'new_york_city.csv'),
    'washington': os.path.join(DATA_DIR, 'washington.csv')
}


def convert_periods(data):
    """
    Converts pandas Period objects in dictionary keys to strings for JSON serialization.

    Args:
        data (dict): Dictionary possibly containing PeriodIndex keys.

    Returns:
        dict: Dictionary with Periods converted to strings.
    """
    data_copy = {}
    for key, value in data.items():
        if key == 'monthly':
            data_copy[key] = {str(period): count for period, count in value.items()}
        else:
            data_copy[key] = value
    return data_copy


def clean_user_input(s: str) -> str:
    """
    Cleans user input by stripping whitespace and converting to lowercase.

    Args:
        s (str): The user input.

    Returns:
        str: Cleaned input.
    """
    return s.lower().strip()


def load_data(city, month, day):
    """
    Loads data for the specified city and filters by month and day if applicable.

    Args:
        city (str): Name of the city.
        month (str): Name of the month to filter by or 'all'.
        day (str): Name of the day to filter by or 'all'.

    Returns:
        DataFrame: Filtered pandas DataFrame.
    """
    df = pd.read_csv(CITY_DATA[city])
    df['Start Time'] = pd.to_datetime(df['Start Time'])

    # Extract month and day of week
    df['month'] = df['Start Time'].dt.month
    df['day_of_week'] = df['Start Time'].dt.day_name()

    if month != 'all':
        months = ['january', 'february', 'march', 'april', 'may', 'june']
        month_index = months.index(month) + 1
        df = df[df['month'] == month_index]

    if day != 'all':
        df = df[df['day_of_week'].str.lower() == day.lower()]

    return df


@app.route('/')
def index():
    """
    Render the main HTML page.
    """
    return render_template('index.html')


@app.route('/table-data')
def table_data():
    """
    API endpoint that returns paginated table data for the selected city.

    Query Params:
        page (int): Page number (default = 1)
        city (str): City name (default = 'chicago')

    Returns:
        JSON: Paginated table data with column headers.
    """
    page = request.args.get('page', 1, type=int)
    city = request.args.get('city', 'chicago').lower()
    rows_per_page = 5

    try:
        df = pd.read_csv(CITY_DATA.get(city, CITY_DATA['chicago']))
        df.rename(columns={list(df)[0]: 'User ID'}, inplace=True)

        start_row = (page - 1) * rows_per_page
        end_row = start_row + rows_per_page

        temp_data = df.iloc[start_row:end_row].fillna('N/A')

        page_data = temp_data.to_dict(orient='records')
        columns = list(temp_data.columns)

        return jsonify({'columns': columns, 'data': page_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/filter', methods=['POST', 'GET'])
def filter_data():
    """
    API endpoint that returns time, station, trip, and user statistics based on filtering.

    For GET:
        Uses default values (chicago, all months/days).
    For POST:
        Expects JSON with 'city', 'month', and 'day'.

    Returns:
        JSON: Stats dictionaries (time, station, trip, user).
    """
    if request.method == 'GET':
        city, month, day = 'chicago', 'all', 'all'
    else:
        data = request.get_json()
        city = data.get('city')
        month = data.get('month')
        day = data.get('day')

    df = load_data(city, month, day)
    df['hour'] = df['Start Time'].dt.hour

    # Time statistics
    monthly_counts = df['Start Time'].dt.to_period('M').value_counts().sort_index()
    daily_counts = df['day_of_week'].value_counts()
    hourly_counts = df['hour'].value_counts().sort_index()

    time_stats = {
        'monthly': monthly_counts.to_dict(),
        'daily': daily_counts.to_dict(),
        'hourly': hourly_counts.to_dict(),
        'most_common_month': {
            'month': str(monthly_counts.idxmax()),
            'count': int(monthly_counts.max())
        },
        'most_common_day': {
            'day': daily_counts.idxmax(),
            'count': int(daily_counts.max())
        },
        'most_common_hour': {
            'hour': int(hourly_counts.idxmax()),
            'count': int(hourly_counts.max())
        }
    }

    # Station statistics
    start_station = df['Start Station'].value_counts().idxmax()
    end_station = df['End Station'].value_counts().idxmax()
    common_trip = df.groupby(['Start Station', 'End Station']).size().idxmax()

    station_stats = {
        'most_common_start': start_station,
        'most_common_end': end_station,
        'most_common_trip': f"{common_trip[0]} → {common_trip[1]}"
    }

    # Trip duration statistics
    trip_stats = {
        'total': int(df['Trip Duration'].sum()),
        'average': float(df['Trip Duration'].mean())
    }

    # User statistics
    user_stats = {
        'user_types': df['User Type'].value_counts().to_dict()
    }

    if 'Gender' in df.columns:
        user_stats['gender'] = df['Gender'].value_counts().to_dict()

    if 'Birth Year' in df.columns:
        birth_years = df['Birth Year'].dropna().astype(int)
        user_stats['birth_years'] = {
            'Oldest Birth Year': int(birth_years.min()),
            'Most Recent Brith Year': int(birth_years.max()),
            'Most Common Birth Year': int(birth_years.mode()[0])
        }

    clean_data = convert_periods(time_stats)

    return jsonify(
        clean_data,
        {
            'station_stats': station_stats,
            'trip_stats': trip_stats,
            'user_stats': user_stats
        }
    )


if __name__ == '__main__':
    app.run()
