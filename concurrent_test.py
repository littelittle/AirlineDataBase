# This script tests the concurrent API requests to a Flask backend. 
# TODO 选购部分无法正常运行
import concurrent.futures
import requests
import json
import time
import sys
import argparse



# Configuration
parser = argparse.ArgumentParser(description="Concurrent API test runner")
parser.add_argument('--threads', '-t', type=int, default=10, help='Number of concurrent threads (default: 10)')
parser.add_argument('--requests', '-r', type=int, default=7, help='Number of requests per thread (default: 7)')
parser.add_argument('--clear', '-c', action='store_true', help='Clear the database before running the test (default: False)')
parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output (default: False)')
args, unknown = parser.parse_known_args()
NUM_THREADS = args.threads
NUM_REQUESTS_PER_THREAD = args.requests
CLEAR_DB_BEFORE_TEST = args.clear
VERBOSE = args.verbose

if VERBOSE:
    vprint = print
else:
    def vprint(*a, **k): pass

BASE_URL = "http://127.0.0.1:5000/api"  # Adjust if your backend runs on a different port

# Sample data (adjust as needed)
SAMPLE_CITY_DATA = {"Cityname": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Xi'an", "Hangzhou", "Chongqing"]}
SAMPLE_AIRPORT_DATA = [
    {"AirportCode": "PEK", "Cityname": 'Beijing', "Name": "北京首都国际机场"},
    {"AirportCode": "SHA", "Cityname": 'Shanghai', "Name": "上海虹桥国际机场"},
    {"AirportCode": "PVG", "Cityname": 'Shanghai', "Name": "上海浦东国际机场"},
    {"AirportCode": "CAN", "Cityname": 'Guangzhou', "Name": "广州白云国际机场"},
    {"AirportCode": "SZX", "Cityname": 'Shenzhen', "Name": "深圳宝安国际机场"},
    {"AirportCode": "CTU", "Cityname": 'Chengdu', "Name": "成都双流国际机场"},
    {"AirportCode": "XIY", "Cityname": "Xi'an", "Name": "西安咸阳国际机场"},
    {"AirportCode": "HGH", "Cityname": "Hangzhou", "Name": "杭州萧山国际机场"},
    {"AirportCode": "CKG", "Cityname": "Chongqing", "Name": "重庆江北国际机场"}
]

SAMPLE_FLIGHT_DATA = [
    {
        "flightID": "MU5106",
        "aircraftType": "Airbus A330",
        "FirstClassSeats": 10,
        "EconomyClassSeats": 100,
        "WeeklyFlightDays": "MON, TUE, WED, THU ,FRI ,SAT",
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
        "WeeklyFlightDays": "MON, TUE, WED, THU ,FRI ,SAT",
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
        "WeeklyFlightDays": "MON, TUE, WED, THU ,FRI ,SAT",
        "stops": [
            {"AirportCode": "CTU", "stopOrder": 1},
            {"AirportCode": "PVG", "stopOrder": 2}
        ],
    },
    {
        "flightID": "HU7890",
        "aircraftType": "Boeing 787",
        "FirstClassSeats": 12,
        "EconomyClassSeats": 150,
        "WeeklyFlightDays": "MON, WED, FRI, SUN",
        "stops": [
            {"AirportCode": "XIY", "stopOrder": 1},
            {"AirportCode": "HGH", "stopOrder": 2}
        ],
    },
    {
        "flightID": "CA1234",
        "aircraftType": "Airbus A321",
        "FirstClassSeats": 8,
        "EconomyClassSeats": 110,
        "WeeklyFlightDays": "TUE, THU, SAT",
        "stops": [
            {"AirportCode": "CKG", "stopOrder": 1},
            {"AirportCode": "PEK", "stopOrder": 2}
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
    }, 
    {
        "flightID": "3U8888",
        "departureAirport": "CTU",
        "arrivalAirport": "PVG",
        "cabinClass": "Firstclass",
        "price": 550,
        "discount": 0
    },
    {
        "flightID": "HU7890",
        "departureAirport": "XIY",
        "arrivalAirport": "HGH",
        "cabinClass": "Economy",
        "price": 130,
        "discount": 0
    },
    {
        "flightID": "HU7890",
        "departureAirport": "XIY",
        "arrivalAirport": "HGH",
        "cabinClass": "Firstclass",
        "price": 600,
        "discount": 0
    },
    {
        "flightID": "CA1234",
        "departureAirport": "CKG",
        "arrivalAirport": "PEK",
        "cabinClass": "Economy",
        "price": 125,
        "discount": 0
    },
    {
        "flightID": "CA1234",
        "departureAirport": "CKG",
        "arrivalAirport": "PEK",
        "cabinClass": "Firstclass",
        "price": 580,
        "discount": 0
    }
]


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "123456"
admin_token = None

PASSENGER_PASSWORD = "123456"

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
    """Tests a specific endpoint. Returns True if success, False if failed."""
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
        vprint(f"Endpoint {endpoint}: {method} - Success ({duration:.4f}s)")
        return True
    else:
        vprint(f"Endpoint {endpoint}: {method} - Failed")
        return False

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

def passenger_register(username, password):
    url = f"{BASE_URL}/auth/register"
    params = {"username": username, "password": password}
    try:
        response = requests.get(url, params=params)
        if response.status_code == 201:
            vprint(f"Passenger '{username}' registered successfully.")
            return True
        elif response.status_code == 401 and 'already exists' in response.text:
            vprint(f"Passenger '{username}' already exists.")
            return True
        else:
            vprint(f"Passenger registration failed for '{username}': {response.text}")
            return False
    except Exception as e:
        vprint(f"Passenger registration error for '{username}': {e}")
        return False

def passenger_login(username, password):
    url = f"{BASE_URL}/auth/login"
    params = {"username": username, "password": password}
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        token = data.get("token")
        id_number = data.get("PassengerID")
        if token and id_number:
            vprint(f"Passenger '{username}' logged in successfully.")
            return token, id_number
        else:
            vprint(f"Passenger login failed for '{username}': {response.text}")
            return None, None
    except Exception as e:
        vprint(f"Passenger login error for '{username}': {e}")
        return None, None

# Track used product IDs per user/thread
test_make_transaction_used_products = {}

# Track failed transaction requests
total_transaction_requests = NUM_THREADS * NUM_REQUESTS_PER_THREAD
failed_transaction_requests = 0

def test_make_transaction(passenger_token, passenger_id):
    """
    Use /passenger/all-cabin-pricing to get all products, and choose a different product for each request per user.
    """
    global test_make_transaction_used_products, failed_transaction_requests
    # 1. Get all cabin pricing products
    products = make_request(f"{BASE_URL}/passenger/all-cabin-pricing", method="GET")
    if not products or not isinstance(products, list):
        print("No available products for transaction test.")
        failed_transaction_requests += 1
        return
    # Track which products this user has already bought
    used = test_make_transaction_used_products.get(passenger_id, set())
    # Find a product not yet bought by this user
    product = None
    for p in products:
        pid = p.get("PricingID")
        if pid and pid not in used:
            product = p
            break
    if not product:
        print(f"User {passenger_id} has already bought all available products or no valid product found.")
        failed_transaction_requests += 1
        return
    # Prepare transaction data
    import datetime
    today = datetime.date.today()
    date_str = today.strftime("%Y-%m-%d")
    transaction_data = {
        "PassengerID": str(passenger_id),
        "cabinPricingID": product["PricingID"],
        "flightDate": date_str,
        "price": product["Price"]
    }
    # Mark this product as used for this user
    used.add(product["PricingID"])
    test_make_transaction_used_products[passenger_id] = used
    # Attempt transaction and count failure if it fails
    success = test_endpoint("/passenger/transaction", method="POST", data=transaction_data)
    if not success:
        failed_transaction_requests += 1

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
            vprint(f"City '{name}' already exists, skipping add.")

    # Add airport if not present
    airports = make_request(f"{BASE_URL}/admin/airports", method="GET", admin=True)
    airport_codes = [a.get("AirportCode") for a in (airports or [])]
    for airport in SAMPLE_AIRPORT_DATA:
        if airport["AirportCode"] not in airport_codes:
            test_endpoint("/admin/manage-airport", method="POST", data=airport, admin=True)
        else:
            vprint(f"Airport '{airport['AirportCode']}' already exists, skipping add.")

    # Add flight if not present
    flights = make_request(f"{BASE_URL}/admin/flights", method="GET", admin=True)
    flight_ids = [f.get("FlightID") for f in (flights or [])]
    for flight in SAMPLE_FLIGHT_DATA:
        if flight["flightID"] not in flight_ids:
            test_endpoint("/admin/flights", method="POST", data=flight, admin=True)
        else:
            vprint(f"Flight '{flight['flightID']}' already exists, skipping add.")

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
            vprint(f"Cabin pricing for flight {pricing['flightID']} {pricing['departureAirport']}->{pricing['arrivalAirport']} {pricing['cabinClass']} already exists, skipping add.")

def run_tests(passenger_token, passenger_id):
    """Runs all test functions for a passenger."""
    test_get_cities()
    test_get_airports()
    test_make_transaction(passenger_token, passenger_id)

def worker(thread_id):
    """Worker function for each thread. Each uses a unique passenger name."""
    passenger_name = f"testuser_{thread_id}"
    vprint(f"Thread {thread_id}: Registering passenger '{passenger_name}'")
    passenger_register(passenger_name, PASSENGER_PASSWORD)
    vprint(f"Thread {thread_id}: Logging in passenger '{passenger_name}'")
    passenger_token, passenger_id = passenger_login(passenger_name, PASSENGER_PASSWORD)
    if not passenger_token or not passenger_id:
        vprint(f"Thread {thread_id}: Failed to login/register passenger '{passenger_name}'")
        return
    vprint(f"Thread {thread_id}: Starting tests as '{passenger_name}' (ID: {passenger_id})")
    for i in range(NUM_REQUESTS_PER_THREAD):
        vprint(f"Thread {thread_id}: Request {i + 1}")
        run_tests(passenger_token, passenger_id)
    vprint(f"Thread {thread_id}: Finished")

def main():
    global failed_transaction_requests
    # Clear all data before running tests using test_endpoint if requested
    if CLEAR_DB_BEFORE_TEST:
        test_endpoint("/admin/clear-all", method="POST", admin=True) # EXETREMELY DANGEROUS, USE WITH CAUTION
    write_example_data()
    start_time = time.time()
    print("Starting concurrent tests...")
    print(f"Using {NUM_THREADS} threads, each making {NUM_REQUESTS_PER_THREAD} requests.")


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
    print()
    print("Concurrent tests finished.")
    print(f"Using {NUM_THREADS} threads, each making {NUM_REQUESTS_PER_THREAD} requests.")
    print(f"Total duration: {total_duration:.2f} seconds")
    print(f"Total transaction requests: {total_transaction_requests}")
    print(f"Failed transaction requests: {failed_transaction_requests}")

if __name__ == "__main__":
    main()