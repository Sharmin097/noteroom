import winston from "winston"
import path from "path"
import { config } from "dotenv"
import chalk from "chalk"
import { format } from "logform"
import { nanoid } from "nanoid"

config({ path: path.join(__dirname, '../../.env') })

const logFile = path.join(__dirname, '../../logs/nrlogs.log')
const errorLogFile = path.join(__dirname, '../../logs/nr_errorlogs.log')

console.log(chalk.cyan(`[-] log state: ${chalk.yellow(process.env.LOG_STATE)}; log save: ${chalk.yellow(process.env.LOG_SAVE)}`))

/**
* @type {ContextType} 
* @param entity *entity* is on which part of the program the log is raised. For now, `service` and `api` is acceptable
* @param root *root* is the main context type. The child contexts must be joined using dots (.). For instance, `UserAuth.Login`
* @param action *action* is the event occured on the context. For instance, `user-deleted` on context `UserAuth`
*/
export type ContextType = { entity: "service" | "api", root: string, action: string }

const logID = format(info => {
    const id = `log_${nanoid()}`
    info.logID = id

    return info
})

const _logger = winston.createLogger({
    level: process.env.LOG_STATE && process.env.LOG_STATE === "print" ? "info" : "silent",
    format: winston.format.combine(
        winston.format.timestamp(),
        logID(),
        winston.format.printf((log: { timestamp: Date, level: string, message: string, logID: string, context?: ContextType, meta?: any }) => {
            let metaString: string | null = null
            if (log.meta) {
                const metaDetails = Object.entries(log.meta)
                metaString = metaDetails.map(([key, value]) => `${key}=${value}`).join(" | ")
            }
            return `timestamp=${log.timestamp} | level=${log.level.toUpperCase()} | context=${log.context?.["entity"]}:${log.context?.["root"]}:${log.context?.["action"]} | message="${log.message}" | logID=${log.logID} ${metaString ? `| ${metaString}` : ''}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
})

if (process.env.LOG_SAVE && process.env.LOG_SAVE === "true") {
    _logger.add(new winston.transports.File({ filename: logFile }))
    _logger.add(new winston.transports.File({ filename: errorLogFile, level: "error" }))
}

const logger = {
    info(message: string, context?: ContextType | any, meta?: any) {
        _logger.info(message, { context, meta })
    },
    error(message: string, context?: ContextType | any, meta?: any) {
        _logger.error(message, { context, meta })
    },
    warn(message: string, context?: ContextType | any, meta?: any) {
        _logger.warn(message, { context, meta })
    }
}


export default logger