import { connect } from "@tursodatabase/serverless";
export function getDatabase() {
    if (!process.env.TURSO_DATABASE_URL) {
        throw new Error("Missing environment variable: TURSO_DATABASE_URL");
    }
    if (!process.env.TURSO_AUTH_TOKEN) {
        throw new Error("Missing environment variable: TURSO_AUTH_TOKEN");
    }
    
    return connect({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });
}
