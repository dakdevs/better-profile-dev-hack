// diagnose.mjs
import { Client } from 'pg';
import 'dotenv/config'; // This loads your .env.local file

// We also import your app's environment validator to see what IT thinks the URL is.
// Note: We add '.js' because this is a standard ES Module script.


import * as configEnv from './src/config/env.ts';
const { env } = configEnv;

async function runDiagnostics() {
	console.log("--- Starting Diagnostics ---");
	console.log(`Running at: ${new Date().toLocaleString()}`);

	// --- Test 1: Direct Database Connection ---
	console.log("\n[TEST 1] Attempting direct connection to PostgreSQL...");
	const dbUrl = process.env.DATABASE_URL;

	if (!dbUrl) {
		console.error("❌ FAILURE: DATABASE_URL is not defined in the environment!");
		console.log("--- Diagnostics Complete ---");
		return;
	}

	console.log(`   Attempting to connect using URL: ${dbUrl}`);
	const client = new Client({ connectionString: dbUrl });

	try {
		await client.connect();
		console.log("✅ SUCCESS: Directly connected to the database.");
		const res = await client.query('SELECT NOW()');
		console.log(`   Query successful. Current DB time: ${res.rows[0].now}`);
	} catch (err) {
		console.error("❌ FAILURE: Could not connect to the database.");
		console.error("   Error Details:", err.message);
		console.error("   This means your DATABASE_URL is incorrect or the DB container is not accessible at that address.");
	} finally {
		await client.end();
	}

	// --- Test 2: Inspected Application Environment ---
	console.log("\n[TEST 2] Inspecting environment variables as seen by your app...");
	try {
		console.log("   The 'env' object from 'src/config/env.ts' sees the following:");
		console.log(env);
		console.log("\n✅ SUCCESS: Application environment configuration loaded.");
		if (env.DATABASE_URL === dbUrl) {
			console.log("   Confirmation: The validated URL matches the one used for the direct connection test.");
		} else {
			console.warn(`   ⚠️ WARNING: Mismatch! The direct test used '${dbUrl}' but the validated env object has '${env.DATABASE_URL}'`);
		}
	} catch (err) {
		console.error("❌ FAILURE: Could not load the application environment from 'src/config/env.ts'.");
		console.error("   Error Details:", err.message);
	}

	console.log("\n--- Diagnostics Complete ---");
}

runDiagnostics();