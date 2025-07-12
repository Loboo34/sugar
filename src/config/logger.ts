import winston from "winston";
//import morgan from "morgan";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
          new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.Console()
    ]
});



export default logger;
