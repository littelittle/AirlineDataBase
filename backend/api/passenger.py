from flask import Blueprint, request, jsonify
from db.models import Passenger, CabinPricing, TicketSale, Airport, FlightAirport
import mysql.connector

passenger_api = Blueprint('passenger_api', __name__)

# ====================== 获取机场列表 ======================
@passenger_api.route('/airports', methods=['GET'])
def get_airports():
    try:
        airports = Airport.get_airports()
        return jsonify(airports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====================== 查询可用产品 ======================
@passenger_api.route('/products', methods=['GET'])
def query_products():
    departure_airport_id = request.args.get('departureAirportID')
    arrival_airport_id = request.args.get('arrivalAirportID')
    weekday = request.args.get('weekday')
    date = request.args.get('date')
    if not weekday:
        return jsonify({"error": "请提供查询的日期"}), 400
    if not departure_airport_id or not arrival_airport_id:
        return jsonify({"error": "请提供出发和到达机场代码"}), 400

    try:
        pricings = CabinPricing.query_pricing_by_airports_week(departure_airport_id, arrival_airport_id, weekday)
        print(f'查询到的定价信息: {pricings}')
        try:
            for pricing in pricings:
                pricing['RemainingSeats'] = CabinPricing.get_remaining_seats_by_date(pricing['PricingID'], date)[0]['RemainingSeats']
                print(f"定价ID: {pricing['PricingID']}, 剩余座位: {pricing['RemainingSeats']}")
        except Exception as e:
            print(f"获取剩余座位失败: {e}")
        if not pricings:
            pricings = CabinPricing.query_pricing_by_airports(departure_airport_id, arrival_airport_id)
            print(f'非同一天的定价信息：{pricings}')
            if not pricings:
                return jsonify(None), 200
            else: 
                return jsonify(pricings), 201
        return jsonify(pricings), 200
    except Exception as e:
        print(f"查询产品失败: {e}")
        return jsonify({"error": str(e)}), 500
    
@passenger_api.route('/products/get_remaining', methods=['GET'])
def get_remaining_seats():
    cabin_pricing_id = request.args.get('cabinPricingID')
    date = request.args.get('date')
    if not cabin_pricing_id or not date:
        return jsonify({"error": "请提供定价ID和日期"}), 400

    try:
        remaining_seats = CabinPricing.get_remaining_seats_by_date(cabin_pricing_id, date)
        if not remaining_seats:
            return jsonify({"RemainingSeats": 0}), 200
        print(remaining_seats[0])
        return jsonify(remaining_seats[0]), 200
    except Exception as e:
        print(f"查询剩余座位失败: {e}")
        return jsonify({"error": str(e)}), 500
    
@passenger_api.route('/products/sameflight', methods=['GET'])
def get_same_flight_products():
    start_airport = request.args.get('departureAirportID')
    end_airport = request.args.get('arrivalAirportID')
    weekday = request.args.get('weekday')
    flightday = request.args.get('flightDate')
    if not start_airport or not end_airport or not weekday or not flightday:
        return jsonify({"error": "请提供起点机场、终点机场和查询日期"}), 400
    # try:
    result = CabinPricing.get_flight_and_stoporders_by_airports(start_airport, end_airport, weekday)
    if not result:
        return jsonify({"message": "没有找到符合条件的航班"}), 200
    print(f"查询到的航班信息: {result}") # something like: [{'FlightID': 'CA123', 'StartAirportStopOrder': 1, 'EndAirportStopOrder': 4, 'StartAirportCode': 'PEK', 'EndAirportCode': 'SUZ'},...]
    TotalFlightIDList = []
    for flight in result:
        PriceIDList = []
        PriceList = []
        AirportCodeList = []
        total_price = 0
        flight_id = flight['FlightID']
        StartOrder = flight['StartAirportStopOrder']
        EndOrder = flight['EndAirportStopOrder']
        current_airport = flight['StartAirportCode']
        end_airport = flight['EndAirportCode']
        AirportCodeList.append(current_airport)
        for next_order in range(StartOrder + 1, EndOrder + 1):
            next_airport = FlightAirport.get_airportid(flight_id, next_order)[0]['AirportCode']
            AirportCodeList.append(next_airport)
            if not next_airport:
                PriceIDList = None
                break
            print(current_airport, next_airport, flight_id)
            Product = CabinPricing.query_PricingID_by_airports_flight(current_airport, next_airport, flight_id)[0]
            # print(f"Product: {Product}")
            pricingid, price = Product.get('PricingID'), Product.get('Price')
            if pricingid:
                PriceIDList.append(pricingid)
                total_price += price
                PriceList.append(price)
                current_airport = next_airport
            else:
                PriceIDList = None
                break
        if PriceIDList:
            TotalFlightIDList.append({
                'FlightID': flight_id,
                'StartAirportCode': start_airport,
                'EndAirportCode': end_airport,
                'PricingIDs': PriceIDList,
                'TotalPrice': total_price,
                'AirportCodeList': AirportCodeList,
                'Prices': PriceList
            })
        print(f'航班 {flight_id} 的产品ID列表: {PriceIDList}')

    if not TotalFlightIDList:
        return jsonify({"message": "没有找到符合条件的产品"}), 200
    print(f"查询到的同航班产品信息: {TotalFlightIDList}")
    return jsonify(TotalFlightIDList), 200
    # except Exception as e:
    #     print(f"查询同航班产品失败: {e}")
    #     return jsonify({"error": str(e)}), 500

# ====================== 购买产品（创建交易） ======================
@passenger_api.route('/transaction', methods=['POST'])
def make_transaction(): 
    # breakpoint()
    data = request.get_json()
    required_fields = ['PassengerID', 'cabinPricingID', 'flightDate', 'price']
    if not all(field in data for field in required_fields):
        print("缺少必要字段:", data)
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        # passenger_id = Passenger.get_or_create_passenger(
        #     data['PassengerID'],
        #     data['passengerName']
        # )
        passenger_id = data['PassengerID']
        TicketSale.create_ticket_sale(
            passenger_id,
            data['cabinPricingID'],
            data['flightDate'],
            data['price']
        )
        return jsonify({"message": "交易成功"}), 200
    except mysql.connector.Error as e:
        # 捕获数据库触发器抛出的异常（如超售）
        if e.sqlstate == '45000':
            return jsonify({"error": e.msg}), 400
        return jsonify({"error": "交易失败", "detail": str(e)}), 500

@passenger_api.route('/advancedtransaction', methods=['POST'])
def make_advancedtransaction():
    data = request.get_json()
    required_fields = ['PassengerID', 'cabinPricingID', 'flightDate', 'prices']
    if not all(field in data for field in required_fields):
        print("缺少必要字段:", data)
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        passenger_id = data['PassengerID']
        pricingids = data['cabinPricingID']
        prices = data['prices']
        for pricingid in pricingids:
            print(f"正在处理定价ID: {pricingid}")
            TicketSale.create_ticket_sale(
                passenger_id,
                pricingid,
                data['flightDate'],
                prices[pricingids.index(pricingid)] 
            )
        return jsonify({"message": "交易成功"}), 200
    except mysql.connector.Error as e:
        # 捕获数据库触发器抛出的异常（如超售）
        if e.sqlstate == '45000':
            return jsonify({"error": e.msg}), 400
        return jsonify({"error": "交易失败", "detail": str(e)}), 500


# ====================== 查询用户信息 ======================
@passenger_api.route('/profile', methods=['GET'])
def query_profile():
    id_number = request.args.get('idNumber')
    if not id_number:
        return jsonify({"error": "请提供身份证号"}), 400
    try:
        profile = Passenger.get_profile(id_number)
        return jsonify(profile), 200
    except mysql.connector.Error as e:
        return jsonify({"error": "查询失败", "detail": str(e)}), 500


# ====================== 查询乘客交易记录 ======================
@passenger_api.route('/passenger-transactions', methods=['GET'])
def query_transactions():
    id_number = request.args.get('idNumber')
    if not id_number:
        return jsonify({"error": "请提供身份证号"}), 400

    try:
        # passenger_id = Passenger.get_or_create_passenger(id_number, "")  # 无需姓名，仅查询
        # passenger_id = Passenger.get_passenger_by_name(id_number)
        transactions = TicketSale.get_transactions_by_passenger(id_number)
        # print(f'查询到的交易记录: {transactions}')
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@passenger_api.route('/get-passenger-id', methods=['GET'])
def get_passenger_id_by_name():
    """
    Return the passenger_id based on the current passenger name (query param: passengerName)
    """
    passenger_name = request.args.get('passengerName')
    if not passenger_name:
        return jsonify({"error": "请提供乘客姓名 (passengerName)"}), 400
    try:
        passenger = Passenger.get_passenger_by_name(passenger_name)
        if not passenger:
            return jsonify({"error": "未找到该乘客信息"}), 404
        return jsonify({
            "passenger_id": passenger.get("PassengerID")
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@passenger_api.route('/all-cabin-pricing', methods=['GET'])
def get_all_cabin_pricing():
    """
    Return all available cabin pricing information, including PricingID, FlightID, DepartureAirportID, ArrivalAirportID, CabinLevel, Price, DiscountRate.
    """
    try:
        from db.models import CabinPricing, Flight
        flights = Flight.get_all_flights()
        all_pricings = []
        for flight in flights:
            flight_id = flight.get('FlightID')
            if flight_id:
                pricings = CabinPricing.get_all_pricings(flight_id)
                if pricings:
                    for p in pricings:
                        # Only include relevant fields
                        all_pricings.append({
                            'PricingID': p.get('PricingID'),
                            'FlightID': p.get('FlightID'),
                            'DepartureAirportID': p.get('DepartureAirportID'),
                            'ArrivalAirportID': p.get('ArrivalAirportID'),
                            'CabinLevel': p.get('CabinLevel'),
                            'Price': p.get('Price'),
                            'DiscountRate': p.get('DiscountRate')
                        })
        return jsonify(all_pricings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500