import sqlite3
import datetime

conn = sqlite3.connect('dev.db')
cursor = conn.cursor()
cursor.execute('''
    INSERT OR REPLACE INTO Setting (key, value, updatedAt)
    VALUES (?, ?, ?)
''', ('sv_points_conversion_rate', '0.01', datetime.datetime.now().isoformat()))
conn.commit()
conn.close()
print("Conversion rate set to 0.01")
