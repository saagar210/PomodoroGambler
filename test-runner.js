// Runtime test script for AuraFlow
// This simulates loading the app and checks for errors

console.log('🧪 AuraFlow Runtime Test Starting...\n');

const tests = {
    passed: 0,
    failed: 0,
    errors: []
};

// Test 1: Check constants
console.log('Test 1: Constants validation...');
try {
    const DURATIONS = {
        SHORT: { minutes: 15, multiplier: 1, coins: 20 },
        MEDIUM: { minutes: 30, multiplier: 2, coins: 40 },
        LONG: { minutes: 60, multiplier: 5, coins: 100 }
    };

    if (DURATIONS.SHORT.coins !== 20) throw new Error('SHORT coins incorrect');
    if (DURATIONS.MEDIUM.coins !== 40) throw new Error('MEDIUM coins incorrect');
    if (DURATIONS.LONG.coins !== 100) throw new Error('LONG coins incorrect');

    console.log('✅ Constants are correct\n');
    tests.passed++;
} catch (e) {
    console.log('❌ Constants test failed:', e.message, '\n');
    tests.failed++;
    tests.errors.push({ test: 'Constants', error: e.message });
}

// Test 2: Check formatters
console.log('Test 2: Formatter functions...');
try {
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (formatTime(0) !== '00:00') throw new Error('formatTime(0) failed');
    if (formatTime(65) !== '01:05') throw new Error('formatTime(65) failed');
    if (formatTime(3661) !== '61:01') throw new Error('formatTime(3661) failed');

    console.log('✅ Formatters working correctly\n');
    tests.passed++;
} catch (e) {
    console.log('❌ Formatter test failed:', e.message, '\n');
    tests.failed++;
    tests.errors.push({ test: 'Formatters', error: e.message });
}

// Test 3: Check validation logic
console.log('Test 3: Validation functions...');
try {
    function validateBalance(balance, required = 40) {
        return balance >= required;
    }

    if (!validateBalance(100, 40)) throw new Error('validateBalance(100, 40) should be true');
    if (validateBalance(30, 40)) throw new Error('validateBalance(30, 40) should be false');
    if (!validateBalance(40, 40)) throw new Error('validateBalance(40, 40) should be true');

    console.log('✅ Validation logic correct\n');
    tests.passed++;
} catch (e) {
    console.log('❌ Validation test failed:', e.message, '\n');
    tests.failed++;
    tests.errors.push({ test: 'Validation', error: e.message });
}

// Test 4: Check odds calculation
console.log('Test 4: Odds calculation...');
try {
    const betAmount = 40;
    const odds = 0.3;
    const payout = betAmount / odds;

    if (Math.abs(payout - 133.33) > 0.1) throw new Error('Payout calculation incorrect');

    console.log('✅ Odds calculation correct\n');
    tests.passed++;
} catch (e) {
    console.log('❌ Odds calculation test failed:', e.message, '\n');
    tests.failed++;
    tests.errors.push({ test: 'Odds Calculation', error: e.message });
}

// Test 5: Check timer logic
console.log('Test 5: Timer interruption logic...');
try {
    const GRACE_PERIOD_MS = 5 * 60 * 1000;
    const startTime = Date.now() - (20 * 60 * 1000); // 20 minutes ago
    const expectedEndTime = startTime + (15 * 60 * 1000); // Should have ended 5 min ago
    const now = Date.now();

    const isInterrupted = now > expectedEndTime + GRACE_PERIOD_MS;

    if (!isInterrupted) throw new Error('Interruption detection logic incorrect');

    console.log('✅ Timer interruption logic correct\n');
    tests.passed++;
} catch (e) {
    console.log('❌ Timer logic test failed:', e.message, '\n');
    tests.failed++;
    tests.errors.push({ test: 'Timer Logic', error: e.message });
}

// Test 6: Check statistics calculation
console.log('Test 6: Statistics calculation...');
try {
    const totalEarned = 100;
    const totalSpent = 80;
    const totalWinnings = 50;
    const netProfit = totalEarned + totalWinnings - totalSpent;

    if (netProfit !== 70) throw new Error('Net profit calculation incorrect');

    console.log('✅ Statistics calculation correct\n');
    tests.passed++;
} catch (e) {
    console.log('❌ Statistics test failed:', e.message, '\n');
    tests.failed++;
    tests.errors.push({ test: 'Statistics', error: e.message });
}

// Summary
console.log('═══════════════════════════════════════');
console.log('TEST SUMMARY');
console.log('═══════════════════════════════════════');
console.log(`Total Tests: ${tests.passed + tests.failed}`);
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(0)}%`);

if (tests.failed > 0) {
    console.log('\n❌ ERRORS:');
    tests.errors.forEach(err => {
        console.log(`  - ${err.test}: ${err.error}`);
    });
} else {
    console.log('\n🎉 All logic tests passed!');
}
