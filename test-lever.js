const companies = ['palantir', 'lever', 'openai', 'anthropic', 'coursera', 'udemy', 'spotify', 'affirm'];
Promise.all(companies.map(async c => {
  const r = await fetch(`https://jobs.lever.co/${c}`);
  console.log(`${c}: ${r.status}`);
}));
