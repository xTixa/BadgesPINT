import jwt from "jsonwebtoken";

export const protect = (roles = []) => {
  return (req, res, next) => {

    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Token em falta" });

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id;
      req.userRole = decoded.role;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      next();

    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token não fornecido" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
  } catch {
    // Token invalido/expirado: trata o pedido como anonimo em vez de bloquear.
  }
  next();
};

export const adminMiddleware = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Apenas admins." });
  }
  next();
};

export const rolesMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Acesso negado." });
    }
    next();
  };
};

export default authMiddleware;
