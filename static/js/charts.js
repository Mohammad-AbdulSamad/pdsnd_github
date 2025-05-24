let dailyChartInstance;
let hourlyChartInstance;
let monthlyChartInstance;
let genderChartInstance;
let userTypeChartInstance;
let allRows = [];  // from fetch
const rowsPerPage = 6;
let currentPage = 1;
let currentCity = 'chicago';


window.onload = function() {
    fetchTableData();
    GET_fetchDataAndRenderCharts()
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('filter-form');
    const citySelect = document.getElementById('city');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from reloading page

        const city = citySelect.value;
        const month = monthSelect.value;
        const day = daySelect.value;

        // Check if the city has changed
        if (city !== currentCity) {
        currentCity = city;       // Update the tracked city
        currentPage = 1;          // Reset pagination to page 1
        fetchTableData();         // Fetch new table data for new city
        }


        fetchDataAndRenderCharts(city, month, day);
    });
});

function fetchDataAndRenderCharts(city, month, day) {

    fetch('/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            city: city,
            month: month,
            day: day
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched data:', data);

        const time_stats = data[0];
        const station_trip_user_stats = data[1];

        drawDailyChart(time_stats.daily);
        drawHourlyChart(time_stats.hourly);
        drawMonthlyChart(time_stats.monthly);
        drawGenderChart(station_trip_user_stats.user_stats.gender);

        updateTimeStats(time_stats);
        updateStationStats(station_trip_user_stats.station_stats);
        updateTripStats(station_trip_user_stats.trip_stats);
        updateUserStats(station_trip_user_stats.user_stats);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });


}



// This function will fetch data from the server when a button is clicked
function GET_fetchDataAndRenderCharts() {
    fetch(`/filter`)  // Send city as query param
        .then(response => response.json())
        .then(data => {
        console.log(data);

        const time_stats = data[0];
        const station_trip_user_stats = data[1];

        drawDailyChart(time_stats.daily);
        drawHourlyChart(time_stats.hourly);
        drawMonthlyChart(time_stats.monthly);
        drawGenderChart(station_trip_user_stats.user_stats.gender);

        updateTimeStats(time_stats);
        updateStationStats(station_trip_user_stats.station_stats);
        updateTripStats(station_trip_user_stats.trip_stats);
        updateUserStats(station_trip_user_stats.user_stats);

        })
        .catch(error => console.error('Error fetching table data:', error));
}

function drawDailyChart(dailyData) {
    const ctx = document.getElementById('dailyChart').getContext('2d');

    if (dailyChartInstance) {
        dailyChartInstance.destroy();
    }

    dailyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dailyData),
            datasets: [{
                label: '# of Rides per Day',
                data: Object.values(dailyData),
                backgroundColor: 'rgba(153, 102, 255, 1)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function drawHourlyChart(hourlyData) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');

    if (hourlyChartInstance) {
        hourlyChartInstance.destroy();
    }

    hourlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(hourlyData),
            datasets: [{
                label: '# of Rides per Hour',
                data: Object.values(hourlyData),
                fill: false,
                borderColor: 'rgba(153, 102, 255, 1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function drawMonthlyChart(monthlyData) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }

    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: '# of Rides per Month',
                data: Object.values(monthlyData),
                backgroundColor: 'rgba(153, 102, 255, 1)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


function drawGenderChart(genderData) {
    const chartContainer = document.getElementById('genderChartContainer');
    chartContainer.innerHTML = ''; // Clear previous content

    const temp_header = document.createElement('h2');
    temp_header.textContent='Gender';

    chartContainer.appendChild(temp_header);

    if (!genderData || Object.keys(genderData).length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Not Available';

        message.style.color = '#666';
        message.style.fontSize = '50px';
        chartContainer.appendChild(message);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'genderChart';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    if (genderChartInstance) {
        genderChartInstance.destroy();
    }

    genderChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(genderData),
            datasets: [{
                label: 'Count',
                data: Object.values(genderData),
                backgroundColor: [
                    "rgba(153, 102, 255, 0.1)",
                    "rgba(153, 102, 255, 1)"
                ],
            }]
        },
        options: {
            responsive: true,
        }
    });
}
//function loadTableData(data) {
//    allRows = data;  // put the fetched data into global allRows
//    console.log(allRows);
//    renderTable();
//}


// Render the table rows
function renderTable(data, columns) {

    const thead = document.querySelector('table thead');
    const tbody = document.querySelector('table tbody');

    if (currentPage > 1){
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('prevBtn').style.backgroundColor = '#0a0d39';
    }
    else{
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('prevBtn').style.backgroundColor = '#5b5d7b';
    }
     // Clear existing table headers and rows
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Create table headers
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Populate table rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

//function fetchTableData() {
//    fetch('/table-data')  // your Flask route that sends the table data as JSON
//        .then(response => response.json())
//        .then(data => {
//            loadTableData(data);
//        })
//        .catch(error => console.error('Error fetching table data:', error));
//}

// This function will fetch data from the server when a button is clicked
function fetchTableData() {
    fetch(`/table-data?page=${currentPage}&city=${currentCity}`)  // Send city as query param
        .then(response => response.json())
        .then(data => {
            renderTable(data.data, data.columns);
        })
        .catch(error => console.error('Error fetching table data:', error));
}
// Button functionality for Next and Previous
document.getElementById('nextBtn').addEventListener('click', function() {
    currentPage++;  // Increment page number
    fetchTableData();  // Fetch the data for the next page
});

document.getElementById('prevBtn').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;  // Decrement page number
        fetchTableData();  // Fetch the data for the previous page
    }
});





// Updating Station, Trip, and User Stats Text
function updateTimeStats(time_stats) {
    document.getElementById('mostCommonMonth').innerHTML =
    time_stats.most_common_month.month ;
    document.getElementById('mostCommonDay').innerHTML =
     time_stats.most_common_day.day ;
    document.getElementById('mostCommonHour').innerHTML =
    time_stats.most_common_hour.hour;

}



// Updating Station, Trip, and User Stats Text
function updateStationStats(stationStats) {
    document.getElementById('commonStartStation').innerHTML = stationStats.most_common_start;
    document.getElementById('commonEndStation').innerHTML = stationStats.most_common_end;
    document.getElementById('commonTrip').innerHTML = stationStats.most_common_trip;
}

function updateTripStats(tripStats) {
    document.getElementById('totalTravelTime').innerHTML =   tripStats.total + ' seconds';

    document.getElementById('averageTravelTime').innerHTML = tripStats.average.toFixed(2) + " seconds";
}

function updateUserStats(userStats) {
    const userTypesContainer = document.getElementById('userTypes');
    userTypesContainer.innerHTML = ''; // Clear previous cards

    for (const [type, count] of Object.entries(userStats.user_types)) {
        const card = document.createElement('div');
        card.className = 'card2-box';

        const title = document.createElement('p');
        title.className = 'text-title';
        title.textContent = type;

        const subtext = document.createElement('p');
        subtext.className = 'text-sub';
        subtext.textContent = count;

        card.appendChild(title);
        card.appendChild(subtext);
        userTypesContainer.appendChild(card);
    }

    const birthList = document.getElementById('birthYears');
    birthList.innerHTML = '';

    if (userStats.birth_years && Object.keys(userStats.birth_years).length > 0) {
        for (const [birth_type, count] of Object.entries(userStats.birth_years)) {
            const card = document.createElement('div');
            card.className = 'card2-box';

            const title = document.createElement('p');
            title.className = 'text-title';
            title.textContent = birth_type;

            const subtext = document.createElement('p');
            subtext.className = 'text-sub';
            subtext.textContent = count;

            card.appendChild(title);
            card.appendChild(subtext);
            birthList.appendChild(card);
        }
    } else {
        const message = document.createElement('p');
        message.textContent = 'Not Available';
        message.style.textAlign = 'center';
        message.style.color = '#666';
        message.style.fontSize = '50px';
        message.style.marginTop = '40px';
        birthList.appendChild(message);
    }
}

