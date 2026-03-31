import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  //retrieve accessToken from authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ success: false, message: "No auth header" });

  // schema - "Bearer", token - accessToken
  const [schema, token] = authHeader.split(" ");

  if (schema !== "Bearer" || !token)
    return res.status(401).json({
      success: false,
      message: "Missing or invalid authorization header",
    });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default isAuth;
