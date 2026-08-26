import { readFileSync } from "fs";
import path from "path";

export const LOGO_BUFFER = readFileSync(path.join(process.cwd(), "src/assets/logo-akxio.png"));
export const LOGO_ASPECT_RATIO = 508 / 195;
