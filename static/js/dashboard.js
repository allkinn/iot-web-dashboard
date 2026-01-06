const CONFIG = {
    updateInterval: 2000,
    chartUpdateInterval: 10000,
    maxDataPoints: 50
};

// ============ GLOBAL STATE ============
let temperatureChart, humidityChart;
let lastTemperature = null;
let lastHumidity = null;
let lastLight = null;

// ============ MOCK DATA FOR DEMO ============
function generateMockData() {
    return {
        temperature: (20 + Math.random() * 10).toFixed(1),
        humidity: (40 + Math.random() * 30).toFixed(1),
        light: Math.round(30 + Math.random() * 50),
        timestamp: new Date().toLocaleString()
    };
}

function generateMockHistory() {
    const history = [];
    const now = new Date();
    for (let i = 50; i > 0; i--) {
        const time = new Date(now - i * 60000);
        history.push({
            temperature: (20 + Math.random() * 10).toFixed(1),
            humidity: (40 + Math.random() * 30).toFixed(1),
            light: Math.round(30 + Math.random() * 50),
            timestamp: time.toLocaleTimeString()
        });
    }
    return history;
}

// ============ INITIALIZATION ============
window.onload = function() {
    console.log('🚀 Dashboard initializing...');
    
    initCharts();
    updateCurrentReadings();
    updateCharts();
    
    setInterval(updateCurrentReadings, CONFIG.updateInterval);
    setInterval(updateCharts, CONFIG.chartUpdateInterval);
    
    console.log('✓ Dashboard ready');
};

// ============ API FUNCTIONS (Using mock data) ============
async function fetchCurrentReading() {
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        return generateMockData();
    } catch (error) {
        console.error('Error fetching current reading:', error);
        updateStatus(false);
        return null;
    }
}

async function fetchHistory() {
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        return generateMockHistory();
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

// ============ UPDATE FUNCTIONS ============
async function updateCurrentReadings() {
    const data = await fetchCurrentReading();
    if (!data) return;
    
    updateStatus(true);
    
    document.getElementById('tempValue').textContent = data.temperature;
    updateTrend('tempTrend', parseFloat(data.temperature), lastTemperature);
    lastTemperature = parseFloat(data.temperature);
    
    document.getElementById('humidityValue').textContent = data.humidity;
    updateTrend('humidityTrend', parseFloat(data.humidity), lastHumidity);
    lastHumidity = parseFloat(data.humidity);
    
    document.getElementById('lightValue').textContent = data.light;
    updateTrend('lightTrend', parseFloat(data.light), lastLight);
    lastLight = parseFloat(data.light);
    
    document.getElementById('lastUpdate').textContent = data.timestamp;
}

async function updateCharts() {
    const history = await fetchHistory();
    if (history.length === 0) return;
    
    const labels = history.map(r => {
        const time = r.timestamp;
        return time.substring(0, 5);
    });
    
    const temperatures = history.map(r => parseFloat(r.temperature));
    const humidities = history.map(r => parseFloat(r.humidity));
    const lights = history.map(r => parseFloat(r.light));
    
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = temperatures;
    temperatureChart.update('none');
    
    humidityChart.data.labels = labels;
    humidityChart.data.datasets[0].data = humidities;
    humidityChart.update('none');
    
    updateStatistics(temperatures, humidities, lights, history.length);
}

function updateStatistics(temps, humids, lights, count) {
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const avgHumid = (humids.reduce((a, b) => a + b, 0) / humids.length).toFixed(1);
    const avgLight = Math.round(lights.reduce((a, b) => a + b, 0) / lights.length);
    
    document.getElementById('avgTemp').textContent = avgTemp + '°C';
    document.getElementById('avgHumidity').textContent = avgHumid + '%';
    document.getElementById('avgLight').textContent = avgLight + '%';
    document.getElementById('totalReadings').textContent = count;
}

function updateTrend(elementId, current, previous) {
    if (previous === null) return;
    
    const element = document.getElementById(elementId);
    const diff = current - previous;
    
    element.classList.remove('up', 'down', 'stable');
    
    if (Math.abs(diff) < 0.5) {
        element.classList.add('stable');
        element.textContent = 'Stable';
    } else if (diff > 0) {
        element.classList.add('up');
        element.textContent = `+${diff.toFixed(1)}`;
    } else {
        element.classList.add('down');
        element.textContent = diff.toFixed(1);
    }
}

function updateStatus(connected) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    
    if (connected) {
        dot.classList.remove('disconnected');
        dot.classList.add('connected');
        text.textContent = 'Connected';
    } else {
        dot.classList.remove('connected');
        dot.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

// ============ CHART INITIALIZATION ============
function initCharts() {
    const isMobile = window.innerWidth < 768;
    
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: isMobile ? 8 : 12,
                titleFont: {
                    size: isMobile ? 12 : 14
                },
                bodyFont: {
                    size: isMobile ? 11 : 13
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: isMobile ? 10 : 12
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: isMobile ? 90 : 45,
                    minRotation: isMobile ? 90 : 45,
                    font: {
                        size: isMobile ? 8 : 10
                    },
                    maxTicksLimit: isMobile ? 8 : 12
                }
            }
        }
    };
    
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                borderWidth: 2,
                pointRadius: isMobile ? 2 : 3,
                pointHoverRadius: isMobile ? 4 : 5,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    ticks: {
                        ...commonOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                }
            }
        }
    });
    
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    humidityChart = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity (%)',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 2,
                pointRadius: isMobile ? 2 : 3,
                pointHoverRadius: isMobile ? 4 : 5,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 0,
                    max: 100,
                    ticks: {
                        ...commonOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    console.log('✓ Charts initialized');
}

// Handle window resize for chart responsiveness
window.addEventListener('resize', () => {
    if (temperatureChart && humidityChart) {
        temperatureChart.resize();
        humidityChart.resize();
    }
});
