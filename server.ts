import express, { Request, Response } from "express"; // Default import
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/corsOptions";
import { logger } from "./src/middleware/logEvents";
import { errorHandler } from "./src/middleware/errorHandler";
import { router } from "./src/routes/root";
import { authRouter } from "./src/routes/auth.route";
import dotenv from "dotenv";
import { techNoteRouter } from "./src/routes/techNote.route";

// setup env secret
dotenv.config({
  override: true,
});

const app = express();
const port = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// parse cookie from request
app.use(cookieParser());

// built-in middleware for json
app.use(express.json());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.use("/", router);
app.use("/api", authRouter, techNoteRouter);

// fallback for 404
app.use((req: Request, res: Response) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "src", "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
