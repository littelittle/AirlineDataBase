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
@admin_required
@admin_api.route('/manage-city', methods=['POST'])
def add_city():
    data = request.get_json()
    required_fields = ['Cityname']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        City.add_city(
            data['Cityname'],
        )
        return jsonify({"message": "城市创建成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 获取所有城市信息
@admin_required
@admin_api.route('/cities', methods=['GET'])
def get_cities():
    try:
        cities = City.get_cities()
        return jsonify(cities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 删除城市信息
@admin_required
@admin_api.route('/manage-city/<int:city_id>', methods=['DELETE'])
def delete_city(city_id):
    try:
        City.delete_city(city_id)
        return jsonify({"message": "城市删除成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 更新城市信息
@admin_required
@admin_api.route('/manage-city/<int:city_id>', methods=['PUT'])
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
@admin_required
@admin_api.route('/manage-airport', methods=['POST'])
def add_airport():
    data = request.get_json()
    required_fields = ['AirportCode', 'CityID', 'Name']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要字段"}), 400

    try:
        Airport.add_airport(
            data['AirportCode'],
            data['CityID'],
            data['Name']
        )
        return jsonify({"message": "机场创建成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 获取所有机场信息
@admin_required
@admin_api.route('/airports', methods=['GET'])
def get_airports():
    try:
        airports = Airport.get_airports()
        return jsonify(airports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 删除机场信息
@admin_required
@admin_api.route('/manage-airport/<string:AirportCode>', methods=['DELETE'])
def delete_airport(AirportCode):
    try:
        Airport.delete_airport(AirportCode)
        return jsonify({"message": "机场删除成功"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 更新机场信息
@admin_required
@admin_api.route('/manage-airport/<string:AirportCode>', methods=['PUT'])
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
@admin_required
@admin_api.route('/flights', methods=['POST'])
def create_flight_api():
    data = request.get_json()
    flight_id = data.get('flightID')
    aircraft_type = data.get('aircraftType')
    first_class_seats = data.get('FirstClassSeats')
    economy_seats = data.get('EconomyClassSeats')
    weekly_flight_days = data.get('WeeklyFlightDays')

    print(f"Received data for flight creation: {data}")
    print(flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days)
    if not all([flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days]):
        return jsonify({"error": "缺少必要参数"}), 400
    try:
        Flight.create_flight(flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days)
        for airport_stop_dict in data.get('stops'):
            FlightAirport.add_flight_airport(flight_id, airport_stop_dict['airportCode'], airport_stop_dict['stopOrder'])
        return jsonify({"message": "航班创建成功"}), 201
    except Exception as e:
        return jsonify({"error": f"更新航班信息时出错: {str(e)}"}), 500

@admin_required
@admin_api.route('/flights', methods=['GET'])
def get_all_flights_api():
    flights = Flight.get_all_flights()
    return jsonify(flights), 200

@admin_required
@admin_api.route('/flights/<flight_id>', methods=['GET'])
def get_flight_api(flight_id):
    flight = Flight.get_flight(flight_id)
    if flight:
        return jsonify(flight), 200
    else:
        return jsonify({"error": "未找到该航班"}), 404

@admin_required
@admin_api.route('/flights/<flight_id>', methods=['PUT'])
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

@admin_required
@admin_api.route('/flights/<flight_id>', methods=['DELETE'])
def delete_flight_api(flight_id):
    try:
        Flight.delete_flight(flight_id)
        return jsonify({"message": "航班删除成功"}), 200
    except Exception as e:
        return jsonify({"error": "航班删除失败"}), 500

def is_ordered_subsequence(old_list, new_list):
    if not old_list:  # 空的 old_list 总是任何列表的有序子序列
        return True

    old_idx = 0
    for item in new_list:
        if old_idx < len(old_list) and item == old_list[old_idx]:
            old_idx += 1
    return old_idx == len(old_list)

# 航班与机场关联接口
@admin_required
@admin_api.route('/flights/<flight_id>/airports', methods=['POST'])
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

@admin_required
@admin_api.route('/flights/<flight_id>/airports', methods=['GET'])
def get_flight_airports_api(flight_id):
    airports = FlightAirport.get_flight_airports(flight_id)
    return jsonify(airports), 200

@admin_required
@admin_api.route('/flights/<flight_id>/airports/<stop_order>', methods=['PUT'])
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

@admin_required
@admin_api.route('/flights/<flight_id>/airports/<stop_order>', methods=['DELETE'])
def delete_flight_airport_api(flight_id, stop_order):
    try:
        FlightAirport.delete_flight_airport(flight_id, int(stop_order))
        return jsonify({"message": "航班经停机场删除成功"}), 200
    except Exception as e:
        return jsonify({"error": "航班经停机场删除失败"}), 500

# ====================== 制定产品（舱位定价） ======================
# 创建产品
@admin_required
@admin_api.route('/create-product', methods=['POST'])
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
@admin_required
@admin_api.route('/delete-product/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        CabinPricing.delete_pricing(id)
        return jsonify({"message": "产品删除成功"}), 200
    except Exception as e:
        return jsonify({"error": "删除产品时出现数据库异常", "detail": str(e)}), 500


# 更新产品
@admin_required
@admin_api.route('/update-product/<int:id>', methods=['PUT'])
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
@admin_required
@admin_api.route('/products/<FlightID>', methods=['GET'])
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
@admin_required
@admin_api.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        transactions = TicketSale.get_all_transactions()
        # print(f'查询到的交易记录: {transactions}')
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": "查询产品时出现数据库异常", "detail": str(e)}), 500
