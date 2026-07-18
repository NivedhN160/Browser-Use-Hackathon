/**
 * test.js
 * 
 * Native Node.js test suite to validate the core orchestration logic.
 * Ensures the agent correctly targets GTM keywords, respects token limits,
 * and robustly handles invalid LLM output without crashing.
 * 
 * Run with: npm test
 */
const test = require('node:test');
const assert = require('node:assert');
const { parseScoreResponse, filterRelevantRoles } = require('./orchestrate.js');

test('filterRelevantRoles', async (t) => {
    await t.test('filters case-insensitively for GTM and RevOps roles', () => {
        const roles = [
            { title: 'Software Engineer', department: 'Engineering' },
            { title: 'RevOps Manager', department: 'Operations' },
            { title: 'Backend Dev', department: 'GTM' },
            { title: 'Sales Director', department: 'Sales' },
        ];
        const relevant = filterRelevantRoles(roles);
        assert.strictEqual(relevant.length, 3);
        assert.strictEqual(relevant[0].title, 'RevOps Manager');
        assert.strictEqual(relevant[1].title, 'Backend Dev');
        assert.strictEqual(relevant[2].title, 'Sales Director');
    });

    await t.test('caps the results at 50 to maintain efficiency and save tokens', () => {
        const roles = Array.from({ length: 60 }, (_, i) => ({ title: `Sales Rep ${i}`, department: 'Sales' }));
        const relevant = filterRelevantRoles(roles);
        assert.strictEqual(relevant.length, 50);
    });

    await t.test('handles empty or null input gracefully', () => {
        assert.strictEqual(filterRelevantRoles(null).length, 0);
        assert.strictEqual(filterRelevantRoles([]).length, 0);
    });
});

test('parseScoreResponse', async (t) => {
    await t.test('parses valid markdown-fenced JSON', () => {
        const input = `\`\`\`json
        {"company": "test", "score": 8, "matching_roles": ["Role A", "Role B"], "reasoning": "Good fit"}
        \`\`\``;
        const result = parseScoreResponse(input, 'test');
        assert.strictEqual(result.score, 8);
        assert.deepStrictEqual(result.matching_roles, ["Role A", "Role B"]);
    });

    await t.test('normalizes malformed matching_roles arrays', () => {
        const input = `{"company": "test", "score": 5, "matching_roles": [{"title": "Sales Ops"}, "RevOps Manager"], "reasoning": "Mixed formats"}`;
        const result = parseScoreResponse(input, 'test');
        assert.strictEqual(result.matching_roles[0], "Sales Ops");
        assert.strictEqual(result.matching_roles[1], "RevOps Manager");
    });

    await t.test('gracefully falls back on invalid JSON', () => {
        const input = `This is just text and not JSON at all.`;
        const result = parseScoreResponse(input, 'fallback_company');
        assert.strictEqual(result.company, 'fallback_company');
        assert.strictEqual(result.score, 0);
        assert.strictEqual(result.reasoning, 'parse failed');
    });
});
