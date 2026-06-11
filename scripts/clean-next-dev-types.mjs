import fs from "node:fs";

fs.rmSync(".next/dev", { recursive: true, force: true });

const nextEnv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

fs.writeFileSync("next-env.d.ts", nextEnv);
