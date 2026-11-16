import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (line && !line.startsWith("#")) {
        const eqIdx = line.indexOf("=");
        if (eqIdx !== -1) {
          const key = line.slice(0, eqIdx).trim();
          let val = line.slice(eqIdx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
          }
          if (key && (!process.env[key] || process.env[key].trim() === "")) {
            process.env[key] = val;
          }
        }
      }
    }
  }
} catch (e) {
  console.error("Error in setup.ts:", e);
}
