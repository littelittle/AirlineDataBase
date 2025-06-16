from flask import Blueprint, request, jsonify
from db.models import Passenger, CabinPricing, TicketSale, Airport
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
    if not weekday:
        return jsonify({"error": "请提供查询的日期"}), 400
    if not departure_airport_id or not arrival_airport_id:
        return jsonify({"error": "请提供出发和到达机场代码"}), 400

    try:
        pricings = CabinPricing.query_pricing_by_airports_week(departure_airport_id, arrival_airport_id, weekday)
        if not pricings:
            pricings = CabinPricing.query_pricing_by_airports(departure_airport_id, arrival_airport_id)
            if not pricings:
                return jsonify(None), 200
            else: 
                return jsonify(pricings), 201
        return jsonify(pricings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====================== 购买产品（创建交易） ======================
@passenger_api.route('/transaction', methods=['POST'])
def make_transaction():
    data = request.get_json()
    required_fields = ['idNumber', 'cabinPricingID', 'flightDate', 'price']
    if not all(field in data for field in required_fields):
        print("缺少必要字段:", data)
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        # passenger_id = Passenger.get_or_create_passenger(
        #     data['idNumber'],
        #     data['passengerName']
        # )
        passenger_id = data['idNumber']
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