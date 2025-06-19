import mysql.connector
from mysql.connector import Error
import os

# 数据库配置（请替换为你的实际信息）
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DBPassword'),
    'database': 'AirlineDB',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """获取数据库连接"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"数据库连接失败: {e}")
        raise

def execute_query(conn, query, params=None):
    """执行 SQL 查询（增删改）"""
    # print(f"执行的 SQL 语句: {query}")
    # print(f"传递的参数: {params}")
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        conn.commit()
    except Error as e:
        print(f"执行查询失败: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()

def fetch_query(conn, query, params=None):
    """执行 SQL 查询（查询数据）"""
    try:
        cursor = conn.cursor(dictionary=True)  # 返回字典形式结果
        cursor.execute(query, params or ())
        return cursor.fetchall()
    except Error as e:
        print(f"查询数据失败: {e}")
        raise
    finally:
        cursor.close()

def execute_many(conn, query, params_list=None):
    """批量执行 SQL 查询（如批量插入）"""
    try:
        cursor = conn.cursor()
        cursor.executemany(query, params_list or [])
        conn.commit()
    except Error as e:
        print(f"批量执行查询失败: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()