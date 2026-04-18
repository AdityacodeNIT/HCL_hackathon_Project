import "dotenv/config";

function getRequiredEnv(name, fallback = "") {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls: getRequiredEnv("CLIENT_URL", "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
};

export default env;
