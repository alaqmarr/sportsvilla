import re

filepath = 'src/app/(admin)/tv/content/[groupId]/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('export default async function TvContentPage({ params }: { params: { groupId: string } }) {', 'export default async function TvContentPage({ params }: { params: Promise<{ groupId: string }> }) {\n  const { groupId } = await params;')
content = content.replace('where: { id: params.groupId },', 'where: { id: groupId },')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
