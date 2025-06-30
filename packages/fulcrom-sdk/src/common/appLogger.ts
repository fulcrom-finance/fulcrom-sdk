import winston from "winston";

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let log = `[${timestamp}] [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            log += `\n${JSON.stringify(metadata, null, 2)}`;
        }
        return log;
    })
);

const appLogger = winston.createLogger({
    level: "info", // Minimum log level to capture
    format: logFormat,
    transports: [
        new winston.transports.Console(), // Log to console
        // new winston.transports.File({ filename: "logs/api.log" }), // Log to file
    ],
});


export default appLogger;
