import fs from 'fs';
import path from 'path';

export function getAvailableIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  try {
    const files = fs.readdirSync(iconsDir);
    const icons = files
      .filter(file => /\.(png|jpe?g|svg|webp|gif)$/i.test(file))
      .map(file => {
        const nameWithoutExt = file.replace(/\.[^/.]+$/, "");
        // Convert something like "badminton-court (1)" to "Badminton Court (1)"
        const label = nameWithoutExt
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          value: `/icons/${file}`,
          label: label
        };
      });
      
    return [
      { value: "", label: "No Icon (Use Default)" },
      ...icons.sort((a, b) => a.label.localeCompare(b.label))
    ];
  } catch (error) {
    console.error("Error reading icons directory:", error);
    return [
      { value: "", label: "No Icon (Use Default)" }
    ];
  }
}
