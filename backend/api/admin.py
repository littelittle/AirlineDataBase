import pyrootutils
root = pyrootutils.setup_root(
    search_from=__file__,
    indicator=["pyproject.toml"],
    pythonpath=True,
    dotenv=True,
)

import json
from decimal import Decimal
from functools import wraps
from db.models import Airport, CabinPricing, City, Flight, FlightAirport, TicketSale
from flask import Blueprint, jsonify, request

admin_api = Blueprint('admin_api', __name__)

import sqlite3  # 假设使用 SQLite 数据库，你可以根据实际情况更换为其他数据库

from db.utils import verify_token  
import datetime

# ====================== Admin Authentications ======================# 


def admin_required(f): 
    """
    This decorator must be put above any admin API route to ensure that the user is an admin. 
    And it must be put right above the definition to make it applied first
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract token from headers/cookies
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Requesting an admin api without token'}), 401
        # Verify token and extract user info (implement verify_token yourself)
        user = verify_token(token)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function









# ====================== 管理城市 ======================# 添加城市信息

@admin_api.route('/manage-city', methods=['POST'])
@admin_required
def add_city():
    data = request.get_json()
    if 'Cityname' not in data:
        return jsonify({"error": "缺少必要字段"}), 400

    citynames = data['Cityname']
    if not isinstance(citynames, (str, list)):
        return jsonify({"error": "Cityname must be a string or a list of strings"}), 400

    try:
        result = City.add_city(citynames)
        msg = "城市创建成功"
        if isinstance(citynames, list):
            msg = f"{len(result['success'])} 个城市创建成功"
        response = {"message": msg, "success": result['success'], "failed": result['failed']}
        if result['failed']:
            response["warning"] = f"以下城市未能添加（可能已存在）: {', '.join(result['failed'])}"
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 获取所有城市信息
@admin_api.route('/cities', methods=['GET'])
@admin_required
def get_cities():
    try:
        cities = City.get_cities()
        return jsonify(cities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 删除城市信息
@admin_api.route('/manage-city/<int:city_id>', methods=['DELETE'])
@admin_required
def delete_city(city_id):
    try:
        City.delete_city(city_id)
        return jsonify({"message": "城市删除成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 更新城市信息
@admin_api.route('/manage-city/<int:city_id>', methods=['PUT'])
@admin_required
def update_city(city_id):
    data = request.get_json()
    required_fields = ['Cityname']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        City.update_city(
            city_id,
            data['Cityname']
        )
        return jsonify({"message": "城市信息更新成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ====================== 管理机场 ======================

# 添加机场信息
@admin_api.route('/manage-airport', methods=['POST'])
@admin_required
def add_airport(): 
    """
    添加机场信息
    接收 JSON 数据，包含 AirportCode, CityID 或 Cityname, Name
    如果 CityID 不存在，则尝试通过 Cityname 查找 CityID
    """
    data = request.get_json()
    # Accept either CityID or Cityname
    if 'AirportCode' not in data or 'Name' not in data:
        return jsonify({"error": "缺少必要字段 (AirportCode, Name)"}), 400

    city_id = data.get('CityID')
    city_name = data.get('Cityname')
    if not city_id:
        if not city_name:
            return jsonify({"error": "缺少必要字段 (CityID 或 Cityname)"}), 400
        # Try to find CityID by Cityname
        found_city_id = City.get_city_id_by_name(city_name)
        if not found_city_id:
            return jsonify({"error": f"未找到城市: {city_name}"}), 400
        city_id = found_city_id

    try:
        Airport.add_airport(
            data['AirportCode'],
            city_id,
            data['Name']
        )
        return jsonify({"message": "机场创建成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 获取所有机场信息
@admin_api.route('/airports', methods=['GET'])
@admin_required
def get_airports():
    try:
        airports = Airport.get_airports()
        return jsonify(airports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 删除机场信息
@admin_api.route('/manage-airport/<string:AirportCode>', methods=['DELETE'])
@admin_required
def delete_airport(AirportCode):
    try:
        Airport.delete_airport(AirportCode)
        return jsonify({"message": "机场删除成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 更新机场信息
@admin_api.route('/manage-airport/<string:AirportCode>', methods=['PUT'])
@admin_required
def update_airport(AirportCode):
    data = request.get_json()
    required_fields = ['CityID', 'Name']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        Airport.update_airport(
            AirportCode,
            data['CityID'],
            data['Name']
        )
        return jsonify({"message": "机场信息更新成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====================== 航班管理 ======================

# 航班相关接口
@admin_api.route('/flights', methods=['POST'])
@admin_required
def create_flight_api():
    data = request.get_json()
    flight_id = data.get('flightID')
    aircraft_type = data.get('aircraftType')
    first_class_seats = data.get('FirstClassSeats')
    economy_seats = data.get('EconomyClassSeats')
    weekly_flight_days = data.get('WeeklyFlightDays')
    stops = data.get('stops')

    print(f"Received data for flight creation: {data}")
    print(f"{flight_id}, {aircraft_type}, {first_class_seats}, {economy_seats}, {weekly_flight_days}")
    if not all([flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days, stops]):
        return jsonify({"error": "缺少必要参数"}), 400
    try:
        Flight.create_flight(flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days)
        if len(stops) < 2: 
            # 如果没有至少两个经停机场, 同样返回缺少参数
            return jsonify({"error": "至少需要两个经停机场"}), 400

        for airport_stop_dict in stops:
            print(f"Inserting stop: {airport_stop_dict}")
            # breakpoint()
            FlightAirport.add_flight_airport(flight_id, airport_stop_dict['AirportCode'], airport_stop_dict['stopOrder'])
        return jsonify({"message": "航班创建成功"}), 201
    except Exception as e:
        return jsonify({"error": f"更新航班信息时出错: {str(e)}"}), 500

@admin_api.route('/flights', methods=['GET'])
@admin_required
def get_all_flights_api():
    flights = Flight.get_all_flights()
    return jsonify(flights), 200

@admin_api.route('/flights/<flight_id>', methods=['GET'])
@admin_required
def get_flight_api(flight_id):
    flight = Flight.get_flight(flight_id)
    if flight:
        return jsonify(flight), 200
    else:
        return jsonify({"error": "未找到该航班"}), 404


@admin_api.route('/flights/<flight_id>', methods=['PUT'])
@admin_required
def update_flight_api(flight_id):
    data = request.get_json()
    aircraft_type = data.get('AircraftType')
    first_class_seats = data.get('FirstClassSeats')
    economy_seats = data.get('EconomySeats')
    weekly_flight_days = data.get('WeeklyFlightDays')
    if not all([aircraft_type, first_class_seats, economy_seats, weekly_flight_days]):
        return jsonify({"error": "缺少必要参数"}), 400
    try:
        Flight.update_flight(flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days)
        return jsonify({"message": "航班信息更新成功"}), 200
    except Exception as e:
        return jsonify({"error": f"更新航班信息时出错: {str(e)}"}), 500


@admin_api.route('/flights/<flight_id>', methods=['DELETE'])
@admin_required
def delete_flight_api(flight_id):
    try:
        Flight.delete_flight(flight_id)
        return jsonify({"message": "航班删除成功"}), 200
    except Exception as e:
        # Return the actual error message to the frontend
        return jsonify({"error": str(e)}), 400

def is_ordered_subsequence(old_list, new_list):
    if not old_list:  # 空的 old_list 总是任何列表的有序子序列
        return True

    old_idx = 0
    for item in new_list:
        if old_idx < len(old_list) and item == old_list[old_idx]:
            old_idx += 1
    return old_idx == len(old_list)

# 航班与机场关联接口
@admin_api.route('/flights/<flight_id>/airports', methods=['POST'])
@admin_required
def add_flight_airport_api(flight_id):
    data = request.get_json()
    # airport_code = data.get('AirportCode')
    # stop_order = data.get('StopOrder')
    old_airports = data.get('OriginalStops')
    new_airports = data.get('ModifiedStops')
    print(f"Received data for flight airport creation: {old_airports}, {new_airports}")
    if not all([old_airports, new_airports]):
        return jsonify({"error": "缺少必要参数"}), 400
    try:
        # 检查新机场列表是否是旧机场列表的有序子序列
        if not is_ordered_subsequence(old_airports, new_airports):
            print("新机场列表不是旧机场列表的有序子序列")
            return jsonify({"error": "权限不够！需为顺序子序列！不可删除已有机场"}), 400
        
        for i, airport_code in enumerate(new_airports[:len(old_airports)]):
            FlightAirport.update_flight_airport(flight_id, airport_code, i + 1)
        for i in range(len(old_airports), len(new_airports)):
            FlightAirport.add_flight_airport(flight_id, new_airports[i], i + 1)

        return jsonify({"message": "航班经停机场添加成功"}), 201
    
    except Exception as e:
        return jsonify({"error": f"航班经停机场添加失败: {str(e)}"}), 500
    # if not all([airport_code, stop_order]):
    #     return jsonify({"error": "缺少必要参数"}), 400
    # try:
    #     FlightAirport.add_flight_airport(flight_id, airport_code, stop_order)
    #     return jsonify({"message": "航班经停机场添加成功"}), 201
    # except Exception as e:
    #     return jsonify({"error": "航班经停机场添加失败"}), 500


@admin_api.route('/flights/<flight_id>/airports', methods=['GET'])
@admin_required
def get_flight_airports_api(flight_id):
    airports = FlightAirport.get_flight_airports(flight_id)
    print(f"[DEBUG] get_flight_airports_api({flight_id}) result: {airports}")
    if not airports:
        print(f"[WARNING] No stops found for flight {flight_id}")
    return jsonify(airports), 200


@admin_api.route('/flights/<flight_id>/airports/<stop_order>', methods=['PUT'])
@admin_required
def update_flight_airport_api(flight_id, stop_order):
    data = request.get_json()
    airport_code = data.get('AirportCode')
    if not airport_code:
        return jsonify({"error": "缺少必要参数"}), 400
    try:
        FlightAirport.update_flight_airport(flight_id, airport_code, int(stop_order))
        return jsonify({"message": "航班经停机场信息更新成功"}), 200
    except Exception as e:
        return jsonify({"error": "航班经停机场信息更新失败"}), 500


@admin_api.route('/flights/<flight_id>/airports/<stop_order>', methods=['DELETE'])
@admin_required
def delete_flight_airport_api(flight_id, stop_order):
    try:
        FlightAirport.delete_flight_airport(flight_id, int(stop_order))
        return jsonify({"message": "航班经停机场删除成功"}), 200
    except Exception as e:
        return jsonify({"error": "航班经停机场删除失败"}), 500

# ====================== 制定产品（舱位定价） ======================
# 创建产品
@admin_api.route('/create-product', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json()
    required_fields = ['flightID', 'departureAirport', 'arrivalAirport', 'cabinClass', 'price', 'discount']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        CabinPricing.create_pricing(
            data['flightID'],
            data['departureAirport'],
            data['arrivalAirport'],
            data['cabinClass'],
            data['price'],
            data['discount']
        )
        return jsonify({"message": "产品制定成功"}), 200
    except Exception as e:
        return jsonify({"error": "机场顺序错误或数据库异常", "detail": str(e)}), 500


# 删除产品
@admin_api.route('/delete-product/<int:id>', methods=['DELETE'])
@admin_required
def delete_product(id):
    try:
        CabinPricing.delete_pricing(id)
        return jsonify({"message": "产品删除成功"}), 200
    except Exception as e:
        return jsonify({"error": "删除产品时出现数据库异常", "detail": str(e)}), 500


# 更新产品
@admin_api.route('/update-product/<int:id>', methods=['PUT'])
@admin_required
def update_product(id):
    data = request.get_json()
    required_fields = ['flightID','departureAirport', 'arrivalAirport', 'cabinClass', 'price', 'discount']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        CabinPricing.update_pricing(
            id,
            data['flightID'],
            data['departureAirport'],
            data['arrivalAirport'],
            data['cabinClass'],
            data['price'],
            data['discount']
        )
        return jsonify({"message": "产品更新成功"}), 200
    except Exception as e:
        return jsonify({"error": "更新产品时出现数据库异常", "detail": str(e)}), 500


# 查询所有产品
@admin_api.route('/products/<FlightID>', methods=['GET'])
@admin_required
def get_products(FlightID):
    try:
        pricings = CabinPricing.get_all_pricings(FlightID)
        # 转换为字典列表
        pricings_dict = []
        for pricing in pricings:
            new_pricing = {}
            for key, value in pricing.items():
                if isinstance(value, Decimal):
                    new_pricing[key] = float(value)
                else:
                    new_pricing[key] = value
            pricings_dict.append(new_pricing)
        return jsonify(pricings_dict), 200
    except Exception as e:
        return jsonify({"error": "查询产品时出现数据库异常", "detail": str(e)}), 500
    
# ====================== 查询交易记录 ======================

# 查询交易记录
@admin_api.route('/transactions', methods=['GET'])
@admin_required
def get_transactions():
    try:
        transactions = TicketSale.get_all_transactions()
        # print(f'查询到的交易记录: {transactions}')
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": "查询产品时出现数据库异常", "detail": str(e)}), 500

# 清空所有数据接口（仅限测试/开发使用）
from db.models import Passenger
@admin_api.route('/clear-all', methods=['POST'])
@admin_required
def clear_all():
    """
    Danger: Clear all data from all tables in the database.
    This should only be used for testing/dev purposes!
    """
    try:
        from db.db_manager import get_db_connection, execute_query
        conn = get_db_connection()
        # Disable foreign key checks
        execute_query(conn, "SET FOREIGN_KEY_CHECKS = 0;")
        # Truncate all tables in the correct order
        tables = [
            'TicketSale',
            'CabinPricing',
            'Flight_Airport',
            'Flight',
            'Airport',
            'City',
            'Passenger'
        ]
        for table in tables:
            execute_query(conn, f"TRUNCATE TABLE {table};")
        # Re-enable foreign key checks
        execute_query(conn, "SET FOREIGN_KEY_CHECKS = 1;")
        conn.close()
        Passenger.ensure_admin_exists()
        return jsonify({"message": "All data cleared."}), 200
    except Exception as e:
        return jsonify({"error": f"清空数据库失败: {str(e)}"}), 500
