import os
import re
from pathlib import Path

def fix_theme_in_dir(directory):
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        orig_content = content

        # Replace pure light background
        content = re.sub(r'\bbg-white\b', 'bg-[#161923]', content)
        
        # Replace light grays backgrounds
        content = re.sub(r'\bbg-gray-50\b', 'bg-[#0b0e14]', content)
        content = re.sub(r'\bbg-gray-100\b', 'bg-[#0b0e14]', content)
        content = re.sub(r'\bbg-gray-200\b', 'bg-[#2a2d3e]', content)
        
        # Replace borders
        content = re.sub(r'\bborder-gray-200\b', 'border-[#2a2d3e]', content)
        content = re.sub(r'\bborder-gray-300\b', 'border-[#2a2d3e]', content)
        
        # Replace text colors
        content = re.sub(r'\btext-gray-900\b', 'text-white', content)
        content = re.sub(r'\btext-gray-800\b', 'text-gray-200', content)
        content = re.sub(r'\btext-gray-700\b', 'text-gray-300', content)
        content = re.sub(r'\btext-gray-600\b', 'text-gray-400', content)
        content = re.sub(r'\btext-black\b', 'text-white', content)
        
        # Replace generic 'border ' to add color if it lacks one (crude but usually works for inputs)
        # only if it's strictly 'border ' or 'border"' not followed by a color
        content = re.sub(r'\bborder\b(?!-)', 'border border-[#2a2d3e]', content)
        # Deduplicate if we created 'border border border'
        content = content.replace('border border border-[#2a2d3e]', 'border border-[#2a2d3e]')
        content = content.replace('border border-[#2a2d3e] border-[#2a2d3e]', 'border border-[#2a2d3e]')

        # Inputs specific - add text-white and bg to inputs that just have border and p-2
        # A bit tricky, let's just ensure they have bg-[#0b0e14] if they are inputs.
        # Actually, adding text-white globally to inputs might be hard with regex. 
        # But replacing text-gray-xxx and bg-white covers 90% of it.

        if content != orig_content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {path}")

fix_theme_in_dir('src/app/(admin)')
