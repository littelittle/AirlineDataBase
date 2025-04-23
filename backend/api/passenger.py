from flask import Blueprint, request, jsonify
from db.models import Passenger, CabinPricing, TicketSale

passenger_api = Blueprint('passenger_api', __name__)

# ====================== 查询可用产品 ======================
@passenger_api.route('/query-products', methods=['GET'])
def query_products():
    departure_airport_id = request.args.get('departureAirportID')
    arrival_airport_id = request.args.get('arrivalAirportID')
    if not departure_airport_id or not arrival_airport_id:
        return jsonify({"error": "请提供出发和到达机场代码"}), 400

    try:
        pricings = CabinPricing.query_pricing_by_airports(departure_airport_id, arrival_airport_id)
        if not pricings:
            return jsonify({"message": "无可用产品"}), 200
        return jsonify(pricings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====================== 购买产品（创建交易） ======================
@passenger_api.route('/make-transaction', methods=['POST'])
def make_transaction():
    data = request.get_json()
    required_fields = ['idNumber', 'passengerName', 'cabinPricingID', 'flightDate']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        passenger_id = Passenger.get_or_create_passenger(
            data['idNumber'],
            data['passengerName']
        )
        TicketSale.create_ticket_sale(
            passenger_id,
            data['cabinPricingID'],
            data['flightDate']
        )
        return jsonify({"message": "交易成功"}), 200
    except mysql.connector.Error as e:
        # 捕获数据库触发器抛出的异常（如超售）
        if e.sqlstate == '45000':
            return jsonify({"error": e.msg}), 400
        return jsonify({"error": "交易失败", "detail": str(e)}), 500

# ====================== 查询乘客交易记录 ======================
@passenger_api.route('/query-transactions', methods=['GET'])
def query_transactions():
    id_number = request.args.get('idNumber')
    if not id_number:
        return jsonify({"error": "请提供身份证号"}), 400

    try:
        passenger_id = Passenger.get_or_create_passenger(id_number, "")  # 无需姓名，仅查询
        transactions = TicketSale.get_transactions_by_passenger(passenger_id)
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500