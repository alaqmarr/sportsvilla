import sqlite3

def query():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT mobile, walletBalance FROM Member;")
    print("Members:", cursor.fetchall())
    
    cursor.execute("SELECT * FROM WalletTransaction;")
    print("Transactions:", cursor.fetchall())
    conn.close()

if __name__ == '__main__':
    query()
