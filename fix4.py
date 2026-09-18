import re

filepath = 'src/app/(admin)/tv/content/[groupId]/ContentClient.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Apply dark theme fixes manually and carefully
content = content.replace('bg-white p-6 rounded shadow flex gap-4 items-end', 'bg-[#161923] p-6 rounded-xl border border-[#2a2d3e] shadow-lg flex gap-4 items-end')
content = content.replace('className="border p-2 rounded w-full"', 'className="bg-[#0b0e14] border border-[#2a2d3e] p-2 rounded-lg w-full text-white focus:border-emerald-500 outline-none"')
content = content.replace('className="border p-2 rounded w-24"', 'className="bg-[#0b0e14] border border-[#2a2d3e] p-2 rounded-lg w-24 text-white focus:border-emerald-500 outline-none"')
content = content.replace('bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 h-[42px]', 'bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2 rounded disabled:opacity-50 h-[42px]')
content = content.replace('bg-white p-6 rounded shadow space-y-4', 'bg-[#161923] p-6 rounded-xl border border-[#2a2d3e] shadow-lg space-y-4')
content = content.replace('text-gray-500', 'text-gray-400')
content = content.replace('border p-4 rounded bg-gray-50', 'border border-[#2a2d3e] p-4 rounded bg-[#0b0e14]')
content = content.replace('p-1 bg-gray-200 rounded disabled:opacity-30', 'p-1 bg-[#2a2d3e] text-white rounded hover:bg-[#3b3e4f] disabled:opacity-30')
content = content.replace('text-red-600', 'text-red-500 hover:text-red-400')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
