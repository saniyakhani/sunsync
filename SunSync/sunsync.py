import requests
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
FOURSQUARE_API_KEY = os.getenv("FOURSQUARE_API_KEY")

def get_weather(city, date):
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()
    
    for forecast in data['list']:
        if forecast['dt_txt'].startswith(date):
            return forecast
    return None

def analyze_weather(weather_data):
    main_weather = weather_data['weather'][0]['main'].lower()
    if 'clear' in main_weather:
        return 'sunny'
    elif 'cloud' in main_weather:
        return 'cloudy'
    elif 'rain' in main_weather or 'drizzle' in main_weather:
        return 'rainy'
    else:
        return 'other'

def get_activities(city, weather_condition):
    url = "https://api.foursquare.com/v3/places/search"
    headers = {"Accept": "application/json", "Authorization": FOURSQUARE_API_KEY}
    
    query = "park" if weather_condition == 'sunny' else "museum"
    params = {"near": city, "query": query, "limit": 5}
    
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    
    return [venue['name'] for venue in data['results']]

def suggest_activities(city, date):
    weather_data = get_weather(city, date)
    if not weather_data:
        return "No weather data available for the specified date."
    
    weather_condition = analyze_weather(weather_data)
    activities = get_activities(city, weather_condition)
    
    suggestion = f"The weather in {city} on {date} is expected to be {weather_condition}.\n"
    suggestion += "Here are some suggested activities:\n"
    suggestion += "\n".join(f"- {activity}" for activity in activities)
    
    return suggestion

if __name__ == "__main__":
    city = input("Enter a city: ")
    date = input("Enter a date (YYYY-MM-DD): ")
    print(suggest_activities(city, date))