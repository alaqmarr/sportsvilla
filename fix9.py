import re

filepath = 'src/app/(admin)/tv/content/[groupId]/ContentClient.tsx'
with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix the known corrupted bytes
content = content.replace('\ufffd\'', '\u2191') # Up arrow
content = content.replace('\ufffd\"', '\u2193') # Down arrow
content = content.replace('\ufffd?\ufffd', '\u2022') # Bullet

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
