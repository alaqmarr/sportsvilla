import os
import re
from pathlib import Path

def fix_inputs(directory):
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        orig = content
        # Add bg-[#0b0e14] text-white to generic borders that are likely inputs
        content = content.replace('className="border border-[#2a2d3e] p-2 rounded"', 'className="border border-[#2a2d3e] p-2 rounded bg-[#0b0e14] text-white"')
        content = content.replace('className="border border-[#2a2d3e] p-2 rounded w-full"', 'className="border border-[#2a2d3e] p-2 rounded w-full bg-[#0b0e14] text-white"')
        content = content.replace('className="border border-[#2a2d3e] p-2 rounded flex-1"', 'className="border border-[#2a2d3e] p-2 rounded flex-1 bg-[#0b0e14] text-white"')
        
        # Also some blue buttons might still be lingering (like bg-blue-600)
        content = content.replace('bg-blue-600', 'bg-emerald-600 hover:bg-emerald-700')
        content = content.replace('text-blue-600', 'text-emerald-500 hover:text-emerald-400')

        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

fix_inputs('src/app/(admin)')
