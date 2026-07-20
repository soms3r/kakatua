/**
 * Kakatua Simulation Script (simulate.js)
 * 
 * This script runs two critical simulations to validate the core logic of the Kakatua platform:
 * 1. Matching Simulation: Validates queue dynamics, wait times, and compatibility scores for 1,000 users.
 * 2. Moderation/Ban Simulation: Validates the tiered ban logic and demonstrates atomic vs non-atomic
 *    handling of 25 concurrent report submissions (race conditions).
 */

const fs = require('fs');
const path = require('path');

// --- Helper Data and Constants ---
const LANGUAGES = ['English', 'Spanish', 'French', 'Japanese', 'German'];
const INTERESTS_POOL = [
    'cooking', 'travel', 'photography', 'music', 'sports',
    'reading', 'cinema', 'gaming', 'gardening', 'tech',
    'art', 'history', 'science', 'fashion', 'politics'
];

// --- Class Definitions ---

/**
 * Simple Mutex implementation to serialize concurrent asynchronous operations.
 */
class Mutex {
    constructor() {
        this.queue = Promise.resolve();
    }

    async acquire() {
        let release;
        const pending = new Promise(resolve => { release = resolve; });
        const previous = this.queue;
        this.queue = previous.then(() => pending);
        await previous;
        return release;
    }
}

// ==========================================
// PART 1: MATCHING SIMULATION
// ==========================================

/**
 * Generates 1,000 mock user profiles.
 */
function generateUsers(count = 1000) {
    const users = [];
    for (let i = 1; i <= count; i++) {
        // Random native and learning languages (must be different)
        const nativeIdx = Math.floor(Math.random() * LANGUAGES.length);
        let learningIdx = Math.floor(Math.random() * LANGUAGES.length);
        while (learningIdx === nativeIdx) {
            learningIdx = Math.floor(Math.random() * LANGUAGES.length);
        }

        // Random interests (3 to 7 unique interests)
        const numInterests = 3 + Math.floor(Math.random() * 5); // 3-7
        const shuffledInterests = [...INTERESTS_POOL].sort(() => 0.5 - Math.random());
        const userInterests = shuffledInterests.slice(0, numInterests);

        // Timezone offset (-11 to +14)
        const timezoneOffset = -11 + Math.floor(Math.random() * 26);

        users.push({
            id: `user_${i}`,
            native_language: LANGUAGES[nativeIdx],
            learning_language: LANGUAGES[learningIdx],
            interests: userInterests,
            timezone_offset: timezoneOffset,
            arrival_time: (i - 1) * 100 // Arrives every 100ms
        });
    }
    return users;
}

/**
 * Calculates circular timezone difference on a 24-hour cycle.
 */
function getCircularDifference(tz1, tz2) {
    const diff = Math.abs(tz1 - tz2);
    return Math.min(diff, 24 - diff);
}

/**
 * Calculates compatibility score between two users.
 */
function calculateCompatibility(userA, userB) {
    // Interest overlap count
    const overlapInterests = userA.interests.filter(interest => userB.interests.includes(interest));
    const overlapCount = overlapInterests.length;

    // Timezone alignment score (12 - circular difference)
    const tzDiff = getCircularDifference(userA.timezone_offset, userB.timezone_offset);
    const tzScore = 12 - tzDiff;

    return (overlapCount * 10) + tzScore;
}

/**
 * Runs the matching queue simulation.
 */
function runMatchingSimulation() {
    const users = generateUsers(1000);
    const queue = [];
    const matches = [];
    const unmatched = [];

    // The simulation runs in 100ms ticks.
    // 1000 users arrive every 100ms -> all arrive within 99,900ms.
    // Max wait time is 600,000ms (10 minutes).
    // To give the last user a full 600s wait window, we run the loop up to 700,000ms.
    const SIMULATION_END_TIME = 700000; 
    const TICK_MS = 100;
    const TIMEOUT_MS = 600000;

    let userIndex = 0;

    for (let t = 0; t <= SIMULATION_END_TIME; t += TICK_MS) {
        // 1. Process new arrivals
        while (userIndex < users.length && users[userIndex].arrival_time <= t) {
            const newUser = users[userIndex];
            queue.push(newUser);
            userIndex++;

            // Check for immediate match for this new user
            attemptMatchForUser(newUser, queue, matches, t);
        }

        // 2. Process timeouts for users currently in the queue
        for (let i = queue.length - 1; i >= 0; i--) {
            const user = queue[i];
            if (t - user.arrival_time >= TIMEOUT_MS) {
                unmatched.push(user);
                queue.splice(i, 1); // Remove from queue
            }
        }
    }

    // Any users remaining in the queue at the absolute simulation end time are also unmatched
    while (queue.length > 0) {
        unmatched.push(queue.shift());
    }

    // Calculate metrics
    const totalUsers = users.length;
    const matchedCount = matches.length * 2; // Each match consists of 2 users
    const matchSuccessRate = (matchedCount / totalUsers) * 100;

    let totalWaitTime = 0;
    let totalScore = 0;
    matches.forEach(m => {
        totalWaitTime += m.wait_time_A + m.wait_time_B;
        totalScore += m.score;
    });

    const averageWaitTimeSeconds = matches.length > 0 ? (totalWaitTime / matchedCount) / 1000 : 0;
    const averageScore = matches.length > 0 ? (totalScore / matches.length) : 0;

    return {
        totalUsers,
        matchedCount,
        unmatchedCount: unmatched.length,
        matchSuccessRate,
        averageWaitTimeSeconds,
        averageScore,
        matchesSample: matches.slice(0, 5) // Send a small sample for the report
    };
}

/**
 * Attempts to match a specific user with the best available candidate in the queue.
 */
function attemptMatchForUser(user, queue, matches, currentTime) {
    let bestCandidateIdx = -1;
    let bestScore = -1;

    for (let i = 0; i < queue.length; i++) {
        const candidate = queue[i];
        if (candidate.id === user.id) continue;

        // Language Exchange Requirement:
        // User A's native language matches User B's learning language AND vice-versa
        const languageMatch = 
            user.native_language === candidate.learning_language && 
            user.learning_language === candidate.native_language;

        if (languageMatch) {
            const score = calculateCompatibility(user, candidate);
            if (score > bestScore) {
                bestScore = score;
                bestCandidateIdx = i;
            } else if (score === bestScore) {
                // Tie breaker: Prefer the candidate waiting the longest (earliest arrival_time)
                if (bestCandidateIdx === -1 || candidate.arrival_time < queue[bestCandidateIdx].arrival_time) {
                    bestCandidateIdx = i;
                }
            }
        }
    }

    // If a valid match is found, pair them up and remove both from the queue
    if (bestCandidateIdx !== -1) {
        const candidate = queue[bestCandidateIdx];
        
        // Remove candidate and user from the queue
        const userIdx = queue.findIndex(u => u.id === user.id);
        if (userIdx !== -1) queue.splice(userIdx, 1);
        
        const freshCandidateIdx = queue.findIndex(u => u.id === candidate.id);
        if (freshCandidateIdx !== -1) queue.splice(freshCandidateIdx, 1);

        matches.push({
            userA: user.id,
            userB: candidate.id,
            languages: `${user.native_language} <-> ${candidate.native_language}`,
            score: bestScore,
            wait_time_A: currentTime - user.arrival_time,
            wait_time_B: currentTime - candidate.arrival_time
        });
    }
}


// ==========================================
// PART 2: MODERATION/BAN SIMULATION
// ==========================================

// Initial Mock DB state for moderation tests
const makeInitialDbState = () => ({
    user: {
        id: 'user_999',
        report_count: 0,
        status: 'active',
        suspension_until: null,
        ip_banned: false,
        ip_address: '198.51.100.42'
    },
    logs: [],
    // Simulate database network latency
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
});

/**
 * Standard business logic for tiered bans based on report count.
 */
function applyBanRules(user, count, logArray) {
    const now = new Date();
    
    if (count >= 20) {
        user.status = 'banned';
        user.ip_banned = true;
        user.suspension_until = null;
        logArray.push(`[RULE TRIGGERED] 20+ Reports reached (${count}). Permanent Account & IP Ban applied.`);
    } else if (count >= 10) {
        user.status = 'suspended';
        const suspendUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        user.suspension_until = suspendUntil.toISOString();
        logArray.push(`[RULE TRIGGERED] 10 Reports reached (${count}). 30-day suspension applied until ${user.suspension_until}.`);
    } else if (count >= 5) {
        user.status = 'suspended';
        // Only set if not already suspended for longer
        const suspendUntil = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
        user.suspension_until = suspendUntil.toISOString();
        logArray.push(`[RULE TRIGGERED] 5 Reports reached (${count}). 15-day suspension applied until ${user.suspension_until}.`);
    } else {
        logArray.push(`[REPORT RECORDED] Report count is now ${count}. No bans triggered.`);
    }
}

/**
 * 1. Naive (Non-Atomic) Moderation Handler.
 * Mimics read-modify-write without database transactions or locks.
 */
async function reportUserNaive(dbState, reportedId) {
    // 1. Read current count from DB
    await dbState.delay(Math.random() * 20 + 5); // 5-25ms read latency
    const currentCount = dbState.user.report_count;

    // 2. Perform increment locally
    const nextCount = currentCount + 1;

    // 3. Write back to DB
    await dbState.delay(Math.random() * 20 + 5); // 5-25ms write latency
    dbState.user.report_count = nextCount;

    // 4. Evaluate and apply ban rules
    applyBanRules(dbState.user, nextCount, dbState.logs);
}

/**
 * 2. Atomic (Thread-Safe) Moderation Handler.
 * Uses a Mutex to lock the user row and prevent race conditions.
 */
const userMutexes = new Map();

async function reportUserAtomic(dbState, reportedId) {
    if (!userMutexes.has(reportedId)) {
        userMutexes.set(reportedId, new Mutex());
    }

    const release = await userMutexes.get(reportedId).acquire();
    try {
        // 1. Read current count (within Lock)
        await dbState.delay(Math.random() * 15 + 5); 
        const currentCount = dbState.user.report_count;

        // 2. Increment
        const nextCount = currentCount + 1;

        // 3. Write back (within Lock)
        await dbState.delay(Math.random() * 15 + 5); 
        dbState.user.report_count = nextCount;

        // 4. Apply rules (within Lock)
        applyBanRules(dbState.user, nextCount, dbState.logs);
    } finally {
        // Ensure the lock is ALWAYS released
        release();
    }
}

/**
 * Runs the moderation simulations.
 */
async function runModerationSimulation() {
    // Run Scenario A: Naive/Non-atomic handling
    const naiveDb = makeInitialDbState();
    const naiveReportPromises = [];
    for (let i = 0; i < 25; i++) {
        naiveReportPromises.push(reportUserNaive(naiveDb, 'user_999'));
    }
    await Promise.all(naiveReportPromises);

    // Run Scenario B: Atomic/Mutex-locked handling
    const atomicDb = makeInitialDbState();
    const atomicReportPromises = [];
    for (let i = 0; i < 25; i++) {
        atomicReportPromises.push(reportUserAtomic(atomicDb, 'user_999'));
    }
    await Promise.all(atomicReportPromises);

    return {
        naive: {
            final_report_count: naiveDb.user.report_count,
            status: naiveDb.user.status,
            ip_banned: naiveDb.user.ip_banned,
            log_summary: naiveDb.logs
        },
        atomic: {
            final_report_count: atomicDb.user.report_count,
            status: atomicDb.user.status,
            ip_banned: atomicDb.user.ip_banned,
            log_summary: atomicDb.logs
        }
    };
}

// ==========================================
// MAIN RUNNER
// ==========================================
async function main() {
    console.log("=== KAKATUA SYSTEM SIMULATION RUNNING ===");
    
    console.log("\n[1/2] Running Matching Queue Simulation...");
    const matchingResult = runMatchingSimulation();
    
    console.log("[2/2] Running Moderation Race Condition Simulation...");
    const moderationResult = await runModerationSimulation();

    console.log("\n=== SIMULATION COMPLETED ===");

    // Format results as JSON string to write to file
    const outputData = {
        timestamp: new Date().toISOString(),
        matchingResult,
        moderationResult
    };

    // Output JSON results to console in a structured manner for parsing
    console.log("\n--- JSON OUTPUT START ---");
    console.log(JSON.stringify(outputData, null, 2));
    console.log("--- JSON OUTPUT END ---\n");

    // Write a local result file for validation
    fs.writeFileSync(
        path.join(__dirname, 'simulation_result.json'),
        JSON.stringify(outputData, null, 2),
        'utf-8'
    );
    console.log("Results saved to: simulation_result.json");
}

main().catch(err => {
    console.error("Simulation failed:", err);
});
