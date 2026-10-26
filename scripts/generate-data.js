import fs from 'fs';
import path from 'path';

// 1. Parse reasoning traces from README.md
const readme = fs.readFileSync('README.md', 'utf-8');
const reasoningMap = {};
const reasoningRegex = /\|\s*(\d{3})\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|/g;
let rm;
while ((rm = reasoningRegex.exec(readme)) !== null) {
  reasoningMap[rm[1]] = {
    subject: rm[2].trim(),
    pdf: rm[3].trim()
  };
}

// 2. Discipline categorization helper
function inferDiscipline(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  if (text.includes('birch') || text.includes('selmer') || text.includes('elliptic curve') || 
      text.includes('zeta') || text.includes('riemann') || text.includes('l-function') || 
      text.includes('prime') || text.includes('diophantine') || text.includes('hilbert’s tenth') || 
      text.includes('fraction') || text.includes('totient') || text.includes('siegel')) {
    return 'Number Theory & Arithmetic';
  }
  if (text.includes('hodge') || text.includes('abelian') || text.includes('mukai') || 
      text.includes('fano') || text.includes('cohomolog') || text.includes('surface') || 
      text.includes('variety') || text.includes('moduli') || text.includes('sheaf') || 
      text.includes('quiver') || text.includes('kähler') || text.includes('kahler') || 
      text.includes('zariski') || text.includes('affine') || text.includes('algebraic cycle')) {
    return 'Algebraic Geometry';
  }
  if (text.includes('navier-stokes') || text.includes('pde') || text.includes('entropy') || 
      text.includes('sobolev') || text.includes('harmonic') || text.includes('schrödinger') || 
      text.includes('transport') || text.includes('crouzeix') || text.includes('brenier') || 
      text.includes('banach') || text.includes('riesz') || text.includes('differential') || 
      text.includes('lipschitz') || text.includes('holomorphic') || text.includes('regularity')) {
    return 'Analysis & PDEs';
  }
  if (text.includes('ramsey') || text.includes('graph') || text.includes('clique') || 
      text.includes('coloring') || text.includes('hadwiger') || text.includes('crossing') || 
      text.includes('packing') || text.includes('matroid') || text.includes('sidorenko') || 
      text.includes('hamiltonian') || text.includes('tree') || text.includes('tiling')) {
    return 'Combinatorics & Graphs';
  }
  if (text.includes('algorithm') || text.includes('polynomial time') || text.includes('complexity') || 
      text.includes('np-hard') || text.includes('subset sum') || text.includes('matrix multiplication') || 
      text.includes('edit distance') || text.includes('sat') || text.includes('fpras') || 
      text.includes('quantum') || text.includes('turing') || text.includes('logspace') || 
      text.includes('unique games') || text.includes('k-server')) {
    return 'Complexity & Algorithms';
  }
  if (text.includes('ising') || text.includes('percolation') || text.includes('spin') || 
      text.includes('brownian') || text.includes('walk') || text.includes('boltzmann') || 
      text.includes('markov') || text.includes('gaussian') || text.includes('entropy') || 
      text.includes('threshold') || text.includes('talagrand') || text.includes('poisson')) {
    return 'Probability & Stat Mech';
  }
  if (text.includes('heisenberg') || text.includes('vlasov-maxwell') || text.includes('coulomb') || 
      text.includes('ferromagnet') || text.includes('laughlin') || text.includes('lieb-thirring') || 
      text.includes('schrödinger') || text.includes('photon') || text.includes('fluid') || 
      text.includes('einstein') || text.includes('quantum field')) {
    return 'Mathematical Physics';
  }
  if (text.includes('dixmier') || text.includes('c*-algebra') || text.includes('von neumann') || 
      text.includes('operator') || text.includes('hilbert space') || text.includes('kadison') || 
      text.includes('factor') || text.includes('quasitrace') || text.includes('trace') || 
      text.includes('subspace') || text.includes('commutator')) {
    return 'Operator Algebras';
  }
  if (text.includes('group') || text.includes('homology') || text.includes('cat(0)') || 
      text.includes('hyperbolic') || text.includes('manifold') || text.includes('topology') || 
      text.includes('knot') || text.includes('immersion') || text.includes('kervaire') || 
      text.includes('sphere') || text.includes('fundamental group')) {
    return 'Topology & Groups';
  }
  return 'Pure & Applied Mathematics';
}

// 3. Load all Comparator challenges
let challenges = [];
const challengeMap = {};

if (fs.existsSync('lean/ComparatorChallenges')) {
  const challengeFiles = fs.readdirSync('lean/ComparatorChallenges');
  const jsons = challengeFiles.filter(f => f.endsWith('.json'));

  for (const j of jsons) {
    const name = j.replace('.json', '');
    const jsonContent = JSON.parse(fs.readFileSync(path.join('lean/ComparatorChallenges', j), 'utf-8'));
    const leanFile = path.join('lean/ComparatorChallenges', name + '.lean');
    let leanCode = '';
    let lineCount = 0;
    let preview = '';
    if (fs.existsSync(leanFile)) {
      leanCode = fs.readFileSync(leanFile, 'utf-8');
      const lines = leanCode.split('\n');
      lineCount = lines.length;
      const thmIdx = lines.findIndex(l => l.startsWith('theorem ') || l.startsWith('def '));
      if (thmIdx !== -1) {
        preview = lines.slice(thmIdx, thmIdx + 8).join('\n');
      } else {
        preview = lines.slice(0, 8).join('\n');
      }
    }

    const chObj = {
      name,
      challengeModule: jsonContent.challenge_module || '',
      solutionModule: jsonContent.solution_module || '',
      theorems: jsonContent.theorem_names || [],
      definitions: jsonContent.definition_names || [],
      permittedAxioms: jsonContent.permitted_axioms || [],
      enableNanoda: jsonContent.enable_nanoda ?? false,
      lineCount,
      preview,
      matchedFamilyId: null
    };
    challenges.push(chObj);
    challengeMap[name] = chObj;
  }
} else if (fs.existsSync('src/data/challenges.json')) {
  challenges = JSON.parse(fs.readFileSync('src/data/challenges.json', 'utf-8'));
  for (const ch of challenges) {
    challengeMap[ch.name] = ch;
  }
}

// 4. Parse CONTENTS.md
const contents = fs.readFileSync('CONTENTS.md', 'utf-8');
const lines = contents.split('\n');
const families = [];
let currentFam = null;
let currentPaper = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const famMatch = line.match(/^\*\*(\d{3})\.\s*(.*?)\.\*\*\s*(.*)$/);
  if (famMatch) {
    if (currentPaper && currentFam) {
      currentFam.papers.push(currentPaper);
      currentPaper = null;
    }
    if (currentFam) families.push(currentFam);

    const fId = famMatch[1];
    const fTitle = famMatch[2].trim();
    const fSummary = famMatch[3].trim();
    const leanMatch = fSummary.match(/\[Lean\]\(([^)]+)\)/);

    currentFam = {
      id: fId,
      title: fTitle,
      summary: fSummary,
      discipline: inferDiscipline(fTitle, fSummary),
      hasLeanDoc: !!leanMatch,
      leanDoc: leanMatch ? leanMatch[1] : null,
      reasoningTrace: reasoningMap[fId] || null,
      papers: [],
      challenges: [],
      status: 'active'
    };
    continue;
  }

  const paperMatch = line.match(/(?:&emsp;|<p>|<td>)?\s*\[([^\]]+)\]\((preprints\/[^)]+)\)(.*)$/);
  if (paperMatch && currentFam) {
    if (currentPaper) {
      currentFam.papers.push(currentPaper);
    }
    currentPaper = {
      title: paperMatch[1].trim(),
      pdf: paperMatch[2].trim(),
      abstract: paperMatch[3] ? paperMatch[3].trim() : ''
    };
    continue;
  }

  if (currentPaper && line && !line.startsWith('</td>') && !line.startsWith('</tr>') && !line.startsWith('<tbody>') && !line.startsWith('<table>')) {
    if (currentPaper.abstract) currentPaper.abstract += ' ' + line;
    else currentPaper.abstract = line;
  } else if (line.startsWith('</td>') && currentPaper) {
    if (currentFam) currentFam.papers.push(currentPaper);
    currentPaper = null;
  }
}
if (currentPaper && currentFam) currentFam.papers.push(currentPaper);
if (currentFam) families.push(currentFam);

// 5. Correlate challenges with families
for (const ch of challenges) {
  const words = ch.name.replace(/([a-z])([A-Z0-9])/g, '$1 $2').toLowerCase().split(' ').filter(w => w.length > 2);
  let bestFam = null;
  let bestScore = 0;

  for (const fam of families) {
    const famText = (fam.title + ' ' + fam.summary + ' ' + fam.papers.map(p => p.title).join(' ')).toLowerCase();
    let score = 0;
    for (const w of words) {
      if (famText.includes(w)) score += 1;
    }
    if (score > bestScore && score >= Math.min(2, words.length)) {
      bestScore = score;
      bestFam = fam;
    }
  }

  if (bestFam) {
    bestFam.challenges.push(ch.name);
    ch.matchedFamilyId = bestFam.id;
  }
}

// Specific withdrawn flags from history.md
const withdrawnFamilyIds = ['001']; // or check titles in history
for (const fam of families) {
  if (fam.summary.toLowerCase().includes('withdrawn') || fam.title.toLowerCase().includes('eightfolds')) {
    fam.status = 'withdrawn';
  } else if (fam.summary.toLowerCase().includes('revised') || fam.title.toLowerCase().includes('ashkin')) {
    fam.status = 'revised';
  }
}

// 6. Compute statistics
const stats = {
  totalFamilies: families.length,
  totalPapers: families.reduce((acc, f) => acc + f.papers.length, 0),
  totalChallenges: challenges.length,
  formalizedFamiliesCount: families.filter(f => f.hasLeanDoc || f.challenges.length > 0).length,
  topLineFormalizationPercent: 42,
  topLineFormalizedCount: 300,
  supportingFormalizedCount: 116,
  disciplines: {},
  axioms: {}
};

for (const fam of families) {
  stats.disciplines[fam.discipline] = (stats.disciplines[fam.discipline] || 0) + 1;
}

for (const ch of challenges) {
  for (const ax of ch.permittedAxioms) {
    stats.axioms[ax] = (stats.axioms[ax] || 0) + 1;
  }
}

// Save outputs
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/families.json', JSON.stringify(families));
fs.writeFileSync('src/data/challenges.json', JSON.stringify(challenges));
fs.writeFileSync('src/data/stats.json', JSON.stringify(stats));

console.log('✅ Generation complete!');
console.log('Families:', families.length, 'Papers:', stats.totalPapers, 'Challenges:', challenges.length);
