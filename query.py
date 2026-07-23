import sqlite3

def query():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Coupon;")
    print("Coupons:", cursor.fetchall())
    
    cursor.execute("SELECT * FROM CouponUsage;")
    print("Usages:", cursor.fetchall())
    conn.close()

if __name__ == '__main__':
    query()
