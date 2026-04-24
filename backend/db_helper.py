import os
import time
import mysql.connector
from mysql.connector import Error

cnx = None


def get_connection():
    global cnx
    if cnx is not None and cnx.is_connected():
        return cnx

    retries = 10
    delay = 3
    for attempt in range(retries):
        try:
            cnx = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", "root"),
                database=os.getenv("DB_NAME", "pandeyji_eatery"),
                port=int(os.getenv("DB_PORT", "3306")),
                connection_timeout=10
            )
            print(f"DB connected on attempt {attempt + 1}")
            return cnx
        except Error as e:
            print(f"DB connection attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(delay)
    raise Exception("Could not connect to database after multiple retries")


def insert_order_item(food_item, quantity, order_id):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.callproc('insert_order_item', (food_item, quantity, order_id))
        connection.commit()
        cursor.close()
        print("Order item inserted successfully!")
        return 1
    except Error as err:
        print(f"Error inserting order item: {err}")
        connection.rollback()
        return -1
    except Exception as e:
        print(f"An error occurred: {e}")
        connection.rollback()
        return -1


def insert_order_tracking(order_id, status):
    connection = get_connection()
    cursor = connection.cursor()
    insert_query = "INSERT INTO order_tracking (order_id, status) VALUES (%s, %s)"
    cursor.execute(insert_query, (order_id, status))
    connection.commit()
    cursor.close()


def get_total_order_price(order_id):
    connection = get_connection()
    cursor = connection.cursor()
    query = f"SELECT get_total_order_price({order_id})"
    cursor.execute(query)
    result = cursor.fetchone()[0]
    cursor.close()
    return result


def get_next_order_id():
    connection = get_connection()
    cursor = connection.cursor()
    query = "SELECT MAX(order_id) FROM orders"
    cursor.execute(query)
    result = cursor.fetchone()[0]
    cursor.close()
    if result is None:
        return 1
    else:
        return result + 1


def get_order_status(order_id):
    connection = get_connection()
    cursor = connection.cursor()
    query = f"SELECT status FROM order_tracking WHERE order_id = {order_id}"
    cursor.execute(query)
    result = cursor.fetchone()
    cursor.close()
    if result:
        return result[0]
    else:
        return None
