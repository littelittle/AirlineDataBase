# This script tests the concurrent API requests to a Flask backend. 
# TODO 选购部分无法正常运行
import concurrent.futures
import requests
import json
import time



# Configuration
BASE_URL = "http://127.0.0.1:5000/api"  # Adjust if your backend runs on a different port
NUM_THREADS = 2
NUM_REQUESTS_PER_THREAD = 2

# Sample data (adjust as needed)
SAMPLE_CITY_DATA = {"Cityname": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"]}
SAMPLE_AIRPORT_DATA = [
    {"AirportCode": "PEK", "Cityname": 'Beijing', "Name": "北京首都国际机场"},
    {"AirportCode": "SHA", "Cityname": 'Shanghai', "Name": "上海虹桥国际机场"},
    {"AirportCode": "PVG", "Cityname": 'Shanghai', "Name": "上海浦东国际机场"},
    {"AirportCode": "CAN", "Cityname": 'Guangzhou', "Name": "广州白云国际机场"},
    {"AirportCode": "SZX", "Cityname": 'Shenzhen', "Name": "深圳宝安国际机场"},
    {"AirportCode": "CTU", "Cityname": 'Chengdu', "Name": "成都双流国际机场"}
]

SAMPLE_FLIGHT_DATA = [
    {
        "flightID": "MU5106",
        "aircraftType": "Airbus A330",
        "FirstClassSeats": 10,
        "EconomyClassSeats": 100,
        "WeeklyFlightDays": "1234567",
        "stops": [
            {"AirportCode": "PEK", "stopOrder": 1},
            {"AirportCode": "SHA", "stopOrder": 2}
        ],
    },
    {
        "flightID": "CZ3456",
        "aircraftType": "Boeing 777",
        "FirstClassSeats": 8,
        "EconomyClassSeats": 120,
        "WeeklyFlightDays": "1357",
        "stops": [
            {"AirportCode": "CAN", "stopOrder": 1},
            {"AirportCode": "SZX", "stopOrder": 2}
        ],
    },
    {
        "flightID": "3U8888",
        "aircraftType": "Airbus A320",
        "FirstClassSeats": 6,
        "EconomyClassSeats": 90,
        "WeeklyFlightDays": "246",
        "stops": [
            {"AirportCode": "CTU", "stopOrder": 1},
            {"AirportCode": "PVG", "stopOrder": 2}
        ],
    }
]

SAMPLE_CABIN_PRICING_DATA = [
    {
        "flightID": "MU5106",
        "departureAirport": "PEK",
        "arrivalAirport": "SHA",
        "cabinClass": "Economy",
        "price": 100,
        "discount": 0
    },
    {
        "flightID": "CZ3456",
        "departureAirport": "CAN",
        "arrivalAirport": "SZX",
        "cabinClass": "Economy",
        "price": 120,
        "discount": 0
    },
    {
        "flightID": "3U8888",
        "departureAirport": "CTU",
        "arrivalAirport": "PVG",
        "cabinClass": "Economy",
        "price": 110,
        "discount": 0
    }
]

SAMPLE_TRANSACTION_DATA = [
    {
        "idNumber": "1",
        "cabinPricingID": 1,
        "flightDate": "2025-07-01",
        "price": 100
    },
    {
        "idNumber": "2",
        "cabinPricingID": 2,
        "flightDate": "2025-07-02",
        "price": 120
    },
    {
        "idNumber": "3",
        "cabinPricingID": 3,
        "flightDate": "2025-07-03",
        "price": 110
    }
]

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "12345"
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
    if type(data) is list:
        for item in data:
            response = make_request(url, method, item, admin=admin)
    else:        
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
    # For each transaction, try to find a matching product and use its PricingID and price
    for i, transaction in enumerate(SAMPLE_TRANSACTION_DATA):
        flight_id = SAMPLE_CABIN_PRICING_DATA[i % len(SAMPLE_CABIN_PRICING_DATA)]["flightID"]
        products = make_request(f"{BASE_URL}/admin/products/{flight_id}", method="GET", admin=True)
        if not products or not isinstance(products, list):
            print(f"No products found for transaction test for flight {flight_id}.")
            continue
        # Pick the first matching product
        product = None
        for p in products:
            if (
                p.get("DepartureAirportID") == SAMPLE_CABIN_PRICING_DATA[i % len(SAMPLE_CABIN_PRICING_DATA)]["departureAirport"] and
                p.get("ArrivalAirportID") == SAMPLE_CABIN_PRICING_DATA[i % len(SAMPLE_CABIN_PRICING_DATA)]["arrivalAirport"] and
                p.get("CabinLevel") == SAMPLE_CABIN_PRICING_DATA[i % len(SAMPLE_CABIN_PRICING_DATA)]["cabinClass"]
            ):
                product = p
                break
        if not product:
            print(f"No matching product found for transaction test for flight {flight_id}.")
            continue
        cabin_pricing_id = product.get("PricingID")
        price = product.get("Price")
        if not cabin_pricing_id or price is None:
            print(f"No valid PricingID or Price for transaction test for flight {flight_id}.")
            continue
        from datetime import datetime, timedelta
        flight_date = (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d")
        transaction_data = {
            "idNumber": transaction["idNumber"],
            "cabinPricingID": cabin_pricing_id,
            "flightDate": flight_date,
            "price": price
        }
        test_endpoint("/passenger/transaction", method="POST", data=transaction_data)

# Add more test functions as needed for other endpoints

def write_example_data(): 
    """Writes example data to the database, but skips if already present."""
    # Add city if not present
    cities = make_request(f"{BASE_URL}/admin/cities", method="GET", admin=True)
    city_names = [c.get("CityName") or c.get("Cityname") for c in (cities or [])]
    for name in SAMPLE_CITY_DATA["Cityname"]:
        if name not in city_names:
            test_endpoint("/admin/manage-city", method="POST", data={"Cityname": name}, admin=True)
        else:
            print(f"City '{name}' already exists, skipping add.")

    # Add airport if not present
    airports = make_request(f"{BASE_URL}/admin/airports", method="GET", admin=True)
    airport_codes = [a.get("AirportCode") for a in (airports or [])]
    for airport in SAMPLE_AIRPORT_DATA:
        if airport["AirportCode"] not in airport_codes:
            test_endpoint("/admin/manage-airport", method="POST", data=airport, admin=True)
        else:
            print(f"Airport '{airport['AirportCode']}' already exists, skipping add.")

    # Add flight if not present
    flights = make_request(f"{BASE_URL}/admin/flights", method="GET", admin=True)
    flight_ids = [f.get("FlightID") for f in (flights or [])]
    for flight in SAMPLE_FLIGHT_DATA:
        if flight["flightID"] not in flight_ids:
            test_endpoint("/admin/flights", method="POST", data=flight, admin=True)
        else:
            print(f"Flight '{flight['flightID']}' already exists, skipping add.")

    # Add cabin pricing if not present (check by flightID, departure, arrival, cabinClass)
    for pricing in SAMPLE_CABIN_PRICING_DATA:
        products = make_request(f"{BASE_URL}/admin/products/{pricing['flightID']}", method="GET", admin=True)
        found = False
        for p in (products or []):
            if (
                p.get("DepartureAirportID") == pricing["departureAirport"] and
                p.get("ArrivalAirportID") == pricing["arrivalAirport"] and
                p.get("CabinLevel") == pricing["cabinClass"]
            ):
                found = True
                break
        if not found:
            test_endpoint("/admin/create-product", method="POST", data=pricing, admin=True)
        else:
            print(f"Cabin pricing for flight {pricing['flightID']} {pricing['departureAirport']}->{pricing['arrivalAirport']} {pricing['cabinClass']} already exists, skipping add.")



def run_tests():
    """Runs all test functions."""
    # test_get_cities()
    # test_get_airports()
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
    # Clear all data before running tests using test_endpoint
    test_endpoint("/admin/clear-all", method="POST", admin=True) # EXETREMELY DANGEROUS, USE WITH CAUTION
    write_example_data()
    start_time = time.time()
    print("Starting concurrent tests...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
        futures = [executor.submit(worker, i) for i in range(NUM_THREADS)]

        # Wait for all threads to complete
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()  # If there was an exception, it will be raised here
            except Exception as e:
                print(f"A thread encountered an error: {e}")

    end_time = time.time()
    total_duration = end_time - start_time

    print("Concurrent tests finished.")
    print(f"Total duration: {total_duration:.2f} seconds")

if __name__ == "__main__":
    main()