import sqlite3

def query():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Booking ORDER BY createdAt DESC LIMIT 5;")
    bookings = cursor.fetchall()
    for b in bookings:
        print(b)
        
    cursor.execute("SELECT * FROM CouponUsage;")
    usages = cursor.fetchall()
    print("Usages count:", len(usages))
    if usages:
        print(usages)
    conn.close()

if __name__ == '__main__':
    query()
