import re

def fix_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # ContentClient specific
    content = content.replace('border p-4 rounded bg-[#0b0e14]', 'border border-[#2a2d3e] p-4 rounded bg-[#0b0e14]')
    content = content.replace('bg-gray-200 rounded disabled:opacity-30', 'bg-[#2a2d3e] text-white rounded hover:bg-[#3b3e4f] disabled:opacity-30')
    content = content.replace('text-red-600', 'text-red-500 hover:text-red-400')
    content = content.replace('text-gray-500', 'text-gray-400')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_theme('src/app/(admin)/tv/content/[groupId]/ContentClient.tsx')
