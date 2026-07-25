import fs from 'node:fs';

const path = 'case-studies.html';
const original = fs.readFileSync(path, 'utf8');
let lines = original.split(/\r?\n/);

const corrections = [
  ['Retention is more powerful', '<li><em>Module 11</em> — Retention economics can outperform repeated reacquisition when service quality, expansion potential, and fit support it.</li>'],
  ['Buying Group Orchestration', '<li><em>Module 36</em> — Buying-group orchestration: equip an internal mobilizer with evidence and a low-risk path for building consensus.</li>'],
  ["MEDDIC's P (Paper Process)", '<li><em>Module 38</em> — Map legal, security, procurement, and signature steps early; verbal agreement is not a completed deal.</li>'],
  ['Single-threading is fragile', '<li><em>Module 36</em> — Single-threading is fragile; identify the people who influence, use, approve, fund, and block the decision.</li>'],
  ['Enterprise contracts can take', '<li><em>Module 38</em> — Set realistic expectations and begin contracting work in parallel when the buyer is sufficiently qualified.</li>'],
  ['Better discovery', '<li><em>Module 33</em> — Better discovery improves the relevance of the recommendation, demonstration, and next-step request.</li>'],
  ['Write to one person', '<li><em>Module 7</em> — Write for a defined reader and buying situation; specificity usually improves relevance.</li>'],
  ['Solving for the right problem', '<li><em>Module 33</em> — Confirm the underlying problem before negotiating a remedy or discount.</li>'],
  ['accept their anchor', '<li><em>Module 8</em> — Diagnose the anchor and reframe the discussion with criteria, alternatives, and evidence.</li>'],
  ['Trade variables, not just price', '<li><em>Module 8</em> — Trade across variables such as scope, term, timing, risk, and support instead of conceding price alone.</li>'],
  ['Know your BATNA', '<li><em>Module 8</em> — Define your BATNA, reservation point, target, and tradable variables before negotiating.</li>'],
  ['Holding firm on real worth', '<li><em>Module 37</em> — Defend price with quantified value and trade concessions conditionally; do not assume firmness alone preserves a deal.</li>'],
  ['Existing customers are the highest-leverage', '<li><em>Module 11</em> — Existing customers can be a high-leverage growth source when adoption, outcomes, and expansion fit are strong.</li>'],
  ['Hard things first', '<li><em>Module 16</em> — Founder-led learning should establish a repeatable problem, buyer, value proposition, and motion before aggressive scaling.</li>'],
  ['Churn is preventable', '<li><em>Module 11</em> — Some churn can be reduced by monitoring adoption, outcomes, stakeholder changes, and risk signals early.</li>'],
  ['renewal call', '<li><em>Module 11</em> — Renewal readiness is built throughout the customer lifecycle, not only at the renewal conversation.</li>'],
  ['cost of a single bad fulfillment', '<li><em>Module 11</em> — Poor fulfillment can damage retention, referrals, reputation, and customer lifetime value.</li>'],
  ['Pattern interrupt + permission', '<li><em>Module 5</em> — A respectful pattern interrupt can earn attention, but relevance and permission determine whether the conversation continues.</li>'],
  ['Honesty (', '<li><em>Module 12</em> — Honest framing and respect for the buyer’s attention support trust better than manufactured familiarity.</li>'],
  ['Sell the outcome (becoming president)', '<li><em>Module 19</em> — Connect the offer to the reader’s desired outcome through a concrete, credible story.</li>'],
  ['Stories bypass logical filters', '<li><em>Module 19</em> — Narratives can support attention, comprehension, and memory, but they do not replace evidence.</li>'],
  ['Multithreading is mandatory', '<li><em>Module 36</em> — In complex sales, build legitimate relationships across the buying group to reduce single-contact risk.</li>'],
  ["Champion can't access", '<li><em>Module 23</em> — Test whether a champion has influence, access, and a credible reason to advocate; adjust the stakeholder plan when they do not.</li>'],
  ['Reduce friction to zero', '<li><em>Module 11</em> — Reduce avoidable repurchase friction while preserving necessary safeguards and informed choice.</li>'],
  ['LTV solves CAC problems', '<li><em>Module 11</em> — Strong retention and expansion can improve unit economics, but they do not excuse unprofitable acquisition.</li>'],
  ['Pricing models must align with usage patterns', '<li><em>Module 37</em> — Pricing metrics and packaging should align customer value, usage patterns, willingness to pay, and sustainable delivery economics.</li>'],
  ['A free user is not validation', '<li><em>Module 16</em> — Free usage alone does not establish willingness to pay; committed time, access, pilots, and payment provide different evidence.</li>'],
  ['Consultancy Trap', '<li><em>Module 16</em> — Custom work for unpaid prospects can hide weak repeatable demand; use explicit design-partner terms and learning goals.</li>'],
  ['Consolidate Motion', '<li><em>Module 17</em> — Product usage can reveal a consolidation opportunity when governance, security, and organizational value are real.</li>'],
  ['Never pitch an executive', '<li><em>Module 17</em> — Interview power users before an executive proposal when feasible, and disclose what remains unknown.</li>'],
];

for (const [needle, replacement] of corrections) {
  const indexes = lines.flatMap((line, index) => line.includes(needle) ? [index] : []);
  if (indexes.length !== 1) {
    throw new Error(`Expected one line containing "${needle}", found ${indexes.length}`);
  }
  const indent = lines[indexes[0]].match(/^\s*/)[0];
  lines[indexes[0]] = `${indent}${replacement}`;
}

fs.writeFileSync(path, `${lines.join('\n')}\n`);
console.log(`Applied ${corrections.length} audited case-study corrections.`);
