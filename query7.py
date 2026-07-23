import sqlite3

def query():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, createdAt, discountAmount, advancePaid, amountDue, paymentStatus FROM Booking ORDER BY createdAt DESC LIMIT 5;")
    bookings = cursor.fetchall()
    print("Recent Bookings:", bookings)
    conn.close()

if __name__ == '__main__':
    query()
