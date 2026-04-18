import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { USER_ROLE_VALUES } from "../config/constants.js";
import * as authRepo from "../modules/auth/auth.repo.js";
import HttpError from "../utils/http-error.js";

export async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "AUTH_REQUIRED", "A valid access token is required.");
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await authRepo.findUserById(payload.sub);

    if (!user) {
      throw new HttpError(401, "INVALID_TOKEN", "Your session is no longer valid.");
    }

    req.user = authRepo.sanitizeUser(user);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new HttpError(401, "INVALID_TOKEN", "Your session is no longer valid."));
      return;
    }

    next(error);
  }
}

export function authorize(allowedRoles = USER_ROLE_VALUES) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, "AUTH_REQUIRED", "Please log in first."));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new HttpError(403, "FORBIDDEN", "You do not have access to this resource."));
      return;
    }

    next();
  };
}
