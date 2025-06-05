import traceback

from db.db_manager import execute_query, fetch_query, get_db_connection
from db.utils import *

# ====================== 城市 ======================
class City:
    @staticmethod
    def add_city(Cityname):
        """添加城市"""
        conn = get_db_connection()
        query = "INSERT INTO City (CityName) VALUES (%s)"
        params = (Cityname,)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"添加城市时出错: {e}")
            traceback.print_exc()
        finally:
            conn.close()
    @staticmethod
    def get_cities():
        """获取所有城市信息"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM City"
            cursor.execute(query)
            cities = cursor.fetchall()
            # 获取列名
            columns = [column[0] for column in cursor.description]
            # 将查询结果转换为字典列表
            city_list = []
            for city in cities:
                city_dict = dict(zip(columns, city))
                city_list.append(city_dict)
            return city_list
        except Exception as e:
            print(f"查询城市信息时出错: {e}")
            traceback.print_exc()
            return []
        finally:
            conn.close()

    @staticmethod
    def delete_city(city_id):
        """删除城市信息"""
        conn = get_db_connection()
        query = "DELETE FROM City WHERE CityID = (%s)"
        params = (city_id,)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"删除城市信息时出错: {e}")
            traceback.print_exc()
        finally:
            conn.close()

    @staticmethod
    def update_city(city_id, city_name):
        """更新城市信息"""
        conn = get_db_connection()
        query = "UPDATE City SET CityName = (%s) WHERE CityID = (%s)"
        params = (city_name, city_id)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"更新城市信息时出错: {e}")
            traceback.print_exc()
        finally:
            conn.close()

# ====================== 机场管理 ======================
class Airport:
    @staticmethod
    def add_airport(AirportCode, CityID, Name):
        """添加航班经停机场"""
        conn = get_db_connection()
        query = """
        INSERT INTO Airport (AirportCode, Name, CityID) VALUES (%s,%s,%s)
        """
        params = (AirportCode, Name, CityID)
        execute_query(conn, query, params)
        conn.close()

    @staticmethod
    def get_airports():
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM Airport"
            cursor.execute(query)
            airports = cursor.fetchall()
            airport_list = []
            # 获取列名
            columns = [column[0] for column in cursor.description]
            for airport in airports:
                # 手动将元组转换为字典
                airport_dict = dict(zip(columns, airport))
                airport_list.append(airport_dict)
            return airport_list
        except Exception as e:
            print(f"查询机场信息时出错: {e}")
            return []
        finally:
            conn.close()

    @staticmethod
    def delete_airport(airport_code):
        conn = get_db_connection()
        query = "DELETE FROM Airport WHERE AirportCode = (%s)"
        params = (airport_code,)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"删除机场信息时出错: {e}")
        finally:
            conn.close()

    @staticmethod
    def update_airport(AirportCode, CityID, Name):
        conn = get_db_connection()
        query = "UPDATE Airport SET CityID = (%s), Name = (%s) WHERE AirportCode = (%s)"
        params = (CityID, Name, AirportCode)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"更新机场信息时出错: {e}")
        finally:
            conn.close()

# ====================== 航班相关 ======================
class Flight:
    @staticmethod
    def create_flight(flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days):
        """创建航班"""
        conn = get_db_connection()
        query = """
        INSERT INTO Flight (FlightID, AircraftType, FirstClassSeats, EconomySeats, WeeklyFlightDays)
        VALUES (%s,%s,%s,%s,%s)
        """
        params = (flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days)
        try:
            execute_query(conn, query, params)
            print("航班创建成功")
        except Exception as e:
            print(f"创建航班时出错: {e}")
        finally:
            conn.close()
    @staticmethod
    def get_all_flights():
        """获取所有航班"""
        conn = get_db_connection()
        query = "SELECT * FROM Flight"
        flights = fetch_query(conn, query)
        conn.close()
        flight_list = [dict(flight) for flight in flights]
        return flight_list

    @staticmethod
    def get_flight(flight_id):
        """获取单个航班信息"""
        conn = get_db_connection()
        query = "SELECT * FROM Flight WHERE FlightID = %s"
        params = (flight_id,)
        flight = fetch_query(conn, query, params)
        conn.close()
        return dict(flight[0]) if flight else None

    @staticmethod
    def update_flight(flight_id, aircraft_type, first_class_seats, economy_seats, weekly_flight_days):
        """更新航班信息"""
        conn = get_db_connection()
        query = """
        UPDATE Flight
        SET AircraftType = %s, FirstClassSeats = %s, EconomySeats = %s, WeeklyFlightDays = %s
        WHERE FlightID = %s
        """
        params = (aircraft_type, first_class_seats, economy_seats, weekly_flight_days, flight_id)
        try:
            execute_query(conn, query, params)
            print("航班信息更新成功")
        except Exception as e:
            print(f"更新航班信息时出错: {e}")
        finally:
            conn.close()


    @staticmethod
    def delete_flight(flight_id):
        """删除航班信息"""
        conn = get_db_connection()
        # 先删除关联表中的数据
        FlightAirport.delete_flight_airports(flight_id)
        query = "DELETE FROM Flight WHERE FlightID = %s"
        params = (flight_id,)
        execute_query(conn, query, params)
        conn.close()

# ====================== 航班与机场关联 ======================
class FlightAirport:
    @staticmethod
    def add_flight_airport(flight_id, airport_code, stop_order):
        """添加航班经停机场"""
        conn = get_db_connection()
        query = """
        INSERT INTO Flight_Airport (FlightID, AirportCode, StopOrder)
        VALUES (%s,%s,%s)
        """
        params = (flight_id, airport_code, stop_order)
        execute_query(conn, query, params)
        conn.close()

    @staticmethod
    def get_flight_airports(flight_id):
        """获取航班的所有经停机场"""
        conn = get_db_connection()
        query = "SELECT * FROM Flight_Airport WHERE FlightID = %s"
        params = (flight_id,)
        airports = fetch_query(conn, query, params)
        conn.close()
        airport_list = [dict(airport) for airport in airports]
        return airport_list

    @staticmethod
    def update_flight_airport(flight_id, airport_code, stop_order):
        """更新航班经停机场信息"""
        conn = get_db_connection()
        query = """
        UPDATE Flight_Airport
        SET AirportCode = %s, StopOrder = %s
        WHERE FlightID = %s
        """
        params = (airport_code, stop_order, flight_id)
        execute_query(conn, query, params)
        conn.close()

    @staticmethod
    def delete_flight_airport(flight_id, stop_order):
        """删除航班的某个经停机场"""
        conn = get_db_connection()
        query = "DELETE FROM Flight_Airport WHERE FlightID = %s AND StopOrder = %s"
        params = (flight_id, stop_order)
        execute_query(conn, query, params)
        conn.close()

    @staticmethod
    def delete_flight_airports(flight_id):
        """删除航班的所有经停机场"""
        conn = get_db_connection()
        query = "DELETE FROM Flight_Airport WHERE FlightID = %s"
        params = (flight_id,)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"删除经停机场时出错: {e}")
        finally:
            conn.close()

# ====================== 舱位定价 ======================
class CabinPricing:
    @staticmethod
    def create_pricing(flight_id, departure_airport_id, arrival_airport_id, cabin_level, price, discount_rate):
        """创建舱位定价（带异常处理）"""
        conn = get_db_connection()
        query = """
        INSERT INTO CabinPricing (FlightID, DepartureAirportID, ArrivalAirportID, CabinLevel, Price, DiscountRate)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (flight_id, departure_airport_id, arrival_airport_id, cabin_level, price, discount_rate)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"创建定价失败: {e}")
            raise  # 向上抛出异常，可在路由中统一捕获

    @staticmethod
    def delete_pricing(id):
        """删除舱位定价（带异常处理）"""
        conn = get_db_connection()
        query = "DELETE FROM CabinPricing WHERE PricingID = %s"
        params = (id,)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"删除定价失败: {e}")
            raise

    @staticmethod
    def update_pricing(id, flight_id, departure_airport_id, arrival_airport_id, cabin_level, price, discount_rate):
        """更新舱位定价（带异常处理）"""
        conn = get_db_connection()
        query = """
        UPDATE CabinPricing
        SET FlightID = %s, DepartureAirportID = %s, ArrivalAirportID = %s, CabinLevel = %s, Price = %s, DiscountRate = %s
        WHERE PricingID = %s
        """
        params = (flight_id, departure_airport_id, arrival_airport_id, cabin_level, price, discount_rate, id)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f"更新定价失败: {e}")
            raise

    @staticmethod
    def get_all_pricings(FlightID):
        """获取所有舱位定价（带异常处理）"""
        conn = get_db_connection()
        query = "SELECT * FROM CabinPricing where FlightID=%s"
        params = (FlightID,)
        try:
            return fetch_query(conn, query, params)
        except Exception as e:
            print(f"查询航班所有定价失败: {e}")
            raise

    @staticmethod
    def query_pricing_by_airports(departure_airport_id, arrival_airport_id):
        """按起降机场查询定价（带异常处理）"""
        conn = get_db_connection()
        query = """
        SELECT cp.*, f.FlightID, f.WeeklyFlightDays, a_dep.Name AS DepartureAirportName, a_arr.Name AS ArrivalAirportName
        FROM CabinPricing cp
        JOIN Flight f ON cp.FlightID = f.FlightID
        JOIN Airport a_dep ON cp.DepartureAirportID = a_dep.AirportCode
        JOIN Airport a_arr ON cp.ArrivalAirportID = a_arr.AirportCode
        WHERE cp.DepartureAirportID = %s AND cp.ArrivalAirportID = %s
        """
        params = (departure_airport_id, arrival_airport_id)
        try:
            return fetch_query(conn, query, params)
        except Exception as e:
            print(f"按机场查询定价失败: {e}")
            raise

# ====================== 乘客相关 ======================
class Passenger:

    @staticmethod
    def create_passenger_with_password(passenger_name, password):
        """
        Creates a new passenger with a name and password.
        Hashes the password before storing.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Check if passenger already exists by PassengerName
            query_check = "SELECT PassengerID FROM Passenger WHERE PassengerName = %s"
            existing_passenger = fetch_query(conn, query_check, (passenger_name,))
            if existing_passenger:
                # Optionally, you could raise an error or return a specific indicator
                print(f"Passenger with name '{passenger_name}' already exists.")
                return 'exists' # Or raise ValueError("Passenger name already exists")

            salt = generate_salt()
            hashed_pwd = hash_password(password, salt)

            query_create = """
                INSERT INTO Passenger (PassengerName, password_hash, salt)
                VALUES (%s, %s, %s)
            """
            params = (passenger_name, hashed_pwd, salt)
            execute_query(conn, query_create, params)
            conn.commit() # Make sure to commit the transaction
            return True
        except Exception as e:
            if conn:
                conn.rollback() # Rollback on error
            print(f"Error creating passenger: {e}")
            return None # Or re-raise the exception
        finally:
            if conn:
                conn.close()

    @staticmethod
    def get_passenger_by_name(passenger_name):
        """
        Retrieves passenger details (including password hash and salt) by PassengerName.
        """
        conn = None
        try:
            conn = get_db_connection()
            query = """
                SELECT PassengerID, PassengerName, password_hash, salt, is_active
                FROM Passenger
                WHERE PassengerName = %s
            """
            params = (passenger_name,)
            result = fetch_query(conn, query, params) # fetch_query should return a list of dicts
            if result:
                return result[0] # Return the first passenger found (PassengerName is UNIQUE)
            return None
        except Exception as e:
            print(f"Error fetching passenger by name: {e}")
            return None
        finally:
            if conn:
                conn.close()

    @staticmethod
    def get_profile(passnger_id):
        "根据passenger id获取用户全部信息"
        conn = None
        try:
            conn = get_db_connection()
            query = """
                SELECT PassengerName, created_at, updated_at, is_active
                FROM Passenger
                WHERE PassengerID = %s
            """
            params = (passnger_id,)
            result = fetch_query(conn, query, params) # fetch_query should return a list of dicts
            if result:
                return result 
            return None
        except Exception as e:
            print(f"Error fetching passenger profile by id: {e}")
            return None
        finally:
            if conn:
                conn.close()

    @staticmethod
    def get_or_create_passenger(id_number, passenger_name):
        """根据身份证号获取或创建乘客"""
        conn = get_db_connection()
        # 检查乘客是否存在
        query_check = "SELECT PassengerID FROM Passenger WHERE IDNumber = %s"
        params = (id_number,)
        result = fetch_query(conn, query_check, params)
        if result:
            passenger_id = result[0]['PassengerID']
        else:
            # 创建新乘客
            query_create = "INSERT INTO Passenger (IDNumber, PassengerName) VALUES (%s, %s)"
            execute_query(conn, query_create, (id_number, passenger_name))
            passenger_id = conn.cursor().lastrowid  # 获取自增 ID
        conn.close()
        return passenger_id

# ====================== 售票记录 ======================
class TicketSale:
    @staticmethod
    def create_ticket_sale(passenger_id, cabin_pricing_id, flight_date):
        """创建售票记录（触发超售检查触发器）"""
        conn = get_db_connection()
        # query = """
        # INSERT INTO TicketSale (PassengerID, CabinPricingID, FlightDate)
        # VALUES (%s, %s, %s)
        # """
        query = """
        CALL BookTicket(%s, %s, %s);
        """
        params = (passenger_id, cabin_pricing_id, flight_date)
        try:
            execute_query(conn, query, params)
        except Exception as e:
            print(f'购票失败：{e}')
            raise
        conn.close()

    @staticmethod
    def get_transactions_by_passenger(passenger_id):
        """查询乘客的所有交易记录"""
        conn = get_db_connection()
        query = """
        SELECT ts.TicketSaleID, ts.FlightDate, cp.*, f.FlightID, f.WeeklyFlightDays, p.PassengerName
        FROM TicketSale ts
        JOIN CabinPricing cp ON ts.CabinPricingID = cp.PricingID
        JOIN Passenger p ON ts.PassengerID = p.PassengerID
        JOIN Flight f ON cp.FlightID = f.FlightID
        WHERE ts.PassengerID = %s
        """
        params = (passenger_id,)
        transactions = fetch_query(conn, query, params)
        conn.close()
        return transactions
    
    @staticmethod
    def get_all_transactions():
        """获取所有舱位定价（带异常处理）"""
        conn = get_db_connection()
        query = "SELECT * FROM TicketSale"
        try:
            return fetch_query(conn, query)
        except Exception as e:
            print(f"查询所有机票交易失败: {e}")
            raise