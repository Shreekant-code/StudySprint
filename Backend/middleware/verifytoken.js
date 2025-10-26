import jwt from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.warn("No access token sent");
      return res.status(401).json({ error: "You must be logged in!" });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      req.user = decoded;
      console.log("User verified:", decoded.id);
      next();
    });
  } catch (error) {
    console.error("verifyToken middleware error:", error.stack);
    res.status(500).json({ error: "Server error" });
  }
};
