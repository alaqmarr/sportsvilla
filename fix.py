import re

def fix_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Cards
    content = content.replace('bg-white p-6 rounded shadow', 'bg-[#161923] p-6 rounded-xl border border-[#2a2d3e] shadow-lg')
    # Text
    content = content.replace('text-gray-600', 'text-gray-400')
    content = content.replace('text-gray-800 bg-gray-200', 'text-gray-400 bg-[#2a2d3e]')
    # Inputs
    content = content.replace('className="border p-2 rounded flex-1"', 'className="bg-[#0b0e14] border border-[#2a2d3e] p-2 rounded-lg flex-1 text-white focus:border-emerald-500 outline-none"')
    content = content.replace('className="border p-2 rounded w-full"', 'className="bg-[#0b0e14] border border-[#2a2d3e] p-2 rounded-lg w-full text-white focus:border-emerald-500 outline-none"')
    content = content.replace('className="border p-2 rounded w-24"', 'className="bg-[#0b0e14] border border-[#2a2d3e] p-2 rounded-lg w-24 text-white focus:border-emerald-500 outline-none"')
    # Badges
    content = content.replace('bg-gray-100 p-1', 'bg-[#0b0e14] text-emerald-400 p-1 px-2 rounded border border-[#2a2d3e]')
    # Borders
    content = content.replace('border-b"', 'border-b border-[#2a2d3e]"')
    content = content.replace('border-t"', 'border-t border-[#2a2d3e]"')
    # Backgrounds
    content = content.replace('bg-gray-50', 'bg-[#0b0e14]')
    # Buttons
    content = content.replace('bg-blue-600 text-white', 'bg-emerald-600 text-white hover:bg-emerald-700')
    # Link
    content = content.replace('text-blue-600', 'text-emerald-500 hover:text-emerald-400')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_theme('src/app/(admin)/tv/screens/ScreensClient.tsx')
fix_theme('src/app/(admin)/tv/content/[groupId]/ContentClient.tsx')
