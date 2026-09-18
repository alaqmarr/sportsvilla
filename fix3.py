filepath = 'src/app/(admin)/reports/revenue/RevenueClient.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('rawAdminTokens.border border-[#2a2d3e]', 'rawAdminTokens.border')
content = content.replace('border border-[#2a2d3e]:', 'border:')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
