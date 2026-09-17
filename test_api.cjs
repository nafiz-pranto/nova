const { runBrowserWorker } = require('tsx/cjs/api').require('./src/server/browserWorker.ts', __filename);

async function test() {
    try {
        await runBrowserWorker({
            query: "custom",
            keywords: ["Wayfair"],
            countryCode: "US",
            maxResults: 10,
            tenantId: "test",
            idempotencyKey: "test"
        }, (event) => {
            console.log(event.stage);
        });
    } catch (e) {
        console.error("CRASH:", e);
    }
}
test();
