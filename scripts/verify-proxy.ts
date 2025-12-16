
const BASE_URL = "http://localhost:3000/api/proxy/v1/posts";

export { };


async function checkProxy() {
    console.log(`Checking proxy endpoint: ${BASE_URL}`);
    try {
        // We'll emulate a client request
        const res = await fetch(BASE_URL);
        console.log("Status:", res.status);

        if (!res.ok) {
            const text = await res.text();
            console.log("Error Body:", text);
        }

        const setCookie = res.headers.get("set-cookie");
        console.log("Set-Cookie:", setCookie);

        if (setCookie && !setCookie.includes("Domain=")) {
            console.log("✅ Domain attribute stripped (Good for first-party!)");
        } else if (setCookie) {
            console.log("⚠️ Domain attribute still present:", setCookie);
        }

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("Error:", message);
    }
}

checkProxy();
