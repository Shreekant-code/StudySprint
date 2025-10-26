import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken; 

    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired access token" });
      }

   
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ error: error.message });
  }
};
