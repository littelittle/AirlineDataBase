import json
from decimal import Decimal

from db.models import Airport, CabinPricing, City, Flight, FlightAirport, TicketSale, Passenger
from db.utils import verify_password, generate_jwt_token
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/login', methods=['GET'])
def login(): # Make sure this function is correctly routed by your Flask app
    """
    Handles passenger login.
    Expects 'username' and 'password' as query parameters.
    Returns { role, idNumber, token, username } on success.
    """
    username = request.args.get('username')
    password = request.args.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    passenger_data = Passenger.get_passenger_by_name(username)

    if passenger_data:
        if not passenger_data['is_active']:
            return jsonify({"error": "Account is inactive"}), 403 # Forbidden

        # Verify the password
        is_password_valid = verify_password(
            stored_password_hash=passenger_data['password_hash'],
            provided_password=password,
            salt=passenger_data['salt']
        )

        if is_password_valid: 
            username = passenger_data['PassengerName']
            role = 'admin' if username == 'admin' else 'passenger'
            # Password is correct, generate a token 
            token = generate_jwt_token(passenger_data['PassengerID'], passenger_data['PassengerName'], role)
            
            response = {
                "role": role, # if username is not admin, set role to passenger
                "idNumber": str(passenger_data['PassengerID']), # Use PassengerID(the primary key) as idNumber
                "token": token,
                "username": passenger_data['PassengerName']
            }
            return jsonify(response), 200
        else:
            # Invalid password
            return jsonify({"error": "Invalid username or password"}), 401
    else:
        # User not found
        return jsonify({"error": "Invalid username or password"}), 401
    
@auth_api.route('/register', methods=['GET'])
@cross_origin(origin='http://localhost:3000', methods=['GET'], supports_credentials=True)
def register(): # Make sure this function is correctly routed by your Flask app
    """
    Handles passenger login.
    Expects 'username' and 'password' as query parameters.
    Returns { role, idNumber, token, username } on success.
    """
    username = request.args.get('username')
    password = request.args.get('password')

    print(username, password)

    if not username or not password:
        print("error", "Username and password are required")
        return jsonify({"error": "Username and password are required"}), 409

    passenger_data = Passenger.create_passenger_with_password(username, password)

    if passenger_data:
        if passenger_data == 'exists':
            print({"success": False, "error": f"Passenger with name '{username}' already exists."})
            return jsonify({"success": False, "error": f"Passenger with name '{username}' already exists."}), 401 # Forbidden
        else:
            return jsonify({'success': True}), 201
    else:
        return jsonify({'success': False, 'error':"Registration failed due to an unexpected server issue."}), 500