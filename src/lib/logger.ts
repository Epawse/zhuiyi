const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const
type LogLevel = keyof typeof LOG_LEVELS

const currentLevel = (typeof process !== 'undefined' && process.env.LOG_LEVEL) || 'debug'

function shouldLog(level: LogLevel): boolean {
  const configured: LogLevel = (currentLevel as LogLevel) || 'debug'
  return LOG_LEVELS[level] >= (LOG_LEVELS[configured] ?? 0)
}

function fmt(level: string, tag: string, msg: string, data?: unknown): string {
  const ts = new Date().toISOString().slice(11, 23)
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : ''
  return `[${ts}] [${level}] [${tag}] ${msg}${dataStr}`
}

export const log = {
  debug(tag: string, msg: string, data?: unknown) {
    if (shouldLog('debug')) console.log(fmt('DEBUG', tag, msg, data))
  },
  info(tag: string, msg: string, data?: unknown) {
    if (shouldLog('info')) console.info(fmt('INFO', tag, msg, data))
  },
  warn(tag: string, msg: string, data?: unknown) {
    if (shouldLog('warn')) console.warn(fmt('WARN', tag, msg, data))
  },
  error(tag: string, msg: string, data?: unknown) {
    if (shouldLog('error')) console.error(fmt('ERROR', tag, msg, data))
  },
}