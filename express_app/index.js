const fs = require("fs");
const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost", // MySQL host (change this to your MySQL server's host)
  user: "root", // MySQL username
  password: "Sahil8139", // MySQL password
  database: "testv1", // MySQL database name
  connectionLimit: 10, // Number of connections in the connection pool
});

// Middleware to handle JSON request body
app.use(express.json());

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  // Verify token
  jwt.verify(token, "SRM10101010", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    // Perform authentication logic here based on decoded information
    // ...
    console.log(decoded);
    // If authentication is successful, store decoded information in request object for further use
    req.user = decoded;

    // Call next() to continue to the next middleware or route
    next();
  });
};

const validateAccess = async (req, res, next) => {
  const fileName = req.params.fileName;
  const tokenb64 = req.query.token;
  if (!tokenb64) return res.status(500).json({ error: "token is required" });
  let token = Buffer.from(tokenb64, "base64");
  token = token.toString();
  jwt.verify(token, "SRM10101010", async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.log(decoded);
    req.user = decoded;

    pool.query(
      "SELECT id, user_id FROM media WHERE filename = ?",
      [fileName],
      (err, result) => {
        if (err) {
          console.error("Error finding file: " + err.stack);
          return res.status(500).json({ error: "Error finding file" });
        }
        if (result.length === 0)
          return res.status(404).json({ error: "file not found" });
        if (result[0].user_id != req.user.userId) {
          pool.query(
            "SELECT id FROM access_list WHERE media_id=? AND user_id=?",
            [result[0].id, req.user.userId],
            (err, result) => {
              if (result.length === 0)
                return res.status(500).json({ error: "No Access to file " });
            }
          );
        }
        next();
      }
    );
  });
};

// Generate a token
const generateToken = (user) => {
  const secretKey = "SRM10101010"; // Replace this with your own secret key
  const expiresIn = "24h"; // Token expiration time

  // Create the token with user data and secret key
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    secretKey,
    { expiresIn }
  );

  return token;
};

// Route for user login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Query the MySQL database to find the user
  pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error finding user: " + err.stack);
        return res.status(500).json({ error: "Error finding user" });
      }

      // Check if the user exists in the database
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Verify the password
      const user = results[0];
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // If login is successful, generate and return an authentication token
      const token = generateToken(user);
      res.json({ token });
    }
  );
});

// Route for creating a new user
app.post("/users", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Query the MySQL database to check if the user already exists
  pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error finding user: " + err.stack);
        return res.status(500).json({ error: "Error finding user" });
      }

      // Check if the user already exists
      if (results.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      // If user does not exist, insert the new user into the database
      pool.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err, result) => {
          if (err) {
            console.error("Error creating user: " + err.stack);
            return res.status(500).json({ error: "Error creating user" });
          }

          // Generate and return an authentication token
          const token = generateToken({ id: result.insertId, username });
          res.json({ token });
        }
      );
    }
  );
});

// Upload endpoint
app.post("/upload", authenticate, upload.single("image"), (req, res) => {
  // Check if file is present in request
  if (!req.file) {
    return res.status(400).json({ error: "Image file missing" });
  }

  // Access file details from req.file object
  const { filename, path } = req.file;

  // Read file data from disk
  const data = fs.readFileSync(path);

  // Get user ID from authenticated user object
  const userId = req.user.userId;

  // Insert file data into media table with user ID
  const query = `INSERT INTO media (filename, data, user_id) VALUES (?, ?, ?)`;
  pool.query(query, [filename, data, userId], (err, result) => {
    if (err) {
      //console.error(err);
      return res
        .status(500)
        .json({ error: "Failed to upload image to database" });
    }

    // Delete uploaded file from disk
    fs.unlinkSync(path);
    console.log(result);
    // Send response with success message and file details
    res.json({
      message: "Image uploaded successfully",
      file: {
        filename,
        path,
      },
    });
  });
});
app.get("/files/sharedwithme", authenticate, (req, res) => {
  pool.query(
    "SELECT DISTINCT media.filename,media.id,media.created_at FROM media JOIN access_list ON media.id = access_list.media_id  WHERE access_list.user_id =? AND media.user_id != ?;",
    [req.user.userId, req.user.userId],
    (err, result) => {
      if (err) return res.status(500).json({ err: "Error getting media" });
      return res.status(200).json({ media: result });
    }
  );
});
app.get("/files/:fileName", validateAccess, (req, res) => {
  // Fetch the file content from the database based on the file name
  const fileName = req.params.fileName;
  pool.query(
    "SELECT * FROM media WHERE fileName = ?",
    [fileName],
    (err, results) => {
      if (err) {
        console.error("Error fetching file from database:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (results.length > 0) {
        // Get the file content and file extension
        const fileContent = results[0].data;
        const fileExtension = fileName.split(".")[1];

        // Set the appropriate content type based on the file extension
        switch (fileExtension) {
          case "png":
            res.set("Content-Type", "image/png");
            break;
          case "jpg":
          case "jpeg":
            res.set("Content-Type", "image/jpeg");
            break;
          // Add more cases for other supported file types as needed
          default:
            res.status(400).json({ error: "Unsupported file type" });
            return;
        }

        // Send the file content as response
        res.send(fileContent);
      } else {
        // If file does not exist, send an error response
        res.status(404).json({ error: "File not found" });
      }
    }
  );
});

app.post("/file/addAccess", authenticate, (req, res) => {
  const { user, filename } = req.body;
  pool.query(
    "SELECT id FROM media WHERE filename = ? AND user_id= ?",
    [filename, req.user.userId],
    (err, results) => {
      if (err) {
        console.error("Error finding file: " + err.stack);
        return res.status(500).json({ error: "Error finding file" });
      }
      if (results.length === 0)
        return res.status(404).json({ error: "file not found" });
      let media_id = results[0]?.id;
      pool.query(
        "SELECT * FROM access_list WHERE media_id=? AND user_id=?",
        [media_id, user],
        (err, result) => {
          if (err) {
            return res
              .status(407)
              .json({ error: "Error working on access list" });
          }
          if (result.length >= 1) {
            return res.status(504).json({ error: "Already Access" });
          } else {
            pool.query(
              "INSERT INTO access_list (media_id, user_id) VALUES (?, ?)",
              [media_id, user],
              (err, result) => {
                if (err) {
                  console.error("Error creating ascess: " + err.stack);
                  return res
                    .status(500)
                    .json({ error: "Error creating ascess" });
                }
                return res.status(201).json({ message: "Access Added" });
              }
            );
          }
        }
      );
    }
  );
});

app.get("/finduserquery", (req, res) => {
  pool.query(
    "SELECT * FROM users WHERE LOWER(username) LIKE CONCAT('%', LOWER(?), '%')",
    [req.query.username],
    (err, results) => {
      if (err) {
        console.error("Error finding users: " + err.stack);
        return res.status(500).json({ error: "Error finding user" });
      }
      return res.status(200).json({ users: results });

      // If user does not exist, insert the new user into the database
    }
  );
});

app.get("/user/images", authenticate, (req, res) => {
  const userId = req.user.userId;
  pool.query(
    "SELECT id,filename,created_at FROM media WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error finding user: " + err.stack);
        return res.status(500).json({ error: "Error finding user" });
      }
      return res.status(200).json({ data: results });
    }
  );
});

app.get("/user/:userId", authenticate, (req, res) => {
  const userId = req.params.userId;

  pool.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("Error finding user: " + err.stack);
      return res.status(500).json({ error: "Error finding user" });
    }
    if (results.length >= 1) {
      let user = { username: results.username };
      return res.status(200).json({ user: user });
    }
  });
});

// Start the Express app
app.listen(5000, () => {
  console.log("Express app listening on port 5000...");
});
