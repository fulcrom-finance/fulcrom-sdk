import appLogger from "./appLogger";

export function handleError(error: unknown, operation: string) {
    appLogger.error(`Error in ${operation}:`, error);
    return {
        statusCode: 500,
        message: [
            error instanceof Error ? error.message : `${operation} failed`,
        ],
    };
}
