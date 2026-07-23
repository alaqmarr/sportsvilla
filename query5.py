import sqlite3

def query():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, status, discountAmount FROM Booking;")
    bookings = cursor.fetchall()
    print("Bookings:", bookings)
    conn.close()

if __name__ == '__main__':
    query()
