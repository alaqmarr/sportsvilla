filepath = 'src/app/(admin)/tv/content/[groupId]/ContentClient.tsx'
with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

content = content.replace("'", '↑')
content = content.replace('"', '↓')
content = content.replace('?', '•')

if 'showConfirm("Delete this content?"' in content:
    content = content.replace('showConfirm("Delete this content?", async () => {', 'showConfirm("Delete Content", "Are you sure you want to delete this content?", async () => {')
if 'showConfirm("Publish this playlist to screens?"' in content:
    content = content.replace('showConfirm("Publish this playlist to screens?", async () => {', 'showConfirm("Publish Playlist", "Publish this playlist to all paired screens?", async () => {')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
