import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDev = env === "development";
  return isDev ? "debug" : "warn";
};

const format = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD hh:m:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} , ${info.level} , ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "src/logs/error.log",
    level: "error",
  }),
  new winston.transports.File({ filename: "src/logs/allLogs.log" }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
