import HttpError from "../utils/http-error.js";

export default function notFound(_req, _res, next) {
  next(new HttpError(404, "NOT_FOUND", "The requested endpoint does not exist."));
}
