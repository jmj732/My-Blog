
const BASE_URL = "https://gc-board-latest-1.onrender.com";

export { };


async function checkCookies() {
    console.log(`Checking headers from ${BASE_URL}/api/v1/posts...`);
    try {
        const response = await fetch(`${BASE_URL}/api/v1/posts`, {
            method: "GET",
            headers: {
                "Origin": "http://localhost:3000" // Simulate local dev
            }
        });

        console.log("Status:", response.status);
        console.log("--- Relevant Headers ---");
        console.log("Access-Control-Allow-Credentials:", response.headers.get("access-control-allow-credentials"));
        console.log("Access-Control-Allow-Origin:", response.headers.get("access-control-allow-origin"));
        console.log("Set-Cookie:", response.headers.get("set-cookie"));

        // Also check feed just in case
        console.log(`\nChecking headers from ${BASE_URL}/api/v1/posts/feed?limit=1...`);
        const res2 = await fetch(`${BASE_URL}/api/v1/posts/feed?limit=1`);
        console.log("Status:", res2.status);
        console.log("Set-Cookie:", res2.headers.get("set-cookie"));

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

checkCookies();
