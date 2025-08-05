import express, { Request, Response, Router } from "express"; // Default import
import path from "path";

export const router: Router = express.Router();

// get route for homepage match: /, /index, /index.html
router.get(/^\/$|^\/index(.html)?$/, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});
