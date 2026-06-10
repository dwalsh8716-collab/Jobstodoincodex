import fs from "node:fs";

fs.rmSync(".next/dev", { recursive: true, force: true });
