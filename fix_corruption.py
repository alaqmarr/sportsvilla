import os
from pathlib import Path

def remove_corruption(directory):
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        orig = content
        
        # \ufffd is the unicode replacement character
        if '\ufffd' in content:
            # We don't know exactly what character was lost. 
            # In JSX, usually it's a quote, a bullet, or arrow.
            # But just replacing \ufffd with nothing or fixing known cases.
            print(f"Found corruption in {path}")
            
            # The previous crash was due to e.target.files\ufffd?.[0] 
            # Wait, no, it was e.target.files\ufffd.[0]
            content = content.replace('files\ufffd.[0]', 'files?.[0]')
            content = content.replace('\ufffd', '')
            
        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed corruption in {path}")

def remove_corruption_ts(directory):
    for path in Path(directory).rglob('*.ts'):
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        orig = content
        if '\ufffd' in content:
            print(f"Found corruption in {path}")
            content = content.replace('\ufffd', '')
        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed corruption in {path}")

remove_corruption('src/app')
remove_corruption_ts('src/app')
