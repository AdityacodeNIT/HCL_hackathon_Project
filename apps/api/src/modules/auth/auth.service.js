import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import HttpError from "../../utils/http-error.js";
import * as authRepo from "./auth.repo.js";
import { validateLoginPayload, validateRegisterPayload } from "./auth.validation.js";

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}

function buildAuthResponse(user) {
  const safeUser = authRepo.sanitizeUser(user);

  return {
    token: createToken(safeUser),
    user: safeUser,
  };
}

export async function registerUser(body) {
  const { isValid, payload, errors } = validateRegisterPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const existingUser = await authRepo.findUserByEmail(payload.email);

  if (existingUser) {
    throw new HttpError(409, "EMAIL_EXISTS", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await authRepo.createUser({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash,
    role: payload.role,
  });

  return buildAuthResponse(user);
}

export async function loginUser(body) {
  const { isValid, payload, errors } = validateLoginPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const user = await authRepo.findUserByEmail(payload.email);

  if (!user) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);

  if (!passwordMatches) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  return buildAuthResponse(user);
}

export async function getCurrentUser(userId) {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "User could not be found.");
  }

  return authRepo.sanitizeUser(user);
}
