import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

// Recursively sanitize all strings in the object
function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeHtml(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (typeof obj === "object" && obj !== null) {
    const sanitizedObj: any = {};
    for (const key in obj) {
      sanitizedObj[key] = sanitizeObject(obj[key]);
    }
    return sanitizedObj;
  }
  return obj;
}

export default function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}
