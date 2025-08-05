import express, { Request, Response, NextFunction } from "express"; // Default import
import cors from "cors";
import path from "path";
import { corsOptions } from "./config/corsOptions";
import { logger } from "./src/middleware/logEvents";
import { errorHandler } from "./src/middleware/errorHandler";

const app = express();
const port = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Catch-all for 404 (must be placed after all routes)
app.use((req: Request, res: Response, next: NextFunction) => {
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
  console.log(`Example app listening on port http://localhost:${port}`);
});
