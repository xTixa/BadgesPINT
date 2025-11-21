import jwt from "jsonwebtoken";

export const protect = (roles = []) => {
  return (req, res, next) => {

    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Token em falta" });

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      next();

    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token não fornecido" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}