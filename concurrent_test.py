import concurrent.futures
import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:5000/api"  # Adjust if your backend runs on a different port
NUM_THREADS = 2
NUM_REQUESTS_PER_THREAD = 2

# Sample data (adjust as needed)
SAMPLE_CITY_DATA = {"Cityname": ["TestCity1", "TestCity2", "TestCity3"]}
SAMPLE_AIRPORT_DATA = {"AirportCode": "TST", "CityID": 1, "Name": "Test Airport"}
SAMPLE_FLIGHT_DATA = {
    "flightID": "TEST001",
    "aircraftType": "Boeing 737",
    "FirstClassSeats": 10,
    "EconomyClassSeats": 100,
    "WeeklyFlightDays": "1234567",
    "stops": []
}
SAMPLE_CABIN_PRICING_DATA = {
    "flightID": "TEST001",
    "departureAirport": "TST",
    "arrivalAirport": "TST",
    "cabinClass": "economy",
    "price": 100,
    "discount": 0
}
SAMPLE_TRANSACTION_DATA = {
    "idNumber": "1234567890",
    "cabinPricingID": 1,
    "flightDate": "2025-07-01"
}

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "123456"
admin_token = None

def get_admin_token():
    global admin_token
    if admin_token:
        return admin_token
    login_url = f"{BASE_URL}/auth/login"
    params = {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
    try:
        response = requests.get(login_url, params=params)
        response.raise_for_status()
        data = response.json()
        admin_token = data.get("token")
        if not admin_token:
            raise Exception("No token received from login response")
        return admin_token
    except Exception as e:
        print(f"Admin login failed: {e}")
        return None

# Utility functions
def make_request(url, method="GET", data=None, admin=False):
    """Makes an HTTP request and returns the response."""
    try:
        headers = {'Content-Type': 'application/json'}
        if admin:
            token = get_admin_token()
            if token:
                headers['Authorization'] = token
        if data:
            response = requests.request(method, url, headers=headers, data=json.dumps(data))
        else:
            response = requests.request(method, url, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        if response.headers.get('Content-Type') == 'application/json':
            return response.json()
        else:
            return response.text
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return response.text if 'response' in locals() and response else None

def test_endpoint(endpoint, method="GET", data=None, admin=False):
    """Tests a specific endpoint."""
    url = f"{BASE_URL}{endpoint}"
    start_time = time.time()
    response = make_request(url, method, data, admin=admin)
    end_time = time.time()
    duration = end_time - start_time

    if response:
        print(f"Endpoint {endpoint}: {method} - Success ({duration:.4f}s)")
        print(f"Response: {response}") #Uncomment to see the full response
    else:
        print(f"Endpoint {endpoint}: {method} - Failed")

# Test functions
def test_add_city():
    test_endpoint("/admin/manage-city", method="POST", data=SAMPLE_CITY_DATA, admin=True)

def test_get_cities():
    test_endpoint("/admin/cities", method="GET", admin=True)

def test_add_airport():
    test_endpoint("/admin/manage-airport", method="POST", data=SAMPLE_AIRPORT_DATA, admin=True)

def test_get_airports():
    test_endpoint("/admin/airports", method="GET", admin=True)

def test_create_flight():
    test_endpoint("/admin/flights", method="POST", data=SAMPLE_FLIGHT_DATA, admin=True)

def test_create_cabin_pricing():
    test_endpoint("/admin/create-product", method="POST", data=SAMPLE_CABIN_PRICING_DATA, admin=True)

def test_make_transaction():
    test_endpoint("/passenger/transaction", method="POST", data=SAMPLE_TRANSACTION_DATA)

# Add more test functions as needed for other endpoints

def write_example_data(): 
    """Writes example data to the database."""
    test_add_city()
    # test_add_airport()
    # test_create_flight()
    # test_create_cabin_pricing()
    # test_make_transaction()



def run_tests():
    """Runs all test functions."""
    test_get_cities()
    test_get_airports()
    test_make_transaction()

def worker(thread_id):
    """Worker function for each thread."""
    print(f"Thread {thread_id}: Starting")
    for i in range(NUM_REQUESTS_PER_THREAD):
        print(f"Thread {thread_id}: Request {i + 1}")
        run_tests()
        time.sleep(0.1)  # Add a small delay between requests
    print(f"Thread {thread_id}: Finished")

def main():
    """Main function to execute concurrent tests."""
    write_example_data()
    # start_time = time.time()
    # print("Starting concurrent tests...")

    # with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
    #     futures = [executor.submit(worker, i) for i in range(NUM_THREADS)]

    #     # Wait for all threads to complete
    #     for future in concurrent.futures.as_completed(futures):
    #         try:
    #             future.result()  # If there was an exception, it will be raised here
    #         except Exception as e:
    #             print(f"A thread encountered an error: {e}")

    # end_time = time.time()
    # total_duration = end_time - start_time

    # print("Concurrent tests finished.")
    # print(f"Total duration: {total_duration:.2f} seconds")

if __name__ == "__main__":
    main()