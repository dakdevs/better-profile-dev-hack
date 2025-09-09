// check-env.mjs
import dotenv from 'dotenv';
import fs from 'fs';

console.log("--- Starting Basic Environment Check ---");

const envPath = './.env.local';

if (fs.existsSync(envPath)) {
	console.log(`✅ SUCCESS: Found the file at '${envPath}'.`);
} else {
	console.error(`❌ CRITICAL FAILURE: Could not find the file at '${envPath}'. Please ensure it is named correctly and in the root directory.`);
	process.exit(1);
}

// Explicitly load the .env.local file
const result = dotenv.config({ path: envPath });

if (result.error) {
	console.error("❌ FAILURE: dotenv could not PARSE the .env.local file.");
	console.error("   Error:", result.error.message);
	console.log("\n   This usually means there is a syntax error INSIDE your .env.local file (like a missing quote).");
} else {
	console.log("✅ SUCCESS: dotenv parsed the .env.local file.");
}

console.log("\n--- Checking process.env directly ---");
console.log(`Value of DATABASE_URL:       ${process.env.DATABASE_URL}`);
console.log(`Value of BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET}`);

if (process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET) {
	console.log("\n✅ Confirmation: Variables were successfully loaded into the environment.");
} else {
	console.log("\n❌ CRITICAL FAILURE: Variables were NOT loaded. This is the root of the problem.");
}

console.log("\n--- Check Complete ---");