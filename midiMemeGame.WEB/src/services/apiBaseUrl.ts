export const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL
    ?? (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "")
).replace(/[/]$/, "");
