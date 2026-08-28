/* ColbyMajorGuide — program data
 * Source: Colby College course catalogue, "Department and Program Requirements",
 * read 27 August 2026. Course numbers and exclusion rules are quoted from those pages.
 * The four-year staging is this guide's reading of the requirements, not the registrar's.
 *
 * kind:    major | conc (concentration inside a major) | joint | minor
 * div:     sci (natural sciences & maths) | soc (social sciences) | hum (humanities)
 * cluster: layout anchor on the map
 * links:   programs joined by a shared required course, a joint degree, or a named
 *          substitution — never by mere topical resemblance.
 */

const CLUSTERS = {
  computing:  { div: 'sci', x: 0.118, y: 0.20 },
  quant:      { div: 'sci', x: 0.065, y: 0.55 },
  life:       { div: 'sci', x: 0.232, y: 0.21 },
  physical:   { div: 'sci', x: 0.154, y: 0.83 },
  earthenv:   { div: 'sci', x: 0.260, y: 0.58 },
  mind:       { div: 'sci', x: 0.276, y: 0.90 },

  sts:        { div: 'soc', x: 0.357, y: 0.13 },
  econgov:    { div: 'soc', x: 0.396, y: 0.34 },
  society:    { div: 'soc', x: 0.373, y: 0.66 },
  world:      { div: 'soc', x: 0.453, y: 0.47 },
  ed:         { div: 'soc', x: 0.428, y: 0.88 },

  letters:    { div: 'hum', x: 0.680, y: 0.17 },
  thought:    { div: 'hum', x: 0.567, y: 0.50 },
  arts:       { div: 'hum', x: 0.887, y: 0.30 },
  languages:  { div: 'hum', x: 0.851, y: 0.74 },
  area:       { div: 'hum', x: 0.600, y: 0.87 }
};

const BANDS = [
  /* band widths track program counts: 32 natural sciences, 18 social, 51 humanities */
  { div: 'sci', label: 'Natural sciences', x0: 0.012, x1: 0.312 },
  { div: 'soc', label: 'Social sciences',  x0: 0.332, x1: 0.492 },
  { div: 'hum', label: 'Humanities',       x0: 0.512, x1: 0.988 }
];

const PROGRAMS = [

/* ============================ NATURAL SCIENCES ============================ */

{
  id: 'cs', name: 'Computer Science', short: 'Computer Science',
  div: 'sci', cluster: 'computing', kind: 'major', dept: 'Computer Science',
  size: 'Roughly 9 courses plus a 300→400 sequence',
  blurb: 'The department frames the subject as computational thinking: deconstructing a problem until it can be described as computable operations. Projects grow in scope within each course and across the major.',
  path: [
    { when: 'Year 1', what: 'One of the gateway courses, <span class="code">CS 151</span> Visual Media, <span class="code">CS 152</span> Science, <span class="code">CS 153</span> Smart Systems or <span class="code">CS 166</span>. Any of the 15X/16X courses opens the whole major, so pick by the domain you like.' },
    { when: 'Year 2', what: '<span class="code">CS 231</span> Data Structures and Algorithms, <span class="code">CS 232</span> Computer Organization, and <span class="code">CS 251</span> or <span class="code">252</span> Data Analysis and Visualization. Add a 200-level mathematics or statistics course.' },
    { when: 'Year 3', what: '<span class="code">CS 333</span> and a theory course, one of <span class="code">375</span>, <span class="code">376</span> or <span class="code">378</span>. Start the two-semester sequence with its 300-level half.' },
    { when: 'Year 4', what: 'Close the sequence with its 400-level half. Honours students run <span class="code">CS 483</span>/<span class="code">484</span>, at least seven credits, ending in a paper and a colloquium.' }
  ],
  rules: [
    '<b>Take a 15X course in your first year</b> if you are considering any computing path. Every CS+X major starts there too.',
    '<b>One computing major only.</b> CS, CS with AI, data science, computational biology, computational psychology, environmental computation, music&ndash;IC and theater&ndash;IC are mutually exclusive.',
    'A computing major cannot also minor in computer science or data science.',
    'Only <span class="code">15X/16X</span>, <span class="code">231</span> and <span class="code">251/252</span> may double-count into an interdisciplinary computation major.',
    'Honours needs a 3.6 GPA across CS courses numbered 200 and above.'
  ],
  links: ['csai', 'ds', 'stat', 'math', 'compbio', 'comppsy', 'envcomp', 'musicic', 'ptdic', 'physics', 'sts', 'earth']
},
{
  id: 'csai', name: 'Computer Science: Artificial Intelligence', short: 'CS · AI',
  div: 'sci', cluster: 'computing', kind: 'conc', dept: 'Computer Science',
  size: 'The CS core plus a required AI sequence',
  blurb: 'The same spine as the CS major with the electives pinned to machine learning and intelligent systems, and a linear algebra requirement written into the degree rather than left to choice.',
  path: [
    { when: 'Year 1', what: '<span class="code">CS 15X</span> or <span class="code">16X</span>.' },
    { when: 'Year 2', what: '<span class="code">CS 231</span>, <span class="code">232</span>, <span class="code">251</span> or <span class="code">252</span>, plus <span class="code">MA 253</span> Linear Algebra (take <span class="code">CS 252</span> if you go this way) or <span class="code">MA 274</span>.' },
    { when: 'Year 3', what: '<span class="code">CS 310</span>, <span class="code">333</span>, <span class="code">343</span> Neural Networks, and a theory course from <span class="code">375</span>, <span class="code">376</span>, <span class="code">378</span>.' },
    { when: 'Year 4', what: 'The 400-level half of a two-semester AI-related sequence begun at the 300 level.' }
  ],
  rules: [
    '<b>You cannot hold both</b> this concentration and the plain computer science major.',
    'The linear-algebra requirement is the practical difference from the CS major: decide by the end of second year.'
  ],
  links: ['cs', 'math', 'ds', 'comppsy', 'sts']
},
{
  id: 'ds', name: 'Data Science', short: 'Data Science',
  div: 'sci', cluster: 'computing', kind: 'major', dept: 'Computer Science, Mathematics &amp; Statistics',
  size: '12 courses',
  blurb: 'Run jointly by three departments. Collection, storage, integration, analysis, inference, communication and the ethics of data in context, ending in a two-course applied sequence you propose yourself.',
  path: [
    { when: 'Year 1', what: '<span class="code">CS 151</span>, <span class="code">152</span>, <span class="code">154</span> or <span class="code">166</span>; <span class="code">MA 160</span> or <span class="code">165</span>.' },
    { when: 'Year 2', what: '<span class="code">CS 231</span>; <span class="code">MA 253</span> Linear Algebra; <span class="code">SC 212</span> Introduction to Statistics and Data Science; <span class="code">ES 218</span> Exploratory Data Analysis in R.' },
    { when: 'Year 3', what: '<span class="code">CS 310</span>; <span class="code">SC 321</span> and <span class="code">SC 324</span>; and one of <span class="code">CS 251</span>, <span class="code">CS 252</span> or <span class="code">SC 326</span>. Get your applied sequence approved now.' },
    { when: 'Year 4', what: 'The two-course applied sequence, from any department, chosen for real data work or for theory of direct relevance to data science.' }
  ],
  rules: [
    '<b>The applied sequence needs approval four months before</b> you enrol in its first course. This is the deadline students miss.',
    'Excludes majors in CS, statistics, computational biology, computational psychology, environmental computation, music&ndash;IC and theater&ndash;IC, and minors in CS or statistics.',
    'Economics or psychology majors who finished their second methods course do not need <span class="code">SC 212</span>.',
    '<span class="code">MA 274</span> and <span class="code">MA 381</span> are recommended but not required.'
  ],
  links: ['cs', 'stat', 'math', 'envsci', 'econ', 'psy']
},
{
  id: 'math', name: 'Mathematics', short: 'Mathematics',
  div: 'sci', cluster: 'quant', kind: 'major', dept: 'Mathematics',
  size: '10 courses, all at C&minus; or better',
  blurb: 'The proof-first track. Colby recommends finishing the transition-to-proof course before the end of second year, which is the real gate on everything at the 300 level.',
  path: [
    { when: 'Year 1', what: '<span class="code">MA 160</span> or <span class="code">165</span> Series and Multi-Variable Calculus. All incoming students must complete the calculus placement questionnaire before registration.' },
    { when: 'Year 2', what: '<span class="code">MA 253</span> Linear Algebra and <span class="code">MA 274</span>, or <span class="code">MA 165</span> at A&minus; or above in place of 274.' },
    { when: 'Year 3', what: '<span class="code">MA 333</span> and <span class="code">MA 338</span>, plus electives from <span class="code">MA 262</span> and any 300-level course.' },
    { when: 'Year 4', what: '<span class="code">MA 434</span> or <span class="code">MA 439</span>. Honours students take <span class="code">MA 484</span> as supervised independent study, ending in a paper and a colloquium.' }
  ],
  rules: [
    '<b>Every requirement must be C&minus; or better.</b>',
    'Four additional courses from <span class="code">MA 262</span> or any 3&ndash;4 credit course numbered 300+, excluding <span class="code">484</span>.',
    'Honours needs a 3.25 GPA in mathematics courses numbered 200 and above.',
    'Graduate school in mathematics means going well past the minimum: talk to faculty early.'
  ],
  links: ['mathsci', 'stat', 'ds', 'cs', 'physics', 'econ', 'astro']
},
{
  id: 'mathsci', name: 'Mathematical Sciences', short: 'Mathematical Sciences',
  div: 'sci', cluster: 'quant', kind: 'major', dept: 'Mathematics',
  size: '10 courses, all at C&minus; or better',
  blurb: 'The applied sibling of the mathematics major. Trades the algebra&ndash;analysis capstone pair for a statistics requirement, a computing requirement and a topics course.',
  path: [
    { when: 'Year 1', what: '<span class="code">MA 160</span> or <span class="code">165</span>.' },
    { when: 'Year 2', what: '<span class="code">MA 253</span>, <span class="code">MA 274</span> (or <span class="code">165</span> at A&minus;+), <span class="code">SC 212</span>, and one Colby computer science course.' },
    { when: 'Year 3', what: '<span class="code">MA 311</span> Ordinary Differential Equations plus three more mathematics courses numbered 200 or above.' },
    { when: 'Year 4', what: 'One topics course in mathematics numbered 400 or above, excluding <span class="code">484</span>.' }
  ],
  rules: [
    '<span class="code">PS 214/215</span> or <span class="code">EC 293</span>/<span class="code">393</span> at C&minus; or better substitutes for <span class="code">SC 212</span> &mdash; take one more mathematics course instead.',
    'Finish <span class="code">MA 274</span> before the end of second year.'
  ],
  links: ['math', 'stat', 'cs', 'econ', 'psy']
},
{
  id: 'stat', name: 'Statistics', short: 'Statistics',
  div: 'sci', cluster: 'quant', kind: 'major', dept: 'Statistics',
  size: '10 courses, all at C&minus; or better',
  blurb: 'Built to pair with a field where data is central. Not only how to display and analyse data, but how to design the study and collect it in the first place.',
  path: [
    { when: 'Year 1', what: '<span class="code">MA 122</span>, <span class="code">160</span> or <span class="code">165</span>, and a computer science course.' },
    { when: 'Year 2', what: '<span class="code">SC 212</span> Introduction to Statistical Methods and <span class="code">MA 253</span> Linear Algebra.' },
    { when: 'Year 3', what: '<span class="code">SC 321</span> Applied Regression Modeling, <span class="code">MA 381</span>, and one of <span class="code">MA 274</span>, a 200-level CS course, or a 300-level statistics course.' },
    { when: 'Year 4', what: '<span class="code">SC 482</span> plus two statistics electives numbered 300 or above.' }
  ],
  rules: [
    'Data science majors may not major in statistics.',
    '<b>Everything at C&minus; or better.</b> Nothing satisfactory/unsatisfactory.',
    'For the minor, <span class="code">PS 214/215</span> or <span class="code">EC 293/393</span> can stand in for <span class="code">SC 212</span>.'
  ],
  links: ['math', 'ds', 'cs', 'econ', 'psy', 'soc', 'envsci', 'bio']
},
{
  id: 'physics', name: 'Physics', short: 'Physics',
  div: 'sci', cluster: 'physical', kind: 'major', dept: 'Physics &amp; Astronomy',
  size: 'Six required physics courses, four maths/CS, three electives',
  blurb: 'From subatomic scales up to galaxies. The department deliberately keeps the major flexible: six fixed courses, then a wide elective menu including neurobiology, physical chemistry and numerical analysis.',
  path: [
    { when: 'Year 1', what: '<span class="code">PH 141</span> Foundations of Mechanics (or <span class="code">143</span> Honors Physics) and <span class="code">PH 145</span> Electromagnetism and Optics, alongside single-variable calculus.' },
    { when: 'Year 2', what: '<span class="code">PH 241</span> and <span class="code">242</span> Modern Physics I and II, <span class="code">PH 250</span> Experiments in Modern Physics. Keep building the four maths/CS courses; at most one may be CS.' },
    { when: 'Year 3', what: 'Three or more electives, at least two of them 300-level physics or astronomy, and at least one taken at Colby. <span class="code">PH 311</span>, <span class="code">321</span>, <span class="code">332</span>, <span class="code">431</span> are the graduate-school spine.' },
    { when: 'Year 4', what: '<span class="code">PH 401</span> Senior Physics and Astronomy Seminar, required of all seniors. Honours adds <span class="code">PH 483</span>/<span class="code">484</span> and a written thesis.' }
  ],
  rules: [
    '<b>Seniors must enrol in <span class="code">PH 401</span>.</b> No exceptions in the requirement text.',
    'Physics minors cannot also minor in astronomy.',
    'Graduate school: the department names <span class="code">MA 253</span>, <span class="code">262</span>, <span class="code">311</span>, <span class="code">352</span> and <span class="code">PH 253</span>, <span class="code">311</span>, <span class="code">321</span>, <span class="code">332</span>, <span class="code">431</span>.',
    'Dual-degree engineering exchanges exist with Dartmouth and Columbia; see the engineering advisor before your first semester.'
  ],
  links: ['astrophys', 'astro', 'math', 'chem', 'bio', 'earth', 'cs']
},
{
  id: 'astrophys', name: 'Physics: Astrophysics', short: 'Astrophysics',
  div: 'sci', cluster: 'physical', kind: 'conc', dept: 'Physics &amp; Astronomy',
  size: 'The physics core plus two astronomy courses',
  blurb: 'The route to graduate astronomy. Same physics spine, with the two astronomy courses moved from elective to required and the electives narrowed toward astrophysical topics.',
  path: [
    { when: 'Year 1', what: '<span class="code">PH 141</span>/<span class="code">143</span> and <span class="code">PH 145</span>, plus calculus.' },
    { when: 'Year 2', what: '<span class="code">PH 241</span>, <span class="code">242</span>, <span class="code">250</span>; <span class="code">AY 231</span> Introduction to Astrophysics, which must be taken at Colby. One CS course, three maths courses.' },
    { when: 'Year 3', what: '<span class="code">AY 342</span> Galaxies and Cosmology, plus at least two electives, one of them 300-level physics or astronomy. Summer research with faculty is strongly encouraged before senior year.' },
    { when: 'Year 4', what: '<span class="code">PH 401</span>. Honours adds three more electives and <span class="code">PH 483</span>/<span class="code">484</span>, with the thesis expected to be astrophysical.' }
  ],
  rules: [
    '<b><span class="code">AY 231</span> and one 300-level physics or astronomy course must be taken at Colby</b>, not abroad.',
    'This concentration, not the astronomy minor, is the graduate-school path.'
  ],
  links: ['physics', 'astro', 'math', 'stat', 'cs']
},
{
  id: 'astro', name: 'Astronomy', short: 'Astronomy',
  div: 'sci', cluster: 'physical', kind: 'minor', parent: null, dept: 'Physics &amp; Astronomy',
  size: '5 required courses plus an intro',
  blurb: 'General exposure to astronomy for students in any major. Colby is explicit that this is not the research path: that is the astrophysics concentration.',
  path: [
    { when: 'Year 1', what: '<span class="code">AY 151</span> or <span class="code">AY 172</span>, plus single-variable calculus.' },
    { when: 'Year 2', what: '<span class="code">PH 141</span> (or <span class="code">143</span>) and <span class="code">PH 145</span>.' },
    { when: 'Year 3', what: '<span class="code">AY 231</span> Introduction to Astrophysics.' },
    { when: 'Year 4', what: '<span class="code">AY 342</span> Galaxies and Cosmology.' }
  ],
  rules: [
    '<b>Cannot be combined</b> with a physics major or minor.',
    'Nothing in the minor may be taken satisfactory/unsatisfactory.'
  ],
  links: ['physics', 'astrophys']
},
{
  id: 'chem', name: 'Chemistry', short: 'Chemistry',
  div: 'sci', cluster: 'physical', kind: 'major', dept: 'Chemistry',
  size: 'Around 13 courses including two years of seminar',
  blurb: 'A full instrument-access major with analytical, environmental, inorganic, organic and physical specialists on the faculty. Every major does an independent research project that becomes their seminar talk.',
  path: [
    { when: 'Year 1', what: '<span class="code">CH 141</span> and <span class="code">142</span> General Chemistry, or <span class="code">CH 121</span>/<span class="code">122</span>, or the single-semester <span class="code">CH 147</span>. The department urges you to do this in first year for flexibility.' },
    { when: 'Year 2', what: '<span class="code">CH 241</span> and <span class="code">242</span> Organic Chemistry, with <span class="code">MA 160</span>/<span class="code">165</span> and <span class="code">PH 141</span>/<span class="code">145</span> alongside.' },
    { when: 'Year 3', what: '<span class="code">CH 341</span> and <span class="code">342</span> Physical Chemistry, two courses from <span class="code">261</span>/<span class="code">263</span>, <span class="code">362</span>/<span class="code">367</span>, <span class="code">411</span>, and two laboratory courses. Start the independent research project.' },
    { when: 'Year 4', what: '<span class="code">CH 493</span> and <span class="code">494</span> Seminar, required of all senior majors. Juniors are encouraged to attend.' }
  ],
  rules: [
    '<b>Every major must complete an independent research project</b> of two, preferably three, credits. It is the basis of the seminar talk.',
    'Off-campus research needs the chair&rsquo;s prior approval to count.',
    'ACS accreditation is available on any of the chemistry majors with extra courses chosen with your advisor.',
    'Pre-med chemistry majors should add a biology course with a laboratory.'
  ],
  links: ['biochem', 'chemenv', 'bio', 'physics', 'envsci', 'earth', 'math']
},
{
  id: 'biochem', name: 'Chemistry: Biochemistry &amp; Molecular Biology', short: 'Chem · Biochem',
  div: 'sci', cluster: 'life', kind: 'conc', dept: 'Chemistry',
  size: 'Around 14 courses across two departments',
  blurb: 'The chemistry-side route into biochemistry. Biochemistry courses are cross-listed in both biology and chemistry, but Colby is strict about which major they count toward.',
  path: [
    { when: 'Year 1', what: '<span class="code">CH 141</span>/<span class="code">142</span> (or <span class="code">121</span>/<span class="code">122</span>, or <span class="code">147</span>) and <span class="code">BI 163</span> Cellular Basis of Life.' },
    { when: 'Year 2', what: '<span class="code">CH 241</span> and <span class="code">242</span>; <span class="code">MA 160</span>/<span class="code">165</span>; <span class="code">PH 141</span>/<span class="code">145</span>.' },
    { when: 'Year 3', what: '<span class="code">CH 341</span>; <span class="code">BC 367</span> and <span class="code">368</span>, both with laboratory; <span class="code">BI 279</span> with laboratory.' },
    { when: 'Year 4', what: '<span class="code">BC 378</span>, plus <span class="code">CH 493</span> and <span class="code">494</span> Seminar.' }
  ],
  rules: [
    '<b><span class="code">BC 367</span>, <span class="code">368</span>, <span class="code">378</span> and <span class="code">BI 279</span> cannot be double-counted</b> toward both a biology major and this concentration.',
    'The independent research project requirement applies to every chemistry major.'
  ],
  links: ['chem', 'bio', 'biocmb', 'envsci']
},
{
  id: 'chemenv', name: 'Chemistry: Environmental Science', short: 'Chem · Environmental',
  div: 'sci', cluster: 'earthenv', kind: 'conc', dept: 'Chemistry',
  size: 'Around 14 courses',
  blurb: 'Chemistry with the analytical and environmental sequence made compulsory. Note that it is a chemistry degree, not an environmental studies one, and the two are mutually exclusive.',
  path: [
    { when: 'Year 1', what: '<span class="code">CH 121</span> and <span class="code">122</span> Earth Systems Chemistry (or <span class="code">141</span>/<span class="code">142</span>, or <span class="code">147</span>).' },
    { when: 'Year 2', what: '<span class="code">CH 241</span>, <span class="code">242</span>; <span class="code">MA 160</span>/<span class="code">165</span>; <span class="code">PH 141</span>/<span class="code">145</span>.' },
    { when: 'Year 3', what: '<span class="code">CH 261</span> and <span class="code">263</span>, <span class="code">CH 341</span>, <span class="code">CH 351</span>, one course from <span class="code">342</span>, <span class="code">362</span>, <span class="code">367</span> or <span class="code">411</span>, and one further laboratory course.' },
    { when: 'Year 4', what: '<span class="code">CH 493</span> and <span class="code">494</span> Seminar, plus the independent research project.' }
  ],
  rules: [
    '<b>You cannot hold both</b> this concentration and an environmental science major.'
  ],
  links: ['chem', 'envsci', 'earth', 'envpol']
},
{
  id: 'bio', name: 'Biology', short: 'Biology',
  div: 'sci', cluster: 'life', kind: 'major', dept: 'Biology',
  size: '31 credit hours in biology plus cognates',
  blurb: 'Molecules to ecosystems, with laboratory and field work throughout. The department keeps formal ties to Jackson Laboratory, MDI Biological Laboratory, Bigelow and the MBL at Woods Hole.',
  path: [
    { when: 'Year 1', what: '<span class="code">BI 163</span> Cellular Basis of Life and <span class="code">BI 164</span> Evolution and Diversity, plus <span class="code">CH 141</span>/<span class="code">142</span> (or <span class="code">121</span>/<span class="code">122</span>, or <span class="code">147</span>) and the calculus requirement.' },
    { when: 'Year 2', what: 'One field-biology course with laboratory and one cellular-biology course with laboratory. Add the quantitative course: <span class="code">CS 15X</span>/<span class="code">166</span>, <span class="code">MA 160</span>/<span class="code">165</span>/<span class="code">253</span>, <span class="code">SC 212</span>, <span class="code">EC 293</span>, <span class="code">PS 214</span> or <span class="code">SO 271</span>.' },
    { when: 'Year 3', what: 'Two biology courses at the 300 level. Keep the lab count climbing: six biology courses must carry labs.' },
    { when: 'Year 4', what: '<span class="code">BI 401</span> (fall) or <span class="code">BI 402</span> (spring), required of all seniors. Honours runs across the senior year for seven to nine credits with a thesis committee, an interim report and an oral examination.' }
  ],
  rules: [
    '<b>Six biology courses must be taken with labs</b> and two at the 300 level.',
    'At most four credits of independent study and two of seminar count toward the major.',
    'Off-campus study contributes at most eight credits in a semester and twelve in total.',
    'Distinction in the major is awarded at a 3.5 average; honours entry needs a 3.5 cumulative GPA by January of junior year.'
  ],
  links: ['bioee', 'biocmb', 'bioneuro', 'compbio', 'chem', 'biochem', 'psy', 'envsci', 'earth', 'stat', 'physics']
},
{
  id: 'bioee', name: 'Biology: Ecology &amp; Evolution', short: 'Bio · Ecology',
  div: 'sci', cluster: 'earthenv', kind: 'conc', dept: 'Biology',
  size: 'The biology major plus five specified courses',
  blurb: 'Aimed at graduate study or work in ecology, evolutionary biology and natural resource management. Recent graduates go to state and federal agencies and consulting firms as often as to doctoral programs.',
  path: [
    { when: 'Year 1', what: '<span class="code">BI 163</span>, <span class="code">BI 164</span>, general chemistry, calculus.' },
    { when: 'Year 2', what: '<span class="code">BI 271</span> Ecology and <span class="code">SC 212</span>.' },
    { when: 'Year 3', what: '<span class="code">BI 320</span>, and <span class="code">BI 328</span> or <span class="code">382</span>. One organismal or taxonomy-based course with lab from <span class="code">211</span>, <span class="code">218</span>, <span class="code">237</span>, <span class="code">241</span>, <span class="code">248</span>, <span class="code">254</span>, <span class="code">276</span>, <span class="code">277</span>, <span class="code">334</span>.' },
    { when: 'Year 4', what: '<span class="code">BI 401</span> or <span class="code">402</span>.' }
  ],
  rules: [
    'This sits on top of the full biology major, not instead of it.',
    '<span class="code">SC 212</span> is required here even though the base major allows several substitutes.'
  ],
  links: ['bio', 'envsci', 'earth', 'stat', 'envpol']
},
{
  id: 'biocmb', name: 'Biology: Cell &amp; Molecular Biology / Biochemistry', short: 'Bio · Cell &amp; Molecular',
  div: 'sci', cluster: 'life', kind: 'conc', dept: 'Biology',
  size: 'The biology major plus seven specified courses',
  blurb: 'The biology-side route into biochemistry, at the interface with chemistry. The standard pre-medical and biomedical-research path inside the department.',
  path: [
    { when: 'Year 1', what: '<span class="code">BI 163</span>, <span class="code">164</span>; <span class="code">CH 141</span>/<span class="code">142</span>.' },
    { when: 'Year 2', what: '<span class="code">CH 241</span> and <span class="code">242</span> Organic Chemistry; <span class="code">PH 141</span> and <span class="code">145</span>.' },
    { when: 'Year 3', what: '<span class="code">BI 279</span>; <span class="code">BC 367</span> and <span class="code">368</span>, both with laboratory; one further cell- or molecular-level course with lab.' },
    { when: 'Year 4', what: '<span class="code">BC 378</span>, plus <span class="code">BI 401</span> or <span class="code">402</span>.' }
  ],
  rules: [
    'Physics and organic chemistry are both compulsory here, which is the heaviest cognate load of the three biology concentrations.',
    'The biochemistry courses cannot be double-counted into a chemistry major with the biochemistry concentration.'
  ],
  links: ['bio', 'chem', 'biochem', 'compbio']
},
{
  id: 'bioneuro', name: 'Biology: Neuroscience', short: 'Bio · Neuroscience',
  div: 'sci', cluster: 'mind', kind: 'conc', dept: 'Biology',
  size: 'The biology major plus roughly six courses',
  blurb: 'Neuroscience from the cellular, molecular and physiological side. Colby deliberately offers no standalone neuroscience major: the view is that interdisciplinary work needs a disciplinary foundation first.',
  path: [
    { when: 'Year 1', what: '<span class="code">BI 163</span>, <span class="code">164</span>, general chemistry, and <span class="code">PS 111</span>.' },
    { when: 'Year 2', what: 'Biology core requirements, plus one psychology course from <span class="code">232</span>, <span class="code">233</span>, <span class="code">234</span>, <span class="code">242</span>, <span class="code">244</span>, <span class="code">272</span>.' },
    { when: 'Year 3', what: '<span class="code">BI 274</span> Neurobiology, plus two animal-based cell, tissue or organismal courses, and one further 200-level-or-above psychology elective.' },
    { when: 'Year 4', what: '<span class="code">BI 401</span> or <span class="code">402</span>.' }
  ],
  rules: [
    '<b>You may not double major</b> in biology with a neuroscience concentration and psychology: neuroscience.',
    'The psychology course list is updated as new courses appear &mdash; check with your advisor rather than the printed list.'
  ],
  links: ['bio', 'psy', 'psyneuro', 'chem']
},
{
  id: 'compbio', name: 'Computational Biology', short: 'Computational Biology',
  div: 'sci', cluster: 'computing', kind: 'major', dept: 'Biology &amp; Computer Science',
  size: 'Foundations, five core courses, four electives',
  blurb: 'A designed major, not a pre-set one: you build an integrative plan with advisors in both departments. Aimed at bioinformatics and computational biology research or employment.',
  path: [
    { when: 'Year 1', what: '<span class="code">BI 163</span> and <span class="code">164</span>; <span class="code">CS 151</span>, <span class="code">152</span>, <span class="code">153</span> or <span class="code">166</span>; single-variable then multivariable calculus. All of these can come from placement exams.' },
    { when: 'Year 2', what: '<span class="code">CS 231</span> and <span class="code">CS 251</span> or <span class="code">252</span>; <span class="code">MA 253</span> or <span class="code">262</span>; <span class="code">SC 212</span>.' },
    { when: 'Year 3', what: '<span class="code">BI 278</span> and <span class="code">BI 279</span>. Two 300-level biology electives from <span class="code">320</span>, <span class="code">323</span>, <span class="code">345</span>, <span class="code">371</span>, <span class="code">376</span>, <span class="code">377</span>, <span class="code">378</span>, <span class="code">382</span>.' },
    { when: 'Year 4', what: 'Two 300-level-or-above computer science electives from <span class="code">341</span>/<span class="code">441</span>, <span class="code">343</span>/<span class="code">443</span>, <span class="code">346</span>/<span class="code">446</span>.' }
  ],
  rules: [
    '<b>One computing major only</b> &mdash; this excludes CS, CS with AI, data science, computational psychology, environmental computation and both interdisciplinary-computation arts majors.',
    'Courses required for this major may not be taken satisfactory/unsatisfactory.'
  ],
  links: ['bio', 'cs', 'ds', 'stat', 'biocmb', 'math']
},
{
  id: 'earth', name: 'Earth Sciences', short: 'Earth Sciences',
  div: 'sci', cluster: 'earthenv', kind: 'major', dept: 'Earth Sciences',
  size: '10 courses plus a capstone',
  blurb: 'Four and a half billion years of planetary history, taught with a powder XRD, a scanning electron microscope, ice and sediment core storage, and the Colby Compass research vessel. Field and lab work are integrated in most courses.',
  path: [
    { when: 'Year 1', what: 'A 100-level laboratory course: <span class="code">EA 122</span>, <span class="code">123</span>, <span class="code">125</span>, <span class="code">127</span>, <span class="code">128</span> or <span class="code">129</span>. Talk to a major advisor in your first two years about language and distribution planning.' },
    { when: 'Year 2', what: 'The four core courses, <span class="code">EA 228</span>, <span class="code">231</span>, <span class="code">254</span> and <span class="code">262</span>, plus the two cognates from biology, chemistry, CS, physics, mathematics or <span class="code">SC 212</span>.' },
    { when: 'Year 3', what: 'Four Earth sciences electives numbered 200 or above. Discuss your capstone with your advisor this year.' },
    { when: 'Year 4', what: 'The capstone: four or more credits of <span class="code">EA 491</span>/<span class="code">492</span>, a substantial off-campus research experience, or an honours thesis via <span class="code">EA 483</span>/<span class="code">484</span>.' }
  ],
  rules: [
    'One elective may be replaced by a 200-level-or-above course in biology, chemistry, CS, GIS, mathematics, physics or statistics, excluding <span class="code">SC 212</span>, with the chair&rsquo;s approval.',
    'Honours needs a 3.5 GPA in the major by the end of junior year and no fewer than six credits of <span class="code">EA 483</span>/<span class="code">484</span>.',
    'The department strongly encourages chemistry, physics and mathematics beyond the minimum.'
  ],
  links: ['chem', 'bio', 'physics', 'envsci', 'chemenv', 'math', 'stat', 'cs']
},
{
  id: 'envsci', name: 'Environmental Science', short: 'Environmental Science',
  div: 'sci', cluster: 'earthenv', kind: 'major', dept: 'Environmental Studies',
  size: 'Foundations, methods, human dimensions, four electives, capstone',
  blurb: 'Founded in 1971 and nationally recognised. Interdisciplinary by design: the science core is real, but two courses on the human dimensions of environmental problems are written into the degree.',
  path: [
    { when: 'Year 1', what: '<span class="code">ES 118</span> Environment and Society (or <span class="code">ES 120</span>); <span class="code">BI 163</span> and <span class="code">164</span>; <span class="code">CH 121</span>/<span class="code">122</span> or <span class="code">141</span>/<span class="code">142</span> or <span class="code">147</span>; <span class="code">MA 120</span> or higher.' },
    { when: 'Year 2', what: '<span class="code">BI 271</span> Ecology; <span class="code">SC 212</span>; and one quantitative or GIS course such as <span class="code">ES 212</span>, <span class="code">214</span>, <span class="code">218</span>, <span class="code">235</span>, <span class="code">CS 151</span>/<span class="code">152</span>, <span class="code">BI 382</span> or <span class="code">SC 306</span>/<span class="code">321</span>/<span class="code">326</span>.' },
    { when: 'Year 3', what: 'Two human-dimensions courses in environmental policy, environmental economics or environmental humanities, plus electives. Build a theme with your advisor: forests, marine, freshwater, biodiversity, conservation, climate.' },
    { when: 'Year 4', what: '<span class="code">ES 494</span> Environmental Science Research Experience or Bigelow Semester independent research, plus <span class="code">ES 401</span>/<span class="code">402</span> Colloquium across the year.' }
  ],
  rules: [
    '<b>One Environmental Studies major only</b> &mdash; policy, science and computation are mutually exclusive.',
    'You cannot hold both this and the chemistry: environmental science concentration.',
    'Four electives at 200+, one at 300 level, one with a lab, two of them <span class="code">ES</span> courses.',
    'Up to two courses may come from an approved semester-long off-campus program.',
    'The Bigelow Laboratory partnership gives a residential semester in marine science.'
  ],
  links: ['bio', 'chem', 'envpol', 'envcomp', 'earth', 'stat', 'chemenv', 'bioee', 'econ', 'englit']
},
{
  id: 'envcomp', name: 'Environmental Computation', short: 'Environmental Computation',
  div: 'sci', cluster: 'computing', kind: 'major', dept: 'Environmental Studies &amp; Computer Science',
  size: '13 courses in four blocks',
  blurb: 'Computational thinking pointed at coupled human and natural systems. The most front-loaded major on this map: the department wants four of the thirteen courses inside your first year.',
  path: [
    { when: 'Year 1', what: '<span class="code">ES 118</span> in spring; <span class="code">CS 151</span>, <span class="code">152</span> or <span class="code">153</span>, then <span class="code">CS 231</span> and <span class="code">CS 251</span> or <span class="code">252</span>. The department asks for all of this in year one.' },
    { when: 'Year 2', what: 'One 200-level <span class="code">ES</span> course, such as <span class="code">233</span>, <span class="code">234</span>, <span class="code">242</span>, <span class="code">244</span>, <span class="code">265</span>, <span class="code">271</span>, <span class="code">276</span> or <span class="code">283</span>; <span class="code">ES 212</span> or <span class="code">214</span> GIS; <span class="code">SC 212</span> or a four-credit calculus course numbered <span class="code">MA 160</span>+.' },
    { when: 'Year 3', what: '<span class="code">CS 321</span> Software Engineering plus one of <span class="code">CS 330</span>, <span class="code">341</span>, <span class="code">343</span>, <span class="code">346</span> or <span class="code">365</span>. Begin the five application courses.' },
    { when: 'Year 4', what: 'Finish the application block: one to two CS courses at 300+, three to four <span class="code">ES</span> courses giving depth in one area, one further maths or statistics course, then the culminating experience.' }
  ],
  rules: [
    '<b>Courses counted in one block cannot be counted in another.</b> A 200-level ES foundation course cannot also be an application course.',
    'One Environmental Studies major only, and one computing major only &mdash; this sits in both exclusion sets.',
    'An AP score of 4 or 5 exempts <span class="code">ES 118</span> and frees a slot.',
    'Recommended application groupings: conservation and resources, ecosystem ecology, energy and climate, environmental justice, public health, water resources.'
  ],
  links: ['cs', 'envsci', 'envpol', 'ds', 'stat', 'math']
},
{
  id: 'psy', name: 'Psychology', short: 'Psychology',
  div: 'sci', cluster: 'mind', kind: 'major', dept: 'Psychology',
  size: 'Around 9 courses',
  blurb: 'Taught as a collaborative search for new knowledge. Research design and statistical analysis come early and hard, because everything advanced in the major is built on them.',
  path: [
    { when: 'Year 1', what: '<span class="code">PS 111</span>.' },
    { when: 'Year 2', what: '<span class="code">PS 214</span> and <span class="code">PS 215</span>, the methods and statistics pair. <b>Take these in sophomore year</b> and on campus.' },
    { when: 'Year 3', what: 'Two courses from <span class="code">232</span>, <span class="code">233</span>, <span class="code">234</span>, <span class="code">236</span>, <span class="code">241</span>, <span class="code">242</span>, <span class="code">244</span>, <span class="code">272</span>, <span class="code">298</span>; two from <span class="code">120C</span>, <span class="code">219</span>, <span class="code">223</span>, <span class="code">230</span>, <span class="code">245</span>, <span class="code">251</span>, <span class="code">253</span>, <span class="code">254</span>, <span class="code">259</span>, <span class="code">297</span>; one 300-level seminar with its paired collaborative research course.' },
    { when: 'Year 4', what: '<span class="code">PS 420</span>, plus one further 300-level course. Honours is by departmental invitation near the end of junior year and runs as <span class="code">PS 483</span>/<span class="code">484</span>.' }
  ],
  rules: [
    '<b><span class="code">PS 214</span> and <span class="code">215</span> require a C&minus; minimum to continue in the major, and may not be repeated.</b>',
    'Both must be taken on campus, so junior-year study abroad means finishing them in sophomore year.',
    'At most two courses transfer in, and neither can be <span class="code">214</span> or <span class="code">215</span>.',
    'No more than four credits total from <span class="code">PS 416</span>, <span class="code">483</span>/<span class="code">484</span> and <span class="code">491</span>/<span class="code">492</span> in one semester.'
  ],
  links: ['psyneuro', 'comppsy', 'bio', 'bioneuro', 'stat', 'ds', 'soc', 'gov', 'ed', 'sts']
},
{
  id: 'psyneuro', name: 'Psychology: Neuroscience', short: 'Psych · Neuroscience',
  div: 'sci', cluster: 'mind', kind: 'major', dept: 'Psychology',
  size: 'The psychology core plus four biology courses',
  blurb: 'Neuroscience from the brain-and-behaviour side, the psychological counterpart to the biology concentration. Both exist; you can hold exactly one.',
  path: [
    { when: 'Year 1', what: '<span class="code">PS 111</span>; <span class="code">BI 163</span> and <span class="code">BI 164</span>.' },
    { when: 'Year 2', what: '<span class="code">PS 214</span> and <span class="code">215</span> on campus. Begin the three brain-and-behaviour courses, which must include <span class="code">PS 233</span> or <span class="code">244</span>.' },
    { when: 'Year 3', what: '<span class="code">BI 274</span> Neurobiology with lab, one further biology course from <span class="code">225</span>, <span class="code">276</span>, <span class="code">279</span>, <span class="code">332</span>, <span class="code">371J</span>, <span class="code">373</span>, <span class="code">374</span>, and one course from <span class="code">PS 352F</span>, <span class="code">363</span> or <span class="code">374</span>.' },
    { when: 'Year 4', what: '<span class="code">PS 420</span> and a 300-level seminar with its collaborative research pairing.' }
  ],
  rules: [
    '<b>Mutually exclusive with biology: neuroscience.</b>',
    'The <span class="code">PS 214</span>/<span class="code">215</span> C&minus; rule applies here too.'
  ],
  links: ['psy', 'bio', 'bioneuro']
},
{
  id: 'comppsy', name: 'Computational Psychology', short: 'Computational Psychology',
  div: 'sci', cluster: 'computing', kind: 'major', dept: 'Psychology &amp; Computer Science',
  size: 'Around 12 courses',
  blurb: 'Questions about human and animal behaviour answered with the tools of computer science. One of the five CS+X majors, and the only one anchored in a social-science department.',
  path: [
    { when: 'Year 1', what: '<span class="code">PS 111</span>; <span class="code">CS 151</span>, <span class="code">152</span> or <span class="code">153</span>.' },
    { when: 'Year 2', what: '<span class="code">PS 214</span> and <span class="code">215</span>; <span class="code">CS 231</span> and <span class="code">CS 251</span> or <span class="code">252</span>.' },
    { when: 'Year 3', what: 'Three more 200-level psychology courses including <span class="code">PS 244</span> or <span class="code">272</span>; one of <span class="code">CS 310</span>, <span class="code">330</span>, <span class="code">343</span> or <span class="code">346</span>; one of the paired sequences <span class="code">PS 345</span>/<span class="code">346</span>, <span class="code">PS 358</span>/<span class="code">359</span>, or <span class="code">PS 362</span>.' },
    { when: 'Year 4', what: 'One further 300- or 400-level CS course, plus either <span class="code">PS 416</span>, <span class="code">PS 483</span>/<span class="code">484</span> by invitation, <span class="code">CS 483</span>/<span class="code">484</span> by invitation, or a 400-level CS course.' }
  ],
  rules: [
    'One computing major only.',
    'The <span class="code">PS 214</span>/<span class="code">215</span> C&minus; rule and the on-campus rule both apply.'
  ],
  links: ['psy', 'cs', 'csai', 'ds', 'stat']
},

/* ============================= SOCIAL SCIENCES ============================= */

{
  id: 'econ', name: 'Economics', short: 'Economics',
  div: 'soc', cluster: 'econgov', kind: 'major', dept: 'Economics',
  size: '10 courses plus calculus',
  blurb: 'Mathematical modelling, data analysis and critical thinking applied to how decisions get made and resources allocated. The department names climate, discrimination, education, financial markets, game theory, health equity and monetary policy as its range.',
  path: [
    { when: 'Year 1', what: '<span class="code">EC 133</span> Microeconomics and <span class="code">MA 120</span> or higher. Both need a C&minus; before you can take <span class="code">EC 223</span>.' },
    { when: 'Year 2', what: '<span class="code">EC 134</span> Macroeconomics and <span class="code">EC 225</span>, the statistics course. C&minus; or better in each to stay in the major.' },
    { when: 'Year 3', what: '<span class="code">EC 223</span> and <span class="code">EC 224</span> intermediate theory, plus <span class="code">EC 325</span>, which is a prerequisite or co-requisite for every senior seminar.' },
    { when: 'Year 4', what: 'One economics senior seminar, taken at Colby, plus the remaining electives. Two of your three electives must be at the 300 level.' }
  ],
  rules: [
    '<b><span class="code">EC 133</span> and calculus at C&minus; or better, or you cannot enrol in <span class="code">EC 223</span>.</b>',
    'C&minus; minimum also in <span class="code">EC 134</span>, <span class="code">223</span>, <span class="code">224</span> and <span class="code">225</span>. An approved two-course methods sequence elsewhere, such as <span class="code">PS 214/215</span> or <span class="code">SC 212/321</span>, can replace <span class="code">EC 225</span>.',
    'Up to three courses at 200+ may come from off campus, and one of the four upper-level core courses may be taken elsewhere. <b>Senior seminars must be at Colby.</b>',
    'Graduate school in economics: the department names <span class="code">MA 253</span>, <span class="code">274</span>, <span class="code">311</span>, <span class="code">338</span> and <span class="code">CS 151</span>.',
    'The economics minor is not available after the Class of 2027.'
  ],
  links: ['econfin', 'math', 'stat', 'ds', 'envpol', 'gov', 'global', 'psy', 'soc', 'las', 'pubpol']
},
{
  id: 'econfin', name: 'Economics: Financial Markets', short: 'Econ · Financial Markets',
  div: 'soc', cluster: 'econgov', kind: 'major', dept: 'Economics',
  size: '11 courses plus calculus',
  blurb: 'The economics core with accounting, finance and a 300-level finance course written in, replacing two of the free electives.',
  path: [
    { when: 'Year 1', what: '<span class="code">EC 133</span> and <span class="code">MA 120</span> or higher.' },
    { when: 'Year 2', what: '<span class="code">EC 134</span>, <span class="code">EC 210</span> Accounting, <span class="code">EC 211</span> Finance, <span class="code">EC 225</span>.' },
    { when: 'Year 3', what: '<span class="code">EC 223</span>, <span class="code">224</span>, <span class="code">311</span>, and <span class="code">EC 325</span>.' },
    { when: 'Year 4', what: 'One economics senior seminar plus one further 300-level elective.' }
  ],
  rules: [
    '<b>Only one Economics Department major.</b> You cannot hold both economics and this.',
    '<span class="code">EC 133</span>, <span class="code">134</span> and <span class="code">210</span> can be taken off campus without counting toward the three-course transfer limit.'
  ],
  links: ['econ', 'math', 'stat', 'gov']
},
{
  id: 'gov', name: 'Government', short: 'Government',
  div: 'soc', cluster: 'econgov', kind: 'major', dept: 'Government',
  size: '10 courses',
  blurb: 'Politics defined as the contest for and exercise of power. The major is built so that graduates can conduct political science research systematically and say what the evidence supports.',
  path: [
    { when: 'Year 1', what: 'Begin the three required 100-level courses: <span class="code">GO 111</span>, <span class="code">131</span> and <span class="code">171</span>.' },
    { when: 'Year 2', what: 'Finish the 100-level courses and take one introductory comparative course from <span class="code">GO 252</span>, <span class="code">253</span>, <span class="code">255</span>, <span class="code">256</span> or <span class="code">259</span>, especially if you plan to go abroad. Do <span class="code">GO 281</span> Research Methods now or in junior year.' },
    { when: 'Year 3', what: '200- and 300-level electives. Fellowships are available for majors doing an internship or a significant research project.' },
    { when: 'Year 4', what: 'A 400-level senior seminar, capped at 12 students. Honours needs a 3.5 major GPA and runs as <span class="code">GO 483</span>/<span class="code">484</span> for eight credits.' }
  ],
  rules: [
    '<b>Every required course must be taken at Colby</b>, including the 100-level ones, methods, the comparative course and the seminar.',
    'The methods requirement can be met with <span class="code">PS 214</span> and <span class="code">215</span> or <span class="code">SO 271</span> &mdash; but those do not count toward the 10 courses.',
    'A 5 on the AP U.S. Government exam lets you substitute a 200- or 300-level American politics course for <span class="code">GO 111</span>.',
    'Independent studies do not count toward the ten. Only the required introductory courses count at the 100 level.',
    'At most two transferred courses count; up to five for transfer students, excluding the seminar.'
  ],
  links: ['econ', 'soc', 'psy', 'global', 'pubpol', 'envpol', 'las', 'aas', 'history', 'sts']
},
{
  id: 'soc', name: 'Sociology', short: 'Sociology',
  div: 'soc', cluster: 'society', kind: 'major', dept: 'Sociology',
  size: '12 courses',
  blurb: 'The scientific study of society: how social forces shape people, and how people transform society back. The largest course count of any social science major here, with two semesters of a shared seminar at its centre.',
  path: [
    { when: 'Year 1', what: '<span class="code">SO 131</span>.' },
    { when: 'Year 2', what: '<span class="code">SO 215</span> and <span class="code">SO 271</span> Introduction to Sociological Research Methods. <b>C&minus; minimum in both</b> to continue.' },
    { when: 'Year 3', what: 'One 300-level research methods course, plus electives. Five electives sit at 200+ and one at 300+.' },
    { when: 'Year 4', what: 'Two semesters of <span class="code">SO 345</span>.' }
  ],
  rules: [
    '<b>C&minus; minimum in <span class="code">SO 215</span> and <span class="code">SO 271</span>.</b> Preferably finish both in second year.',
    'A double major or minor in another social science with a causal-inference methods requirement can substitute that course for <span class="code">SO 271</span>.',
    'At most three courses from outside Colby Sociology count. Cross-listed courses do not count against that cap.',
    'Up to two approved electives may come from off-campus study, credited at the 200 level.'
  ],
  links: ['anth', 'gov', 'psy', 'pubpol', 'stat', 'econ', 'sts', 'wgss', 'aas', 'amst']
},
{
  id: 'anth', name: 'Anthropology', short: 'Anthropology',
  div: 'soc', cluster: 'society', kind: 'major', dept: 'Anthropology',
  size: '10 courses',
  blurb: 'Critique for the purpose of building knowledge. Training in anthropological theory and method, and in the discipline&rsquo;s engagement with social problems.',
  path: [
    { when: 'Year 1', what: '<span class="code">AY 112</span>, which satisfies both the social sciences (S) and diversity (I) all-College requirements. Later courses with 112 as a prerequisite do not carry those designations.' },
    { when: 'Year 2', what: 'Electives. At most one further 100-level anthropology course counts toward the major.' },
    { when: 'Year 3', what: '<span class="code">AY 313</span> and <span class="code">AY 333</span> Contemporary Theory, plus electives at the 300 or 400 level.' },
    { when: 'Year 4', what: 'One advanced 400-level seminar, <b>taken in the spring semester of senior year</b>.' }
  ],
  rules: [
    'The 400-level seminar is fixed to second-semester senior year, so plan study abroad around it.',
    'Six electives, at least two at the 300 or 400 level.',
    'See also the classical civilization&ndash;anthropology joint major, which uses <span class="code">AY 112</span>, <span class="code">313</span> and <span class="code">333</span> as its anthropology core.'
  ],
  links: ['soc', 'clcvay', 'global', 'las', 'aas', 'wgss', 'sts', 'gov']
},
{
  id: 'envpol', name: 'Environmental Policy', short: 'Environmental Policy',
  div: 'soc', cluster: 'society', kind: 'major', dept: 'Environmental Studies',
  size: 'Foundations, methods, four electives, capstone',
  blurb: 'The policy side of Colby&rsquo;s oldest interdisciplinary department. Economics and ecology are both compulsory, which is unusual for a policy degree and is the point of it.',
  path: [
    { when: 'Year 1', what: '<span class="code">ES 118</span> Environment and Society (or <span class="code">ES 120</span>) and <span class="code">EC 133</span> Microeconomics.' },
    { when: 'Year 2', what: '<span class="code">ES 233</span> Environmental Policy, <span class="code">ES 234</span> International Environmental Policy, <span class="code">EC 231</span> Environmental and Natural Resource Economics, and <span class="code">SC 212</span>.' },
    { when: 'Year 3', what: '<span class="code">ES 270</span> Applied Ecology or <span class="code">BI/ES 271</span> Ecology; one further environmental science course without the ecology prerequisite; <span class="code">ES 250</span> or another methods or GIS course. Build an elective theme with your advisor.' },
    { when: 'Year 4', what: '<span class="code">ES 493</span> Environmental Policy Practicum, plus <span class="code">ES 401</span>/<span class="code">402</span> Colloquium for one credit across the year.' }
  ],
  rules: [
    '<b>One Environmental Studies major only.</b>',
    'Four electives at 200+, at least one at the 300 level, up to two from off-campus study.',
    'AP credit can fulfil core requirements depending on exam performance and coverage.',
    'Suggested themes: conservation, climate adaptation, energy, environmental justice, ecosystems, public health, environmental humanities.'
  ],
  links: ['envsci', 'envcomp', 'econ', 'gov', 'stat', 'soc', 'pubpol', 'global', 'bioee']
},
{
  id: 'global', name: 'Global Studies', short: 'Global Studies',
  div: 'soc', cluster: 'world', kind: 'major', dept: 'Global Studies',
  size: 'Up to 12 courses plus language and a semester abroad',
  blurb: 'Transdisciplinary by construction: electives come from more than twenty departments. Revised in spring 2025, so which curriculum you follow depends on your class year.',
  path: [
    { when: 'Year 1', what: '<span class="code">GS 101</span> Introduction to Global Studies. Begin or continue a modern foreign language.' },
    { when: 'Year 2', what: '<span class="code">GS 276</span> Global History and the methods requirement, met by an approved methods course or a GS-approved W2 course. <b>You need a 2.7 GPA by the end of this year</b> to be eligible for foreign study.' },
    { when: 'Year 3', what: 'At least one semester abroad, required. Electives from the approved cross-College list: two must carry a GS designation, at least one at the 300 level, no more than two at the 100 level.' },
    { when: 'Year 4', what: 'A 400-level GS capstone seminar, or an approved honours thesis. Honours needs a 3.7 major GPA and a statement of intent by 1 May of junior year.' }
  ],
  rules: [
    '<b>Class of 2028 and beyond follow the new curriculum</b>; the Classes of 2026 and 2027 complete the old one, which uses a five-course core drawn from <span class="code">AY 112</span>, <span class="code">EC 133</span>/<span class="code">134</span>, <span class="code">GS 101</span>, <span class="code">GO 131</span> and <span class="code">HI 276</span>.',
    'Two courses beyond introductory level in a modern foreign language are required.',
    'For double majors, at most four courses may count toward both.',
    'Optional concentrations: regional, or thematic in international economic policy, human rights and social justice, international relations and foreign policy, development, or global health.',
    'Miss the 2.7 GPA and you cannot retain the major, because study abroad is a requirement.'
  ],
  links: ['gov', 'econ', 'anth', 'history', 'las', 'eal', 'french', 'spanish', 'german', 'russian', 'pubpol']
},
{
  id: 'ed', name: 'Educational Studies', short: 'Educational Studies',
  div: 'soc', cluster: 'ed', kind: 'major', dept: 'Education',
  size: '10 courses',
  blurb: 'Educational theory, research and practice read through a commitment to social justice: how cultural assumptions and institutional policy shape who gets educated and how.',
  path: [
    { when: 'Year 1', what: '<span class="code">ED 101</span>, previously numbered 201.' },
    { when: 'Year 2', what: 'One of <span class="code">ED 213</span>, <span class="code">215</span> or <span class="code">217</span>, plus electives.' },
    { when: 'Year 3', what: 'One practicum or internship, from <span class="code">ED 351</span>, <span class="code">333</span> or <span class="code">374</span>. Four education electives in total, at least two at the 300 or 400 level.' },
    { when: 'Year 4', what: 'A senior capstone such as <span class="code">ED 493</span>. Honours runs as <span class="code">ED 483</span>/<span class="code">484</span> and needs a 3.5 overall and 3.5 major GPA at the end of junior year.' }
  ],
  rules: [
    'One or two electives, no more, may come from related departments on the approved list.',
    'Extra practica count as electives, but only one of <span class="code">351</span>, <span class="code">333</span>, <span class="code">374</span> may do so.',
    'The honours thesis is expected to run 50 to 70 pages.'
  ],
  links: ['edcert', 'psy', 'soc', 'aas', 'amst', 'gov']
},
{
  id: 'edcert', name: 'Educational Studies: Professional Certification', short: 'Ed · Certification',
  div: 'soc', cluster: 'ed', kind: 'conc', dept: 'Education',
  size: '12 courses plus a second major',
  blurb: 'The teacher-licensure route, approved by the Maine State Board of Education, with reciprocity into 43 other states through the NASDTEC interstate contract.',
  path: [
    { when: 'Year 1', what: '<span class="code">ED 101</span>, and start the content-area major you will teach in.' },
    { when: 'Year 2', what: '<span class="code">ED 215</span>, plus education electives.' },
    { when: 'Year 3', what: '<span class="code">ED 331</span> and <span class="code">ED 374</span>, which counts as the practicum. <b>Apply to the program in spring of junior year</b> with at least a 3.0 in your content-area major.' },
    { when: 'Year 4', what: 'The student-teaching sequence, <span class="code">ED 433</span> with <span class="code">494A</span> and <span class="code">494B</span>. <b>Spring of senior year is full-time teaching, 7.30am to 3pm, Monday to Friday.</b>' }
  ],
  rules: [
    '<b>No other Colby course may conflict with the spring student-teaching day.</b> Plan your final semester around it.',
    'You must also complete a major in a certifiable content area: English, social studies, life science, physical science or mathematics for grades 6&ndash;12; world languages, art, music, theater and dance for K&ndash;12.',
    'A criminal background check, fingerprinting and a Maine Initial Teaching Standards portfolio are required, with fees.',
    'A ninth-semester option lets you return after graduation to student-teach; apply in spring of senior year.'
  ],
  links: ['ed', 'englit', 'math', 'bio', 'chem', 'physics', 'spanish', 'french', 'german', 'art', 'music', 'ptd', 'history', 'gov']
},
{
  id: 'sts', name: 'Science, Technology &amp; Society', short: 'Science, Technology &amp; Society',
  div: 'soc', cluster: 'sts', kind: 'major', dept: 'Science, Technology &amp; Society',
  size: '10 courses',
  blurb: 'Colby is nationally recognised in STS. The social, political, cultural and ethical dimensions of science, technology and medicine, with the related public policy questions attached.',
  path: [
    { when: 'Year 1', what: '<span class="code">ST 112</span> Introduction to STS, or <span class="code">ST 120</span> Writing the Future. Take it as soon as possible.' },
    { when: 'Year 2', what: 'The methods course: <span class="code">ST 236</span> Concepts and Methods, or <span class="code">ST 231</span> Oral History and Narrative Medicine. With the chair&rsquo;s permission, <span class="code">AM 293</span>, <span class="code">SO 271</span>, <span class="code">SC 212</span> or <span class="code">AY 313</span> can stand in.' },
    { when: 'Year 3', what: 'One 200-level-or-above natural or computer science course beyond the all-College N requirement; two Technoscience Ethics and Justice courses; three further electives.' },
    { when: 'Year 4', what: 'One more 300-level-or-above elective and <span class="code">ST 485</span> Senior Research Seminar. Honours runs as <span class="code">ST 483</span>/<span class="code">484</span>, outside the ten courses.' }
  ],
  rules: [
    '<b>The STS minor closed to new applications on 1 September 2025.</b> The major is unaffected.',
    'Courses not cross-listed ST must come from the department&rsquo;s approved list, kept on its website.',
    'At most two 100-level courses beyond <span class="code">ST 112</span> or <span class="code">120</span> count.',
    'Honours needs a 3.5 major GPA and 3.25 overall, and the thesis must earn A&minus; or higher. Typically a 50-page essay, or a shorter one with a documentary, installation or public program.'
  ],
  links: ['cs', 'csai', 'soc', 'anth', 'amst', 'envsci', 'phil', 'psy', 'gov']
},
{
  id: 'pubpol', name: 'Public Policy', short: 'Public Policy',
  div: 'soc', cluster: 'society', kind: 'minor', parent: null, dept: 'Sociology',
  size: '7 courses',
  blurb: 'Policy origins, ethics and consequences, intended and otherwise. Built around the Bram Public Policy Lab, so several courses put students in front of real practitioners.',
  path: [
    { when: 'Year 2', what: 'A methods course, one of <span class="code">EC 293</span>, <span class="code">GO 281</span>, <span class="code">PS 214</span>, <span class="code">SO 271</span> or <span class="code">SC 212</span>. This is the gate into the practicum.' },
    { when: 'Year 3', what: '<span class="code">SO 297</span> Introduction to Policy Analysis and <span class="code">SO 397</span> Practice of Policymaking, plus policy electives.' },
    { when: 'Year 4', what: '<span class="code">SO/GO 461</span> Policy Lab Practicum.' }
  ],
  rules: [
    '<b>Only one of your three electives may be in your own major department.</b>',
    'Electives must be pre-approved; a faculty committee reviews the list each spring.',
    'Up to two courses from abroad or another institution count toward the electives, approved in advance.'
  ],
  links: ['soc', 'gov', 'econ', 'envpol', 'global', 'amst', 'aas', 'anth']
},

/* =============================== HUMANITIES =============================== */

{
  id: 'englit', name: 'English: Literature Written in English', short: 'English',
  div: 'hum', cluster: 'letters', kind: 'major', dept: 'English',
  size: '11 courses',
  blurb: 'A reshaped canon read across genres, platforms and media, with global Anglophone literatures and ecological understanding written into the department&rsquo;s stated aims. Most courses are seminars with limited enrolment.',
  path: [
    { when: 'Year 1', what: '<span class="code">EN 200</span> and one other 200-level course, which may be an introductory creative writing workshop: <span class="code">EN 278</span>, <span class="code">279</span> or <span class="code">280</span>.' },
    { when: 'Year 2', what: '<span class="code">EN 271</span>. Start tracking the four distribution fields as you go: poetry (P), early literatures (E), diaspora and crossroads (D), comparative literatures and media (C).' },
    { when: 'Year 3', what: 'Five courses at the 300 or 400 level, excluding creative writing workshops, plus two electives which may include workshops, approved foreign-literature courses, theater and dance electives or selected cinema studies courses.' },
    { when: 'Year 4', what: '<span class="code">EN 493</span>, the senior seminar.' }
  ],
  rules: [
    '<b>Distribution: one P, two E, two D, two C</b> &mdash; and a single course may satisfy at most two of them.',
    'All cross-listed courses count only in the elective category.',
    'The creative writing minor is only open to students whose major is not English. English majors take the concentration instead.'
  ],
  links: ['encw', 'enle', 'crw', 'clen', 'clcven', 'aas', 'amst', 'wgss', 'cinema', 'ptd', 'edcert', 'phil']
},
{
  id: 'encw', name: 'English: Creative Writing', short: 'English · Creative Writing',
  div: 'hum', cluster: 'letters', kind: 'conc', dept: 'English',
  size: '12 courses',
  blurb: 'Fiction, creative nonfiction and poetry at introductory, intermediate and advanced levels, braided into the literature major rather than separated from it.',
  path: [
    { when: 'Year 1', what: '<span class="code">EN 200</span> and an introductory workshop: <span class="code">EN 278</span>, <span class="code">279</span>, <span class="code">280</span>, <span class="code">297</span> or <span class="code">298</span>. Declared majors and minors get first priority into 278&ndash;280.' },
    { when: 'Year 2', what: '<span class="code">EN 271</span> and a second workshop. Try a genre outside your main one; the department encourages it.' },
    { when: 'Year 3', what: 'Advanced workshops from <span class="code">EN 378</span>, <span class="code">379</span>, <span class="code">380</span>, <span class="code">382</span>, <span class="code">386</span>, alongside literature courses at the 300 and 400 level.' },
    { when: 'Year 4', what: '<span class="code">EN 493</span>, the senior seminar.' }
  ],
  rules: [
    '<b>Four workshops at the 200 level or above</b> out of the twelve courses.',
    'To finish in twelve, the 200-level requirement must be met with a workshop.',
    '<span class="code">TD 141</span> Beginning Playwriting can count as one workshop with advisor approval.'
  ],
  links: ['englit', 'crw', 'ptd', 'cinema']
},
{
  id: 'enle', name: 'English: Literature &amp; the Environment', short: 'English · Environment',
  div: 'hum', cluster: 'letters', kind: 'conc', dept: 'English',
  size: '12 courses',
  blurb: 'The environmental humanities concentration inside English, with a required environmental studies course that makes it one of the few humanities degrees reaching formally into the science division.',
  path: [
    { when: 'Year 1', what: '<span class="code">EN 200</span> and <span class="code">EN 283</span> Stories of Crisis and Resilience.' },
    { when: 'Year 2', what: '<span class="code">EN 271</span>. Begin the six literature courses; one may be at the 200 level, five must be at 300 or 400.' },
    { when: 'Year 3', what: '<span class="code">EN 357</span> Literature and the Environment, plus one environmental studies course. Up to two creative writing workshops count if the 300-level one carries the LE field designation.' },
    { when: 'Year 4', what: '<span class="code">EN 493</span>, the senior seminar.' }
  ],
  rules: [
    'The environmental humanities course list is maintained by the Environmental Humanities Initiative, not the English department.',
    '<span class="code">EN 283</span> and <span class="code">EN 357</span> both count toward the human-dimensions requirement of the environmental science major, if you go the other direction.'
  ],
  links: ['englit', 'envsci', 'envpol', 'amst']
},
{
  id: 'crw', name: 'Creative Writing', short: 'Creative Writing',
  div: 'hum', cluster: 'letters', kind: 'minor', parent: null, dept: 'English',
  size: '7 courses',
  blurb: 'For students committed to imaginative writing whose major is something else. Four workshops and three literature courses, chosen to push you into unfamiliar styles.',
  path: [
    { when: 'Year 1', what: 'An introductory workshop: <span class="code">EN 278</span>, <span class="code">279</span> or <span class="code">280</span>.' },
    { when: 'Year 2', what: 'A second workshop and the first of three literature courses.' },
    { when: 'Year 3', what: 'Advanced workshops from <span class="code">EN 378</span>, <span class="code">379</span>, <span class="code">380</span>, <span class="code">386</span>.' },
    { when: 'Year 4', what: 'Finish the four workshops and three literature courses.' }
  ],
  rules: [
    '<b>Only open to students whose declared major is not English.</b>',
    'January courses and courses from other institutions do not count.',
    '<span class="code">TD 141</span>, <span class="code">EN 297</span> and <span class="code">EN 298</span> may count as one workshop with advisor approval.'
  ],
  links: ['englit', 'encw', 'ptd']
},
{
  id: 'history', name: 'History', short: 'History',
  div: 'hum', cluster: 'area', kind: 'major', dept: 'History',
  size: '11 courses',
  blurb: 'History defamiliarises the present. The department teaches that current institutions and systems are still in the process of change, and gives students the tools to argue from fragmentary and contradictory evidence.',
  path: [
    { when: 'Year 1', what: '<span class="code">HI 276</span> Global History.' },
    { when: 'Year 2', what: 'Begin the field distribution. You need one course each in four of: African, Atlantic World, East Asian, European, Global, U.S., Latin American, Middle Eastern and Southeast Asian history.' },
    { when: 'Year 3', what: '<span class="code">HI 376</span> Doing History, plus two further 300-level courses. Two of your eleven courses overall must be in premodern history, as designated by the department.' },
    { when: 'Year 4', what: 'A 400-level research seminar.' }
  ],
  rules: [
    '<span class="code">HI 376</span> does not count toward the two-300-level-course requirement.',
    '<b>All majors submit an annual reflection form</b> on the year&rsquo;s courses.',
    'Check the premodern designations with your advisor rather than guessing from titles.'
  ],
  links: ['global', 'amst', 'aas', 'las', 'jewish', 'religion', 'eal', 'classics', 'german', 'russian', 'edcert', 'gov']
},
{
  id: 'phil', name: 'Philosophy', short: 'Philosophy',
  div: 'hum', cluster: 'thought', kind: 'major', dept: 'Philosophy',
  size: '10 courses',
  blurb: 'William James&rsquo;s line, quoted by the department: an attempt to think without arbitrariness or dogmatism about the fundamental issues. Historical depth, cosmopolitan breadth, multiple perspectives.',
  path: [
    { when: 'Year 1', what: '<span class="code">PL 151</span>.' },
    { when: 'Year 2', what: '<span class="code">PL 231</span> and <span class="code">PL 232</span>, the history-of-philosophy pair.' },
    { when: 'Year 3', what: 'Electives covering the three area requirements: Metaphysics and Epistemology (M&amp;E), Values (V) and Diversity (D). At least two of the six electives at the 300 level or above.' },
    { when: 'Year 4', what: 'At least one section of <span class="code">PL 422</span> Philosophical Encounters, which can be repeated for elective credit and can satisfy area requirements at the same time.' }
  ],
  rules: [
    'Only one 100-level course counts among the six electives.',
    'At most one elective from <span class="code">PL 483</span>/<span class="code">484</span> and one from <span class="code">PL 291</span>/<span class="code">292</span>/<span class="code">491</span>/<span class="code">492</span>.',
    'No course under three credits counts, and nothing satisfactory/unsatisfactory.',
    'The minor adds a fourth area, History of Philosophy (H), and asks for three of the four areas.'
  ],
  links: ['religion', 'classics', 'sts', 'englit', 'gov', 'wgss', 'aas']
},
{
  id: 'religion', name: 'Religious Studies', short: 'Religious Studies',
  div: 'hum', cluster: 'thought', kind: 'major', dept: 'Religious Studies',
  size: '9 courses',
  blurb: 'How individuals and communities conceptualise the transcendent, examined through three analytical frameworks that cut across every tradition the department teaches: Identity, Interpretation and Practice.',
  path: [
    { when: 'Year 1', what: '<span class="code">RE 128</span> Introduction to the Study of Religion, the core course.' },
    { when: 'Year 2', what: 'One 100-level course on an Eastern tradition and one on a Western tradition.' },
    { when: 'Year 3', what: 'Two designated courses in each of the three frameworks. A single course may count for a framework and for the survey or seminar requirement at once. At least two 300-level courses taught by department members; take one before senior year.' },
    { when: 'Year 4', what: '<span class="code">RE 470</span> Senior Capstone, across fall and spring at two credits each.' }
  ],
  rules: [
    'Framework designations are set by the instructor, so a Colby course counts toward one framework only.',
    'Off-campus study courses may be petitioned toward a framework requirement.',
    'The capstone runs both semesters, unless taken as part of the honours program.'
  ],
  links: ['jewish', 'phil', 'history', 'eal', 'aas', 'las', 'cinema']
},
{
  id: 'classics', name: 'Classics', short: 'Classics',
  div: 'hum', cluster: 'letters', kind: 'major', dept: 'Classics',
  size: '10 courses, at least six in language',
  blurb: 'Greek, Roman and Ancient Mediterranean civilisations approached through languages, literature, history, archaeology, philosophy, political science, religion and art. Majors can spend a semester in Greece or Italy.',
  path: [
    { when: 'Year 1', what: 'Begin Greek or Latin. You may concentrate in either, or combine both.' },
    { when: 'Year 2', what: 'Continue the language sequence toward the three courses numbered 200 or higher.' },
    { when: 'Year 3', what: 'Four additional courses offered by the department or approved by your Classics advisor. Consider the semester in Greece or Italy, or a summer field archaeology program.' },
    { when: 'Year 4', what: 'Complete the ten. Graduate school in classics normally means both languages, not one.' }
  ],
  rules: [
    '<b>Courses taken outside the department count only with prior approval</b> from the department advisor.',
    'Six of the ten courses must be in language, three of them numbered 200 or higher.',
    'The department also runs three joint majors, with English and with anthropology.'
  ],
  links: ['clcv', 'clen', 'clcven', 'clcvay', 'history', 'phil', 'religion', 'englit']
},
{
  id: 'clcv', name: 'Classical Civilization', short: 'Classical Civilization',
  div: 'hum', cluster: 'letters', kind: 'major', dept: 'Classics',
  size: '10 courses',
  blurb: 'The same territory without the language requirement: Greek and Roman literature in English, drama, myth, ancient history, archaeology, classical art, ancient science and ancient medicine.',
  path: [
    { when: 'Year 1', what: 'Any department course. No knowledge of Latin or Greek is required at any point.' },
    { when: 'Year 2', what: 'Build the ten with your Classics advisor.' },
    { when: 'Year 3', what: 'A semester in Greece or Italy is available on programs designed for American students.' },
    { when: 'Year 4', what: 'At least one course must be at the 300 level, offered by the department.' }
  ],
  rules: [
    'Courses outside the department need prior approval.',
    'Pairs into joint majors with English and with anthropology.'
  ],
  links: ['classics', 'clcven', 'clcvay', 'history', 'religion', 'art']
},
{
  id: 'clen', name: 'Classics&ndash;English', short: 'Classics&ndash;English',
  div: 'hum', cluster: 'letters', kind: 'joint', dept: 'Classics &amp; English',
  size: 'Six classics courses plus five English',
  blurb: 'One of three joint degrees Colby runs out of the Classics Department. Ancient languages on one side, the English major&rsquo;s spine on the other.',
  path: [
    { when: 'Year 1', what: '<span class="code">EN 200</span>, and begin Greek or Latin.' },
    { when: 'Year 2', what: '<span class="code">EN 271</span>, and continue the language toward three courses numbered 200 or higher.' },
    { when: 'Year 3', what: 'Two English courses at the 300 or 400 level, excluding workshops, plus the remaining classics courses.' },
    { when: 'Year 4', what: '<span class="code">EN 493</span> senior seminar, plus one English elective.' }
  ],
  rules: [
    'Six semester courses of Greek or Latin, approved by your Classics advisor, three numbered 200 or higher.',
    'English distribution still applies within the six: one poetry (P), one early literature (E), one diaspora and crossroads (D).'
  ],
  links: ['classics', 'englit', 'clcven']
},
{
  id: 'clcven', name: 'Classical Civilization&ndash;English', short: 'Class. Civ.&ndash;English',
  div: 'hum', cluster: 'letters', kind: 'joint', dept: 'Classics &amp; English',
  size: 'Six classics courses plus five English',
  blurb: 'The language-free version of the joint degree. Same English spine, classical civilisation in place of Greek and Latin.',
  path: [
    { when: 'Year 1', what: '<span class="code">EN 200</span> and a first classics course.' },
    { when: 'Year 2', what: '<span class="code">EN 271</span>, plus classics courses approved by your advisor.' },
    { when: 'Year 3', what: 'Two English courses at the 300 or 400 level, excluding workshops.' },
    { when: 'Year 4', what: '<span class="code">EN 493</span> senior seminar, plus one English elective.' }
  ],
  rules: [
    'The P, E and D distribution requirements apply within the six English courses.',
    'The elective may be a workshop, or literature at 200+ in a foreign language or translation, chosen with the English advisor.'
  ],
  links: ['clcv', 'englit', 'clen', 'classics']
},
{
  id: 'clcvay', name: 'Classical Civilization&ndash;Anthropology', short: 'Class. Civ.&ndash;Anthropology',
  div: 'hum', cluster: 'letters', kind: 'joint', dept: 'Classics &amp; Anthropology',
  size: 'Six classics courses plus six anthropology',
  blurb: 'The archaeology-facing joint degree, for students whose interests run from the classical world into contemporary anthropological theory.',
  path: [
    { when: 'Year 1', what: '<span class="code">AY 112</span> and a first classics course.' },
    { when: 'Year 2', what: 'Classics courses approved by your advisor; anthropology electives.' },
    { when: 'Year 3', what: '<span class="code">AY 313</span> and <span class="code">AY 333</span> Contemporary Theory.' },
    { when: 'Year 4', what: 'Three elective anthropology seminars chosen with the anthropology advisor, at least two at the 300 or 400 level.' }
  ],
  rules: [
    'Six semester classics courses, approved by the Classics Department advisor.',
    'The anthropology core here is the same <span class="code">112</span>/<span class="code">313</span>/<span class="code">333</span> spine as the full major.'
  ],
  links: ['clcv', 'anth', 'classics']
},
{
  id: 'art', name: 'Studio Art', short: 'Studio Art',
  div: 'hum', cluster: 'arts', kind: 'major', dept: 'Art',
  size: '10 courses including a year-long capstone',
  blurb: 'Painting, drawing, photography, printmaking, sculpture and digital media, taught on the premise that images are embedded in artistic, social, political and cultural contexts. Art history is required alongside the studio work.',
  path: [
    { when: 'Year 1', what: 'A 100-level studio course and a 100-level art history course. Note that <span class="code">AR 110</span> and <span class="code">AR 117</span> do not satisfy the art history requirement.' },
    { when: 'Year 2', what: 'Begin the four-course concentration in one area: digital media, painting, photography, printmaking or sculpture.' },
    { when: 'Year 3', what: 'Finish the concentration and two studio electives, plus a modern or contemporary art history course and one further art history course at 200+.' },
    { when: 'Year 4', what: '<span class="code">AR 401</span> and <span class="code">AR 402</span>, each taken alongside a studio course in your concentration area.' }
  ],
  rules: [
    '<b>Only one 100-level studio course counts</b> toward the major.',
    'At most three courses from off campus or outside the department, with departmental approval.',
    'C&minus; or better for a course to count. Distinction at a 3.5 major average.',
    'Double majors in studio art and art history may count at most four courses toward both.'
  ],
  links: ['arthist', 'ptd', 'cinema', 'edcert']
},
{
  id: 'arthist', name: 'Art History', short: 'Art History',
  div: 'hum', cluster: 'arts', kind: 'major', dept: 'Art',
  size: '10 courses',
  blurb: 'Visual experience translated into written and oral argument, with the Colby College Museum of Art as a working collection. Studio foundations are required, so art historians make things too.',
  path: [
    { when: 'Year 1', what: 'Two of the five 100/200-level historical breadth courses. <span class="code">AR 110</span> and <span class="code">AR 117</span> do not count.' },
    { when: 'Year 2', what: 'Finish the breadth requirement, with at least one course at each level, plus any 100- or 200-level studio course.' },
    { when: 'Year 3', what: 'Three courses at the 300 and 400 levels, at least one at each. <span class="code">AR 411</span> Theories and Methods.' },
    { when: 'Year 4', what: '<span class="code">AR 494</span>, taken in the fall of senior year.' }
  ],
  rules: [
    '<b>The capstone is fall-only.</b> Do not plan a fall semester abroad in senior year.',
    'Majors work with advisors to cover diverse historical, geographical and cultural content.',
    'At most three courses from off campus or outside the department.'
  ],
  links: ['art', 'clcv', 'cinema', 'history', 'eal', 'wgss']
},
{
  id: 'music', name: 'Music', short: 'Music',
  div: 'hum', cluster: 'arts', kind: 'major', dept: 'Music',
  size: 'Around 9 courses plus lessons and ensembles',
  blurb: 'Hundreds of students perform every semester. The department explicitly works across sound, art, media, culture and technology rather than treating music as a closed discipline.',
  path: [
    { when: 'Year 1', what: '<span class="code">MU 111</span> and <span class="code">MU 181</span> Music Theory I. <b>A placement exam is required before enrolling in any section of 181</b>, and a separate test-out exam exists if you already have theory.' },
    { when: 'Year 2', what: '<span class="code">MU 182</span>, plus <span class="code">MU 252</span> or <span class="code">262</span>. Begin two semesters of applied lessons on one instrument, for credit.' },
    { when: 'Year 3', what: 'Two music history courses from <span class="code">MU 241</span>, <span class="code">242</span>, <span class="code">341</span> or others approved by the department, plus electives. Two semesters of ensemble, for credit.' },
    { when: 'Year 4', what: '<span class="code">MU 493</span> or <span class="code">MU 494</span>. Three four-credit electives at 200+ in total; <span class="code">MU 153</span> can be one.' }
  ],
  rules: [
    'The theory placement exam cannot be failed; it routes you to section A or B.',
    'Opting out of <span class="code">MU 181</span> does not grant credit for it.',
    'Both semesters of applied lessons must be on the same instrument and taken for credit.',
    '<b>One Music Department major only</b> &mdash; music or music&ndash;interdisciplinary computation.',
    'The College does not subsidise lesson costs for minors.'
  ],
  links: ['musicic', 'ptd', 'cinema', 'aas', 'eal', 'edcert', 'arthist']
},
{
  id: 'musicic', name: 'Music&ndash;Interdisciplinary Computation', short: 'Music &amp; Computation',
  div: 'hum', cluster: 'arts', kind: 'major', dept: 'Music &amp; Computer Science',
  size: 'Around 12 courses across two departments',
  blurb: 'One of the five CS+X majors, and the one that reaches furthest across the map: a humanities degree sitting inside the computing exclusion set.',
  path: [
    { when: 'Year 1', what: '<span class="code">MU 111</span>, <span class="code">MU 181</span> and <span class="code">CS 151</span>.' },
    { when: 'Year 2', what: '<span class="code">MU 182</span>; <span class="code">CS 231</span> and <span class="code">CS 251</span> or <span class="code">252</span>. Two semesters of applied lessons on one instrument.' },
    { when: 'Year 3', what: '<span class="code">MU 282</span>; two courses from <span class="code">CS 351</span>, <span class="code">CS 365</span> or other approved 300/400-level courses; one music course at 200 or above.' },
    { when: 'Year 4', what: '<span class="code">MU 491</span> or <span class="code">492</span>, done in collaboration with computer science.' }
  ],
  rules: [
    '<b>One computing major only</b>, and <b>one Music Department major only</b>. This sits in both exclusion sets.',
    'Only <span class="code">CS 15X/16X</span>, <span class="code">231</span> and <span class="code">251/252</span> may double-count with a CS major or minor &mdash; which you cannot hold anyway.',
    'The retention point scale covers courses in both departments.'
  ],
  links: ['music', 'cs', 'ptdic', 'cinema']
},
{
  id: 'ptd', name: 'Performance, Theater &amp; Dance', short: 'Performance, Theater &amp; Dance',
  div: 'hum', cluster: 'arts', kind: 'major', dept: 'Performance, Theater &amp; Dance',
  size: '40 credit hours',
  blurb: 'Theater, dance, design, mixed-media performance and performance studies under one roof, guided by four stated values: collaboration, leadership, community reciprocity and justice. You design your own route through it.',
  path: [
    { when: 'Year 1', what: '<span class="code">TD 124</span> Performance, Politics, and Practice. Any 100-level TD course also unlocks <span class="code">TD 262</span>.' },
    { when: 'Year 2', what: '<span class="code">TD 262</span> Collaborative Company; the production requirement from <span class="code">TD 139</span>, <span class="code">245</span> or <span class="code">264</span> as production stage manager; the praxis requirement from <span class="code">TD 135</span>, <span class="code">247</span>, <span class="code">258</span>, <span class="code">281</span> or <span class="code">285</span>.' },
    { when: 'Year 3', what: '<span class="code">TD 393</span> Ways of Seeing, taken in the fall of junior or senior year. Write the Pathway Rationale that justifies your 20 credit hours of self-designed study.' },
    { when: 'Year 4', what: 'The senior capstone: Senior Scholars, an honours thesis, an independent study, or a declared engagement in a class or production.' }
  ],
  rules: [
    '<b>You write a Pathway Rationale</b> arguing how your route embodies the four departmental values. It is a graded part of the major.',
    'Up to 12 credit hours may be taken outside the department, with a written rationale and a faculty vote.',
    'At most four credits of one- and two-credit Dance Technique Labs and Performance Credits count.',
    'A 2.0 (C) minimum for course credit to count. <span class="code">TD 393</span> is the only course closed to non-majors.'
  ],
  links: ['ptdic', 'art', 'music', 'englit', 'crw', 'cinema', 'wgss', 'edcert']
},
{
  id: 'ptdic', name: 'Theater &amp; Dance&ndash;Interdisciplinary Computation', short: 'Theater &amp; Computation',
  div: 'hum', cluster: 'arts', kind: 'major', dept: 'Performance, Theater &amp; Dance and Computer Science',
  size: '11 courses, 44 credits, plus three productions',
  blurb: 'Computation applied to performance scenography and stage design. A sequenced design curriculum with exposure to dance, acting, choreography and directing alongside it.',
  path: [
    { when: 'Year 1', what: '<span class="code">TD 124</span> and <span class="code">CS 151</span>.' },
    { when: 'Year 2', what: '<span class="code">TD 135</span> Introduction to Design; <span class="code">CS 231</span> in the fall and <span class="code">CS 251</span> or <span class="code">252</span> in the spring.' },
    { when: 'Year 3', what: 'Remaining requirements in consultation with your advisors in both departments. Begin the three faculty-led production experiences.' },
    { when: 'Year 4', what: 'Complete the three productions: one in performance, one in stage management, and a third agreed with your major advisor.' }
  ],
  rules: [
    '<b>One computing major only.</b>',
    'The three faculty-led production experiences are additional to the eleven courses.'
  ],
  links: ['ptd', 'cs', 'musicic', 'art']
},
{
  id: 'cinema', name: 'Cinema Studies', short: 'Cinema Studies',
  div: 'hum', cluster: 'arts', kind: 'minor', parent: null, dept: 'Cinema Studies',
  size: '6 courses',
  blurb: 'Screens of every type. Aesthetic and theoretical foundations, global history, and the relationship between how an image was made and what it can mean. Draws courses from five language departments.',
  path: [
    { when: 'Year 1', what: '<span class="code">CI 142</span> Introduction to Cinema Studies, the only course in the minor allowed below the 200 level.' },
    { when: 'Year 2', what: '<span class="code">CI 251</span> or <span class="code">CI 252</span>.' },
    { when: 'Year 3', what: 'One non-U.S. cinema course, plus electives. The approved list runs through French, German, Russian, Spanish, Italian, East Asian and religious studies offerings.' },
    { when: 'Year 4', what: '<span class="code">CI 321</span>.' }
  ],
  rules: [
    'All courses must be four credits, or three if taken in Jan Plan.',
    '<b>At most two courses can count toward both cinema studies and another major or minor.</b>'
  ],
  links: ['englit', 'french', 'german', 'russian', 'spanish', 'italian', 'eal', 'music', 'art', 'religion', 'ptd']
},
{
  id: 'french', name: 'French Studies', short: 'French Studies',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'French &amp; Italian',
  size: '10 courses, or 9 plus one in English',
  blurb: 'Francophone cultures approached through art, film, history, literary texts, philosophy and theater. Majors may spend a semester or year in France, Canada or an African country.',
  path: [
    { when: 'Year 1', what: 'Enter at your placement level. The language sequence is <span class="code">FR 125</span>, <span class="code">126</span>, <span class="code">127</span>; students starting there then take nine more including <span class="code">128</span> or <span class="code">131</span>.' },
    { when: 'Year 2', what: 'Continue toward the 200-level courses. <b>All 200-level courses must be taken before senior year.</b>' },
    { when: 'Year 3', what: 'Study abroad is strongly encouraged. Courses taken after returning must be numbered 300 or higher. A semester brings in three courses toward the major, a year up to five.' },
    { when: 'Year 4', what: 'Complete the ten. One course conducted in English, in a department such as art, government or history, may count with advance approval.' }
  ],
  rules: [
    '<b>Majors must take at least one department course every semester</b> they are on campus. An independent study does not satisfy this.',
    'For the minor, one 200- or 300-level course must focus on a non-European Francophone country, from the Class of 2027.',
    'Colby in Dijon students may count <span class="code">FR 240D</span> toward the major or minor.',
    'Unless otherwise specified, all courses are conducted in French.'
  ],
  links: ['cinema', 'global', 'las', 'italian', 'edcert', 'aas']
},
{
  id: 'german', name: 'German Studies', short: 'German Studies',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'German &amp; Russian',
  size: '10 courses, six taught in German',
  blurb: 'Superior German as the basis for studying the literatures and cultures of the German-speaking world. Study-abroad options run through Berlin, Munich, Freiburg, T&uuml;bingen, Vienna and Salzburg.',
  path: [
    { when: 'Year 1', what: 'Enter at placement. The sequence is <span class="code">GM 125</span>, <span class="code">126</span>, <span class="code">127</span>; from there, eight more courses.' },
    { when: 'Year 2', what: 'Work through the six courses taught in German numbered above <span class="code">127</span>, which must include a 200-, a 300- and a 400-level course.' },
    { when: 'Year 3', what: 'Majors are encouraged to spend the entire junior year in a German-speaking country.' },
    { when: 'Year 4', what: 'Finish with the 400-level course. Additional courses may come from English, government, history, music or philosophy where they carry substantial German content.' }
  ],
  rules: [
    '<b>Once declared, majors take at least one German Program course every semester on campus until graduation.</b>',
    'The minor is six courses beginning with <span class="code">GM 126</span>, including a 200- and a 300-level course.',
    'Unless noted otherwise, all courses are taught in German.'
  ],
  links: ['russian', 'cinema', 'global', 'history', 'jewish', 'edcert']
},
{
  id: 'spanish', name: 'Spanish', short: 'Spanish',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'Spanish',
  size: '9 courses, or fewer entering from the sequence',
  blurb: 'Peninsular Spain, Latin America, the Global Hispanophone and U.S. Latinx literatures and cultures, read through the differentials of power that inform cross-cultural assumptions.',
  path: [
    { when: 'Year 1', what: 'The Online Spanish Placement Exam is <b>required of all incoming students with any prior Spanish</b>, including heritage speakers. Entry is at <span class="code">SP 125</span>/<span class="code">126</span>/<span class="code">127</span> or above.' },
    { when: 'Year 2', what: '<span class="code">SP 135</span> and <span class="code">SP 231</span>, or <span class="code">SP 131H</span>. Both at C or better if you intend to go abroad.' },
    { when: 'Year 3', what: 'Study abroad is strongly advised in the third year. Six electives in total, two in each of: culture and identity; gender and sex; health and environment.' },
    { when: 'Year 4', what: 'The senior seminar.' }
  ],
  rules: [
    '<b>A 2.7 GPA is required to retain the major and to be permitted to study abroad.</b>',
    '<span class="code">SP 135</span> and <span class="code">SP 231</span> or <span class="code">131H</span> at C or better are prerequisites for study abroad.',
    'All coursework abroad must be in Spanish, in university-level courses, not a language-acquisition program.',
    'A course may fulfil no more than one elective category, and <span class="code">SP 135</span> does not count as an elective.',
    'Majors must take one department course each semester.'
  ],
  links: ['las', 'cinema', 'global', 'edcert', 'aas']
},
{
  id: 'russian', name: 'Russian Language &amp; Culture', short: 'Russian',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'German &amp; Russian',
  size: '9 courses',
  blurb: 'Language and culture training alongside multidisciplinary courses taught in both Russian and English, covering Russia and the former Soviet republics.',
  path: [
    { when: 'Year 1', what: 'The introductory sequence, <span class="code">RU 125</span> through <span class="code">128</span>.' },
    { when: 'Year 2', what: 'Begin the seven courses numbered above <span class="code">RU 127</span>. One course each in 19th-century and 20th/21st-century Russian literature or film in English translation.' },
    { when: 'Year 3', what: 'Immersion study in a Russian-speaking country for at least a semester is strongly encouraged. Failing that, a summer program or a Jan Plan in a post-Soviet country.' },
    { when: 'Year 4', what: '<span class="code">RU 426</span> or <span class="code">RU 428</span>, plus two electives on Russia or the post-Soviet space, which may sit in other departments and be taught in English.' }
  ],
  rules: [
    'Students joining after first year may substitute courses in English translation, agreed with Russian faculty.',
    'The department recommends broadening through history and government courses.',
    'The minor is a separate, narrower program in Russian Language and Literature.'
  ],
  links: ['german', 'cinema', 'global', 'history']
},
{
  id: 'italian', name: 'Italian Studies', short: 'Italian Studies',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: null, dept: 'French &amp; Italian',
  size: '6 courses',
  blurb: 'Italian language and civilisation from the Middle Ages to the contemporary state. Minors are strongly encouraged to spend a semester in Italy.',
  path: [
    { when: 'Year 1', what: '<span class="code">IT 127</span>, then <span class="code">IT 128</span>. Take them consecutively, preferably before going abroad.' },
    { when: 'Year 2', what: '<span class="code">IT 141</span> and a 200-level course.' },
    { when: 'Year 3', what: 'A semester in Italy. Students planning fifth-semester Italian abroad should see the program director first.' },
    { when: 'Year 4', what: 'A 300-level course, plus one Italian literature or culture course that may sit outside the department and be taught in English.' }
  ],
  rules: [
    'Five of the six must be Italian Studies courses taken on campus.',
    'All courses are conducted in Italian unless otherwise noted.',
    'Courses outside the department need approval from the program director or department chair.'
  ],
  links: ['french', 'cinema', 'clcv']
},
{
  id: 'eal', name: 'East Asian Languages &amp; Cultures', short: 'East Asian Studies',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'East Asian Languages &amp; Cultures',
  size: '12 courses for the Class of 2030 and earlier',
  blurb: 'Both a humanistic and a social-scientific approach to East Asia, held together by serious language training. The department states plainly that in a world of AI chatbots, direct competence in these languages is what will matter.',
  path: [
    { when: 'Year 1', what: '<span class="code">EA 150</span>, the introductory comparative course, and begin Chinese or Japanese.' },
    { when: 'Year 2', what: 'Three language courses beyond the all-College requirement: normally <span class="code">128</span>, <span class="code">321</span>, and <span class="code">322</span> or a 400-level course, in your concentration language.' },
    { when: 'Year 3', what: '<b>At least one semester of study in the country of your language concentration is required.</b> Distribution: one 200-level art, religion, philosophy, literature or music course; one 200-level government, anthropology, economics, education, history or sociology course.' },
    { when: 'Year 4', what: '<span class="code">EA 493</span>, taken only in the fall semester of senior year. Plus one 300/400-level course and three further electives.' }
  ],
  rules: [
    '<b>The capstone is fall-only</b> in senior year.',
    'Students starting Chinese or Japanese at the 300 level or above take at least four language courses.',
    'The Class of 2027 and beyond may instead major in Chinese or in Japanese directly. The 12-course EALC major is available to the Class of 2030 and earlier; a 10-course version also exists.',
    'You may declare two majors in this department.',
    'Distinction requires a 3.5 major GPA and two extra language courses.'
  ],
  links: ['chinese', 'japanese', 'history', 'religion', 'global', 'cinema', 'arthist', 'music']
},
{
  id: 'chinese', name: 'Chinese', short: 'Chinese',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'East Asian Languages &amp; Cultures',
  size: 'Major from the Class of 2027; minor is 6 courses',
  blurb: 'A standalone Chinese language major, newly available. The minor remains open to the Class of 2030 and earlier for students with a substantial interest in the language and culture.',
  path: [
    { when: 'Year 1', what: 'Begin the language sequence.' },
    { when: 'Year 2', what: 'Continue to <span class="code">CN 126</span> and above. The minor counts five language courses at that level or higher.' },
    { when: 'Year 3', what: 'Study in a Chinese-speaking region.' },
    { when: 'Year 4', what: 'A 400-level Chinese course, or an approved course on Chinese literature or culture at 200+.' }
  ],
  rules: [
    '<b>The major requirements are not printed on the catalogue page</b> as of this reading &mdash; confirm the course list with the department directly.',
    'The minor is six courses: five in language at <span class="code">CN 126</span> or above, plus one 400-level course or an approved 200+ literature or culture course.',
    'Students in the Class of 2027 and beyond may choose this instead of the EALC major.'
  ],
  links: ['eal', 'japanese', 'global']
},
{
  id: 'japanese', name: 'Japanese', short: 'Japanese',
  div: 'hum', cluster: 'languages', kind: 'major', dept: 'East Asian Languages &amp; Cultures',
  size: 'Major from the Class of 2027; minor is 6 courses',
  blurb: 'A standalone Japanese language major, parallel to the Chinese one and equally new. The minor stays open to the Class of 2030 and earlier.',
  path: [
    { when: 'Year 1', what: 'Begin the language sequence.' },
    { when: 'Year 2', what: 'Continue to <span class="code">JA 126</span> and above.' },
    { when: 'Year 3', what: 'Study in Japan.' },
    { when: 'Year 4', what: 'A 400-level Japanese course, or an approved course on Japanese literature or culture at 200+.' }
  ],
  rules: [
    '<b>The major requirements are not printed on the catalogue page</b> as of this reading &mdash; confirm with the department.',
    'The minor is six courses: five in language at <span class="code">JA 126</span> or above, plus one 400-level or approved 200+ literature or culture course.'
  ],
  links: ['eal', 'chinese', 'cinema', 'global']
},
{
  id: 'amst', name: 'American Studies', short: 'American Studies',
  div: 'hum', cluster: 'area', kind: 'major', dept: 'American Studies',
  size: '11 courses',
  blurb: 'The stories America told about itself, from Manifest Destiny to capitalist competition as a model of social life, set against the narratives that were pushed to the margins. Cultural geography, environmental humanities, visual culture, race and Indigeneity, gender and sexuality, histories of science and surveillance.',
  path: [
    { when: 'Year 1', what: '<span class="code">AM 171</span> Introduction to American Studies, normally taken before the end of second year.' },
    { when: 'Year 2', what: '<span class="code">AM 293</span> Methods in American Studies. Name and describe your focus area with your advisor, and begin the online portfolio.' },
    { when: 'Year 3', what: '<span class="code">AM 393</span> Junior Seminar: Theories of Culture, plus electives. At least three at the 300 level or above.' },
    { when: 'Year 4', what: '<span class="code">AM 493</span>, the senior seminar.' }
  ],
  rules: [
    '<b>Every major develops a named focus area</b> with a written rationale, and keeps an online portfolio through the core courses.',
    'Electives must cover pre-20th century; the U.S. in global or transnational context; and praxis. One elective can satisfy more than one area.',
    'Two electives must be social-justice courses examining how inequities are produced, maintained or challenged.',
    'At most two electives from outside the department at the 100 level; at most three courses from off campus.'
  ],
  links: ['aas', 'englit', 'history', 'wgss', 'sts', 'envsci', 'soc', 'las', 'pubpol', 'enle']
},
{
  id: 'aas', name: 'African American Studies', short: 'African American Studies',
  div: 'hum', cluster: 'area', kind: 'major', dept: 'African American Studies',
  size: '11 courses',
  blurb: 'Cross-cultural and cross-temporal, built from courses across a dozen departments. The primary focus is the literature, history and culture of people of African descent in the United States and the Caribbean, connected outward to Africa and Latin America.',
  path: [
    { when: 'Year 1', what: '<span class="code">AA 125</span> Introduction to African American Culture.' },
    { when: 'Year 2', what: '<span class="code">HI 247</span>, and <span class="code">EN 343</span> or an equivalent.' },
    { when: 'Year 3', what: 'One course focused specifically on Africa; one on the Caribbean, African-derived cultures in Latin America, or the diaspora; one on art, music, theater, dance or other expressive culture.' },
    { when: 'Year 4', what: 'At least one 300- or 400-level seminar with department or affiliated faculty, with a substantial final paper or project. <span class="code">AM 493</span>, <span class="code">EN 413</span>, <span class="code">EN 493</span> and <span class="code">MU 493</span> can qualify with permission.' }
  ],
  rules: [
    'Four or more electives from the social sciences, humanities and related interdisciplinary programs; at least one at the 300 or 400 level.',
    'Courses not on the list may count with the advisor&rsquo;s permission where substantial relevance can be established.',
    '<b>Tell instructors in other departments that you are an AAS major</b> when seeking permission for major-restricted courses or prerequisite waivers.',
    'An independent major in Africana Studies is also possible, or one combining AAS with another department.'
  ],
  links: ['amst', 'englit', 'history', 'soc', 'gov', 'anth', 'music', 'religion', 'wgss', 'las', 'phil', 'pubpol']
},
{
  id: 'las', name: 'Latin American Studies', short: 'Latin American Studies',
  div: 'hum', cluster: 'area', kind: 'major', dept: 'Latin American Studies',
  size: '10 courses',
  blurb: 'Latin America and U.S. Latinx populations read across the humanities and social sciences, with the historical and contemporary inequalities that complicate both. The biannual Walker Symposium anchors the program.',
  path: [
    { when: 'Year 1', what: '<span class="code">LA 173</span> and <span class="code">LA 174</span>. Begin or continue Spanish.' },
    { when: 'Year 2', what: 'Complete or test out of <span class="code">SP 128</span>/<span class="code">SP 131H</span>, <span class="code">FR 128</span>, or petition to demonstrate proficiency in another non-English language of the Americas.' },
    { when: 'Year 3', what: 'Two humanities courses and four social science courses across at least three disciplines. A section of <span class="code">SP 135</span> or an equivalent cultural-analysis course. Study abroad is recommended but no longer required.' },
    { when: 'Year 4', what: 'One senior seminar or a major senior research project.' }
  ],
  rules: [
    'A comparative or thematic course with less than 50% Latin America focus can be petitioned in, if you write the final paper on a Latin American or Latinx topic.',
    'A year abroad brings in up to four courses, a semester up to two; four is the total cap including transfer credit.',
    'A 2.7 GPA is required for permission to study abroad; C&minus; or better for any course to count.',
    'Advanced Portuguese must come from an approved semester or intensive summer program abroad.'
  ],
  links: ['spanish', 'history', 'anth', 'gov', 'econ', 'global', 'aas', 'amst', 'french']
},
{
  id: 'wgss', name: 'Women&rsquo;s, Gender &amp; Sexuality Studies', short: 'Women&rsquo;s, Gender &amp; Sexuality Studies',
  div: 'hum', cluster: 'area', kind: 'major', dept: 'Women&rsquo;s, Gender &amp; Sexuality Studies',
  size: '12 courses',
  blurb: 'Feminist anti-racist scholarship: intersectional and transnational, with commitments to critical race and critical caste scholarship, queer theory and queer of colour critique, masculinity studies, Indigenous feminisms and transnational activisms.',
  path: [
    { when: 'Year 1', what: '<span class="code">WG 101</span> Introduction to Women&rsquo;s, Gender, and Sexuality Studies.' },
    { when: 'Year 2', what: 'Electives designated or cross-listed WGSS. The department adds new ones every semester.' },
    { when: 'Year 3', what: '<span class="code">WG 311</span> Feminist Theories and Methodologies. At least two of your nine electives must be at the 300 or 400 level.' },
    { when: 'Year 4', what: '<span class="code">WG 493</span>, the senior seminar.' }
  ],
  rules: [
    'You may petition the program director to count a non-listed course if most of your coursework is on WGSS topics.',
    'At most one semester of independent study (<span class="code">WG 491</span>/<span class="code">492</span>) or four credits of Senior Scholars work counts.',
    'Because the electives are drawn from across the College, this major pairs unusually cleanly with a second one.'
  ],
  links: ['englit', 'soc', 'anth', 'amst', 'aas', 'history', 'ptd', 'arthist', 'phil']
},
{
  id: 'jewish', name: 'Jewish Studies', short: 'Jewish Studies',
  div: 'hum', cluster: 'thought', kind: 'major', dept: 'Jewish Studies',
  size: '9 courses plus a one-credit lab',
  blurb: 'Experiences, expressions and conceptions of Jewishness, past and present. Three primary themes run through the curriculum: Ideas and Texts, Lived Jewishness, and Community Impact.',
  path: [
    { when: 'Year 1', what: '<span class="code">JS 181</span> and <span class="code">JS 182</span>.' },
    { when: 'Year 2', what: 'At least one semester of <span class="code">JS 123</span> Beit Midrash &mdash; Jewish Ideas Lab, a one-credit credit/no-credit course. It must be done before senior year.' },
    { when: 'Year 3', what: 'One course in each of the three themes, and at least two 300-level research seminars. A single course can count for a theme and a seminar at once.' },
    { when: 'Year 4', what: '<span class="code">JS 423</span> Capstone: Designing the Jewish Ideas Lab, across the whole senior year at two credits per term, credit/no-credit.' }
  ],
  rules: [
    '<b><span class="code">JS 123</span> must be taken before senior year.</b>',
    'Up to three approved off-campus courses and up to three Hebrew language courses count as electives.',
    'Two two-credit courses or independent studies equal one elective. The year-long capstone counts as one course.',
    'A 2.00 GPA across all requirements is needed to complete the major.'
  ],
  links: ['religion', 'history', 'german', 'phil']
},

/* ============ MINORS AND THE INDEPENDENT MAJOR ============
 * Every remaining program in the catalogue. Minors carry a `parent` so the
 * chart can tether them beside the major they sit inside. */

{
  id: 'min-cs', name: 'Computer Science', short: 'CS minor',
  div: 'sci', cluster: 'computing', kind: 'minor', parent: 'cs', dept: 'Computer Science',
  size: '5 courses plus a capstone experience',
  blurb: 'Built so students in other disciplines can apply computational thinking to their own field. The capstone is unusually flexible: a course, an independent study in your major department, or two 300-level courses.',
  path: [
    { when: 'Year 1', what: 'One computer science course numbered <span class="code">150</span> or above.' },
    { when: 'Year 2', what: '<span class="code">CS 231</span> Data Structures and Algorithms, and <span class="code">CS 251</span> or <span class="code">252</span>.' },
    { when: 'Year 3', what: 'One course numbered <span class="code">200</span> or above, then one numbered <span class="code">300</span> or above.' },
    { when: 'Year 4', what: 'The capstone: a course numbered <span class="code">400</span> or above, a four-credit independent study with a significant computing component in your major department, or two 300-level courses.' },
  ],
  rules: [
    '<b>The independent-study capstone route must be pre-approved</b> by a computer science advisor.',
    'Closed to anyone in a computing major, and cannot be combined with the data science minor.',
    'Nothing in the minor may be taken satisfactory/unsatisfactory.',
  ],
  links: ['cs', 'ds', 'stat']
},

{
  id: 'min-ds', name: 'Data Science', short: 'Data Science minor',
  div: 'sci', cluster: 'computing', kind: 'minor', parent: 'ds', dept: 'Computer Science, Mathematics &amp; Statistics',
  size: '7 courses',
  blurb: 'The data science major compressed to its analytical spine, without the self-proposed applied sequence.',
  path: [
    { when: 'Year 1', what: '<span class="code">CS 151</span>, <span class="code">152</span>, <span class="code">154</span> or <span class="code">166</span>; and <span class="code">MA 160</span> or <span class="code">165</span>.' },
    { when: 'Year 2', what: '<span class="code">CS 231</span>, and <span class="code">CS 251</span> or <span class="code">252</span>. Add <span class="code">SC 212</span>.' },
    { when: 'Year 3', what: '<span class="code">SC 321</span> Applied Regression Modeling.' },
    { when: 'Year 4', what: 'One of <span class="code">CS 341</span>, <span class="code">343</span>, <span class="code">346</span>, <span class="code">MA 253</span>, or a 300-level statistics course.' },
  ],
  rules: [
    'Excludes every computing major, and cannot be combined with the CS or statistics minor.',
    'Economics or psychology majors who finished their second methods course skip <span class="code">SC 212</span>.',
  ],
  links: ['ds', 'cs', 'stat', 'math']
},

{
  id: 'min-math', name: 'Mathematics', short: 'Math minor',
  div: 'sci', cluster: 'quant', kind: 'minor', parent: 'math', dept: 'Mathematics',
  size: '6 courses, all at C&minus; or better',
  blurb: 'Calculus and linear algebra, then enough range to reach one 300-level course.',
  path: [
    { when: 'Year 1', what: '<span class="code">MA 160</span> or <span class="code">165</span> Series and Multi-Variable Calculus.' },
    { when: 'Year 2', what: '<span class="code">MA 253</span> Linear Algebra.' },
    { when: 'Year 3', what: 'Three more three- or four-credit courses numbered <span class="code">120</span> or above, excluding <span class="code">MA 484</span>. <span class="code">SC 212</span> may be one of them.' },
    { when: 'Year 4', what: 'One mathematics course at the <span class="code">300</span> level or above, excluding <span class="code">MA 484</span>.' },
  ],
  rules: [
    '<b>Every requirement must be C&minus; or better.</b>',
    'Nothing may be taken satisfactory/unsatisfactory.',
  ],
  links: ['math', 'stat', 'ds']
},

{
  id: 'min-stat', name: 'Statistics', short: 'Statistics minor',
  div: 'sci', cluster: 'quant', kind: 'minor', parent: 'stat', dept: 'Statistics',
  size: '6 courses, all at C&minus; or better',
  blurb: 'Designed to bolt onto a major where data does real work. The methods substitution makes it unusually cheap for economics and psychology majors.',
  path: [
    { when: 'Year 1', what: '<span class="code">MA 122</span>, <span class="code">160</span> or <span class="code">165</span>.' },
    { when: 'Year 2', what: '<span class="code">MA 253</span> Linear Algebra and <span class="code">SC 212</span>.' },
    { when: 'Year 3', what: '<span class="code">SC 321</span> Applied Regression Modeling.' },
    { when: 'Year 4', what: 'Two more statistics courses numbered <span class="code">300</span> or above.' },
  ],
  rules: [
    '<b><span class="code">PS 214/215</span> or <span class="code">EC 293/393</span> can be substituted for <span class="code">SC 212</span>.</b>',
    'Closed to data science majors and to anyone minoring in data science or CS.',
  ],
  links: ['stat', 'math', 'ds', 'psy', 'econ']
},

{
  id: 'min-physics', name: 'Physics', short: 'Physics minor',
  div: 'sci', cluster: 'physical', kind: 'minor', parent: 'physics', dept: 'Physics &amp; Astronomy',
  size: '6 courses',
  blurb: 'The introductory and modern-physics sequence with its calculus support, and nothing else.',
  path: [
    { when: 'Year 1', what: '<span class="code">PH 141</span> Foundations of Mechanics (or <span class="code">143</span> Honors Physics) and <span class="code">PH 145</span> Electromagnetism and Optics.' },
    { when: 'Year 2', what: '<span class="code">MA 125</span> (or <span class="code">120</span>, <span class="code">130</span>, <span class="code">135</span>) and <span class="code">MA 160</span> or <span class="code">165</span>.' },
    { when: 'Year 3', what: '<span class="code">PH 241</span> Modern Physics I.' },
    { when: 'Year 4', what: '<span class="code">PH 242</span> Modern Physics II, or a 300-level or higher physics or astronomy course in its place.' },
  ],
  rules: [
    '<b>Cannot be combined with the astronomy minor.</b> Pick one.',
    'No requirement may be taken satisfactory/unsatisfactory.',
  ],
  links: ['physics', 'astro', 'math']
},

{
  id: 'min-chem', name: 'Chemistry', short: 'Chemistry minor',
  div: 'sci', cluster: 'physical', kind: 'minor', parent: 'chem', dept: 'Chemistry',
  size: '5&ndash;6 courses including a lab',
  blurb: 'General and organic chemistry plus a chosen pair from the upper curriculum. The strictest double-counting rule of any Colby minor.',
  path: [
    { when: 'Year 1', what: '<span class="code">CH 141</span> and <span class="code">142</span> (or <span class="code">147</span>, or <span class="code">121</span> and <span class="code">122</span>).' },
    { when: 'Year 2', what: '<span class="code">CH 241</span> Organic Chemistry.' },
    { when: 'Year 3', what: 'At least two courses from <span class="code">CH 261</span> or <span class="code">263</span>, <span class="code">341</span> or <span class="code">342</span>, <span class="code">362</span> or <span class="code">367</span>, and <span class="code">411</span>.' },
    { when: 'Year 4', what: 'One laboratory course from <span class="code">CH 321</span>, <span class="code">367L</span>, <span class="code">341L</span>, <span class="code">351</span>, <span class="code">413</span>, <span class="code">442</span>, <span class="code">452</span>.' },
  ],
  rules: [
    '<b>Courses used for this minor may not satisfy any other major or minor.</b> Biochemistry courses in particular cannot be double-counted.',
    'Consult chemistry faculty to pick a coherent grouping.',
  ],
  links: ['chem', 'bio', 'physics']
},

{
  id: 'min-earth', name: 'Earth Sciences', short: 'Earth Sci minor',
  div: 'sci', cluster: 'earthenv', kind: 'minor', parent: 'earth', dept: 'Earth Sciences',
  size: '5 courses',
  blurb: 'Tailored per student rather than fixed. Built for majors in other disciplines who want a working understanding of how the planet behaves.',
  path: [
    { when: 'Year 1', what: 'A 100-level laboratory course: <span class="code">EA 122</span>, <span class="code">123</span>, <span class="code">125</span>, <span class="code">127</span>, <span class="code">128</span> or <span class="code">129</span>.' },
    { when: 'Year 2', what: 'Begin the four upper courses, chosen with an Earth Sciences faculty member.' },
    { when: 'Year 3', what: 'Continue through courses numbered <span class="code">228</span> and above.' },
    { when: 'Year 4', what: 'Finish the four Earth sciences courses numbered <span class="code">228</span> and above.' },
  ],
  rules: [
    'The programme is <b>tailored individually</b> &mdash; elect courses in consultation with a department faculty member.',
  ],
  links: ['earth', 'chem', 'envsci']
},

{
  id: 'min-es', name: 'Environmental Studies', short: 'Env Studies minor',
  div: 'sci', cluster: 'earthenv', kind: 'minor', parent: 'envsci', dept: 'Environmental Studies',
  size: '5 courses',
  blurb: 'The most open door in the department: any major can take it, and the electives are yours to steer.',
  path: [
    { when: 'Year 1', what: '<span class="code">ES 118</span> Environment and Society, or <span class="code">ES 120</span>.' },
    { when: 'Year 2', what: 'Begin the four <span class="code">ES</span> courses at the 200&ndash;300 level.' },
    { when: 'Year 3', what: 'Continue. One environmentally focused course from another department or an approved study-abroad programme may be petitioned in.' },
    { when: 'Year 4', what: 'At least one of the four must be at the <span class="code">300</span> level.' },
  ],
  rules: [
    '<b>An AP score of 4 or 5 exempts <span class="code">ES 118</span> but does not reduce the course count</b> &mdash; you take an extra 200&ndash;300 level ES course instead.',
    'Open to majors in any discipline.',
  ],
  links: ['envsci', 'envpol', 'envcomp', 'min-marine']
},

{
  id: 'min-marine', name: 'Marine Science', short: 'Marine Science minor',
  div: 'sci', cluster: 'earthenv', kind: 'minor', parent: 'envsci', dept: 'Colby&ndash;Bigelow Partnership',
  size: '5 courses, in one of two tracks',
  blurb: 'Run through the Colby&ndash;Bigelow Laboratory partnership. Track 2 routes you through the Sea Change semester in residence at Bigelow; Track 1 keeps you on campus.',
  path: [
    { when: 'Year 1', what: 'Groundwork in chemistry, biology and calculus &mdash; the Sea Change semester needs one of each plus three lab sciences.' },
    { when: 'Year 2', what: 'Track 1 starts with <span class="code">ES 264</span>.' },
    { when: 'Year 3', what: 'Track 1: four courses from the marine list, among them <span class="code">BI 218</span>, <span class="code">BI 254</span>, <span class="code">ES 244</span>, <span class="code">CH 261</span>, <span class="code">ER 262</span>, <span class="code">ES 344</span>. Track 2: the Sea Change semester &mdash; <span class="code">ES 383</span>, <span class="code">BI 384</span>, <span class="code">CH 385</span> and <span class="code">ES 386</span>.' },
    { when: 'Year 4', what: 'Track 2 finishes with one further course from the marine list.' },
  ],
  rules: [
    '<b>At most two marine science courses may also count toward another major or minor.</b>',
    'Other off-campus marine semesters cannot substitute for these requirements.',
    'Sea Change needs a 3.0 GPA, three lab sciences, and a semester each of chemistry, biology and calculus; it is aimed at juniors.',
  ],
  links: ['envsci', 'bio', 'chem', 'earth', 'min-es']
},

{
  id: 'min-econ', name: 'Economics', short: 'Economics minor',
  div: 'soc', cluster: 'econgov', kind: 'minor', parent: 'econ', dept: 'Economics',
  size: '6 courses, in one of two tracks',
  blurb: 'Two tracks: one aimed at accounting and finance, one at policy. Being retired &mdash; the last cohort that can elect it is the Class of 2027.',
  path: [
    { when: 'Year 1', what: '<span class="code">EC 133</span> Microeconomics.' },
    { when: 'Year 2', what: '<span class="code">EC 134</span> Macroeconomics. Track 1 adds <span class="code">EC 210</span> Accounting and <span class="code">EC 211</span> Finance.' },
    { when: 'Year 3', what: 'Track 1: one elective numbered <span class="code">200</span> or above. Track 2: three electives numbered <span class="code">200</span> or above.' },
    { when: 'Year 4', what: 'The methods requirement: <span class="code">EC 225</span>, or <span class="code">SC 212</span>, or <span class="code">PS 214/215</span>, or <span class="code">SO 271</span>, or <span class="code">GO 281</span>.' },
  ],
  rules: [
    '<b>Not available after the Class of 2027.</b>',
    'Cannot be combined with either Economics Department major.',
    'Independent studies and <span class="code">EC 225</span> cannot fill the elective requirement.',
  ],
  links: ['econ', 'stat', 'soc', 'gov', 'psy']
},

{
  id: 'min-soc', name: 'Sociology', short: 'Sociology minor',
  div: 'soc', cluster: 'society', kind: 'minor', parent: 'soc', dept: 'Sociology',
  size: '7 courses',
  blurb: 'The major&rsquo;s methods spine kept intact, with the seminar sequence dropped.',
  path: [
    { when: 'Year 1', what: '<span class="code">SO 131</span>.' },
    { when: 'Year 2', what: '<span class="code">SO 215</span> and <span class="code">SO 271</span> Introduction to Sociological Research Methods. <b>C&minus; minimum in both.</b>' },
    { when: 'Year 3', what: 'Three electives at the <span class="code">200</span> level or higher.' },
    { when: 'Year 4', what: 'One elective at the <span class="code">300</span> level or higher.' },
  ],
  rules: [
    '<b>C&minus; minimum in <span class="code">SO 215</span> and <span class="code">SO 271</span></b> to continue in the minor.',
    'Another social science methods course can replace <span class="code">SO 271</span> if you add a 300-level methods course as an elective.',
    'At most two courses from outside Colby Sociology count; cross-listed courses are exempt from that cap.',
  ],
  links: ['soc', 'pubpol', 'anth', 'stat']
},

{
  id: 'min-anth', name: 'Anthropology', short: 'Anthropology minor',
  div: 'soc', cluster: 'society', kind: 'minor', parent: 'anth', dept: 'Anthropology',
  size: '6 courses',
  blurb: 'One gateway course and five of your choosing, two of them advanced.',
  path: [
    { when: 'Year 1', what: '<span class="code">AY 112</span>, which satisfies both the social sciences (S) and diversity (I) all-College requirements.' },
    { when: 'Year 2', what: 'Electives. At most one further 100-level anthropology course counts.' },
    { when: 'Year 3', what: 'Continue toward five additional courses.' },
    { when: 'Year 4', what: 'Two of the five must be at the <span class="code">300</span> or <span class="code">400</span> level.' },
  ],
  rules: [
    'Courses that take <span class="code">AY 112</span> as a prerequisite do not carry the S and I designations themselves.',
    'No courses for the minor may be taken satisfactory/unsatisfactory.',
  ],
  links: ['anth', 'soc', 'clcvay']
},

{
  id: 'min-ed', name: 'Education', short: 'Education minor',
  div: 'soc', cluster: 'ed', kind: 'minor', parent: 'ed', dept: 'Education',
  size: '7 courses',
  blurb: 'The educational studies major minus the capstone weight, with the practicum kept.',
  path: [
    { when: 'Year 1', what: '<span class="code">ED 101</span>, previously numbered 201.' },
    { when: 'Year 2', what: 'One of <span class="code">ED 213</span>, <span class="code">215</span> or <span class="code">217</span>.' },
    { when: 'Year 3', what: 'One practicum or internship &mdash; <span class="code">ED 351</span>, <span class="code">333</span> or <span class="code">374</span> &mdash; plus electives.' },
    { when: 'Year 4', what: '<span class="code">ED 493A</span> or <span class="code">493B</span>, plus three education electives in total.' },
  ],
  rules: [
    'Extra practica count as electives, but only one of <span class="code">351</span>, <span class="code">333</span>, <span class="code">374</span> may do so.',
  ],
  links: ['ed', 'min-cert', 'soc', 'psy']
},

{
  id: 'min-cert', name: 'Professional Certification', short: 'Certification minor',
  div: 'soc', cluster: 'ed', kind: 'minor', parent: 'ed', dept: 'Education',
  size: '7 courses plus a second major',
  blurb: 'The lighter of the two routes to a Maine teaching licence. You still student-teach full time in your final spring.',
  path: [
    { when: 'Year 1', what: '<span class="code">ED 101</span>, and start the content-area major you will teach.' },
    { when: 'Year 2', what: '<span class="code">ED 215</span>.' },
    { when: 'Year 3', what: '<span class="code">ED 331</span> and <span class="code">ED 374</span>. Apply to the programme in spring with a 3.0 in your content-area major.' },
    { when: 'Year 4', what: '<span class="code">ED 433</span> with <span class="code">494A</span> and <span class="code">494B</span>. <b>Spring is full-time teaching, 7.30am to 3pm, Monday to Friday.</b>' },
  ],
  rules: [
    '<b>No other Colby course may conflict with the spring student-teaching day.</b>',
    'You must also complete a major in a certifiable field: English, social studies, life science, physical science or mathematics for grades 6&ndash;12; world languages, art, music, theater and dance for K&ndash;12.',
    'Background check, fingerprinting and a Maine Initial Teaching Standards portfolio are required, with fees.',
  ],
  links: ['ed', 'edcert', 'min-ed', 'englit', 'math', 'bio', 'chem']
},

{
  id: 'min-sts', name: 'Science, Technology &amp; Society', short: 'STS minor',
  div: 'soc', cluster: 'sts', kind: 'minor', parent: 'sts', dept: 'Science, Technology &amp; Society',
  size: '7 courses',
  blurb: 'Closed to new applicants. Charted here because students who declared before September 2025 are still completing it.',
  path: [
    { when: 'Year 1', what: '<span class="code">ST 112</span> Introduction to STS.' },
    { when: 'Year 2', what: 'Begin the four ST or ST-approved electives, at any level.' },
    { when: 'Year 3', what: 'One additional elective at the <span class="code">300</span> level or above.' },
    { when: 'Year 4', what: '<span class="code">ST 485</span> Senior Seminar: Advanced Topics in STS.' },
  ],
  rules: [
    '<b>Applications closed on 1 September 2025.</b> The STS major is unaffected.',
    'Courses not cross-listed ST must come from the department&rsquo;s approved list.',
    'At most two courses taken abroad may count.',
  ],
  links: ['sts', 'cs', 'soc', 'anth']
},

{
  id: 'min-english', name: 'Literature Written in English', short: 'English minor',
  div: 'hum', cluster: 'letters', kind: 'minor', parent: 'englit', dept: 'English',
  size: '6 courses',
  blurb: 'The English major&rsquo;s spine at half length, senior seminar included. Distribution still applies, at one course per field instead of two.',
  path: [
    { when: 'Year 1', what: '<span class="code">EN 200</span>.' },
    { when: 'Year 2', what: '<span class="code">EN 271</span>.' },
    { when: 'Year 3', what: 'Two English courses at the <span class="code">300</span> or <span class="code">400</span> level, excluding creative writing workshops.' },
    { when: 'Year 4', what: '<span class="code">EN 493</span>, the senior seminar, plus one elective: a literature course, a workshop, or literature at 200+ in a foreign language or translation.' },
  ],
  rules: [
    '<b>Distribution: one poetry (P), one early literature (E), one diaspora and crossroads (D)</b> within the six.',
    'The creative writing minor is open only to students whose major is not English.',
  ],
  links: ['englit', 'crw', 'cinema']
},

{
  id: 'min-classics', name: 'Classics', short: 'Classics minor',
  div: 'hum', cluster: 'letters', kind: 'minor', parent: 'classics', dept: 'Classics',
  size: '6 courses',
  blurb: 'Language-first: five of the six are Greek, Latin, or a mix of both.',
  path: [
    { when: 'Year 1', what: 'Begin Greek or Latin.' },
    { when: 'Year 2', what: 'Continue the language sequence.' },
    { when: 'Year 3', what: 'Reach two courses in Ancient Greek or Latin numbered <span class="code">200</span> or higher.' },
    { when: 'Year 4', what: 'Additional courses chosen with your Classics Department advisor.' },
  ],
  rules: [
    'At least five of the six must be in Greek, Latin, or a combination.',
    'No requirement may be taken satisfactory/unsatisfactory.',
  ],
  links: ['classics', 'clcv', 'min-clcv']
},

{
  id: 'min-clcv', name: 'Classical Civilization', short: 'Class. Civ. minor',
  div: 'hum', cluster: 'letters', kind: 'minor', parent: 'clcv', dept: 'Classics',
  size: '6 courses',
  blurb: 'The ancient Mediterranean without the ancient languages.',
  path: [
    { when: 'Year 1', what: 'Any department course. No Greek or Latin required at any point.' },
    { when: 'Year 2', what: 'Continue, chosen with your Classics Department advisor.' },
    { when: 'Year 3', what: 'A semester in Greece or Italy is available.' },
    { when: 'Year 4', what: 'One of the six must be at the <span class="code">300</span> level, offered by the department.' },
  ],
  rules: [
    'Courses outside the department count only with prior approval.',
  ],
  links: ['clcv', 'classics', 'min-classics', 'arthist']
},

{
  id: 'min-phil', name: 'Philosophy', short: 'Philosophy minor',
  div: 'hum', cluster: 'thought', kind: 'minor', parent: 'phil', dept: 'Philosophy',
  size: '6 courses',
  blurb: 'Area-driven rather than sequence-driven: cover three of the department&rsquo;s four areas, one of them deeply.',
  path: [
    { when: 'Year 1', what: 'Begin with <span class="code">PL 151</span> or another 100-level course.' },
    { when: 'Year 2', what: 'Work toward three of the four areas: Metaphysics and Epistemology (M&amp;E), Values (V), Diversity (D), History of Philosophy (H).' },
    { when: 'Year 3', what: 'At least one course at or above the <span class="code">300</span> level.' },
    { when: 'Year 4', what: 'Finish the six.' },
  ],
  rules: [
    'No more than one 100-level course, although <span class="code">PL 151</span> and one other 100-level course may both count.',
    'Only one course from <span class="code">PL 291/292</span> and <span class="code">PL 491/492</span>.',
    'Nothing under three credits, and nothing satisfactory/unsatisfactory.',
  ],
  links: ['phil', 'religion', 'classics']
},

{
  id: 'min-religion', name: 'Religious Studies', short: 'Religious Studies minor',
  div: 'hum', cluster: 'thought', kind: 'minor', parent: 'religion', dept: 'Religious Studies',
  size: '6 courses',
  blurb: 'Same three analytical frameworks as the major &mdash; Identity, Interpretation, Practice &mdash; at one course each instead of two.',
  path: [
    { when: 'Year 1', what: '<span class="code">RE 128</span> Introduction to the Study of Religion.' },
    { when: 'Year 2', what: 'One 100-level course on an Eastern tradition and one on a Western tradition.' },
    { when: 'Year 3', what: 'One designated course in each of the three frameworks. A single course may count for a framework and the survey requirement at once.' },
    { when: 'Year 4', what: 'At least one <span class="code">300</span>-level course taught by a department member.' },
  ],
  rules: [
    'Framework designations are set by the instructor, so a Colby course counts toward one framework only.',
    'Off-campus study courses may be petitioned toward a framework.',
  ],
  links: ['religion', 'phil', 'jewish', 'min-jewish']
},

{
  id: 'min-jewish', name: 'Jewish Studies', short: 'Jewish Studies minor',
  div: 'hum', cluster: 'thought', kind: 'minor', parent: 'jewish', dept: 'Jewish Studies',
  size: '6 courses plus a one-credit lab',
  blurb: 'The major without the year-long capstone, but the Beit Midrash lab requirement stays.',
  path: [
    { when: 'Year 1', what: '<span class="code">JS 181</span> and <span class="code">JS 182</span>.' },
    { when: 'Year 2', what: 'At least one semester of <span class="code">JS 123</span> Beit Midrash &mdash; Jewish Ideas Lab, one credit, credit/no credit.' },
    { when: 'Year 3', what: 'At least one research seminar at the <span class="code">300</span> level.' },
    { when: 'Year 4', what: 'Finish the six.' },
  ],
  rules: [
    'Up to two approved off-campus courses and up to two Hebrew language courses count as electives.',
    'A 2.00 GPA across all requirements is needed to complete the minor.',
  ],
  links: ['jewish', 'religion', 'min-religion', 'history']
},

{
  id: 'min-art', name: 'Art', short: 'Art minor',
  div: 'hum', cluster: 'arts', kind: 'minor', parent: 'art', dept: 'Art',
  size: '7 courses',
  blurb: 'Deliberately mixed: studio and art history together, built around your own interests with a faculty advisor.',
  path: [
    { when: 'Year 1', what: 'A 100- or 200-level studio art course, and one 100-level art history course. Note <span class="code">AR 110</span> and <span class="code">AR 117</span> do not count.' },
    { when: 'Year 2', what: 'One art history course at the 200 or <span class="code">300</span> level.' },
    { when: 'Year 3', what: 'Begin the four additional graded courses in studio, art history, or both, at the <span class="code">200</span> level or above.' },
    { when: 'Year 4', what: 'Finish the seven.' },
  ],
  rules: [
    'C&minus; or better for a course to count.',
    'At most two courses off campus or outside the department.',
  ],
  links: ['art', 'arthist', 'cinema']
},

{
  id: 'min-music', name: 'Music', short: 'Music minor',
  div: 'hum', cluster: 'arts', kind: 'minor', parent: 'music', dept: 'Music',
  size: '6 courses plus lessons and an ensemble',
  blurb: 'The theory sequence, one history course, and real playing: two semesters of lessons on one instrument and a semester of ensemble.',
  path: [
    { when: 'Year 1', what: '<span class="code">MU 111</span> and <span class="code">MU 181</span> Music Theory I. A placement exam is required before any section of 181.' },
    { when: 'Year 2', what: '<span class="code">MU 182</span>, plus two semesters of applied lessons on the same instrument, for credit.' },
    { when: 'Year 3', what: 'One music history course from <span class="code">MU 241</span>, <span class="code">242</span>, <span class="code">252</span>, <span class="code">341</span>. One semester of ensemble, for credit.' },
    { when: 'Year 4', what: 'Two four-credit music courses at the <span class="code">200</span> level or higher. <span class="code">MU 153</span> may count as one.' },
  ],
  rules: [
    '<b>The College does not subsidise lesson costs for minors</b> &mdash; only for majors.',
    'Both semesters of lessons must be on the same instrument and taken for credit.',
  ],
  links: ['music', 'musicic', 'ptd', 'cinema']
},

{
  id: 'min-ptd', name: 'Performance, Theater &amp; Dance', short: 'PTD minor',
  div: 'hum', cluster: 'arts', kind: 'minor', parent: 'ptd', dept: 'Performance, Theater &amp; Dance',
  size: '24 credit hours',
  blurb: 'Like the major, you design and justify your own pathway &mdash; just a shorter one.',
  path: [
    { when: 'Year 1', what: '<span class="code">TD 124</span> Performance, Politics, and Practice.' },
    { when: 'Year 2', what: '<span class="code">TD 262</span> Collaborative Company.' },
    { when: 'Year 3', what: 'Begin the 16 credit hours of self-designed pathway, agreed with your minor advisor.' },
    { when: 'Year 4', what: 'Finish the pathway. <span class="code">TD 393</span> Ways of Seeing is encouraged but not required.' },
  ],
  rules: [
    'Up to four credit hours may be taken outside the department, with a written rationale and a faculty vote.',
    'At most four credits of one- and two-credit Dance Technique Labs and Performance Credits count.',
    'A 2.0 (C) minimum for course credit to count.',
  ],
  links: ['ptd', 'ptdic', 'music', 'crw']
},

{
  id: 'min-french', name: 'Francophone Studies', short: 'French minor',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: 'french', dept: 'French &amp; Italian',
  size: '6 courses',
  blurb: 'Built for students who want to keep going past the language requirement rather than stop at it.',
  path: [
    { when: 'Year 1', what: 'Enter at your placement level: the sequence is <span class="code">FR 125</span>, <span class="code">126</span>, <span class="code">127</span>.' },
    { when: 'Year 2', what: 'Students who came through the sequence take five more, including <span class="code">128</span> or <span class="code">131</span>.' },
    { when: 'Year 3', what: 'Up to two courses from study abroad in a French-speaking country may transfer in.' },
    { when: 'Year 4', what: '<b>One 200- or 300-level course must focus on a non-European Francophone country</b> (Class of 2027 onward).' },
  ],
  rules: [
    'An independent study cannot replace a course in the minor.',
    'Colby in Dijon students may count <span class="code">FR 240D</span> toward the minor.',
  ],
  links: ['french', 'cinema', 'las', 'italian']
},

{
  id: 'min-german', name: 'German', short: 'German minor',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: 'german', dept: 'German &amp; Russian',
  size: '6 courses',
  blurb: 'Six courses in the German Program, taught in German, starting one step above the entry course.',
  path: [
    { when: 'Year 1', what: 'Begin at <span class="code">GM 126</span> or above.' },
    { when: 'Year 2', what: 'Continue through the programme.' },
    { when: 'Year 3', what: 'A 200-level course. A semester in Berlin, Munich, Freiburg, T&uuml;bingen, Vienna or Salzburg fits here.' },
    { when: 'Year 4', what: 'A <span class="code">300</span>-level course.' },
  ],
  rules: [
    'Students entering at intermediate or advanced level should plan course selection with a German advisor.',
    'Unless noted otherwise, all courses are taught in German.',
  ],
  links: ['german', 'russian', 'cinema']
},

{
  id: 'min-russian', name: 'Russian Language &amp; Literature', short: 'Russian minor',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: 'russian', dept: 'German &amp; Russian',
  size: '7 courses',
  blurb: 'The full introductory language sequence, then culture in translation, then one course reading Russian texts in the original.',
  path: [
    { when: 'Year 1', what: '<span class="code">RU 125</span> and <span class="code">RU 126</span>.' },
    { when: 'Year 2', what: '<span class="code">RU 127</span> and <span class="code">RU 128</span>, completing the introductory sequence.' },
    { when: 'Year 3', what: 'Two culture courses in English translation: one 19th-century, one 20th&ndash;21st-century literature or film.' },
    { when: 'Year 4', what: 'One course reading Russian cultural texts in the original, from <span class="code">RU 325</span>, <span class="code">326</span>, <span class="code">425</span>, <span class="code">426</span>, <span class="code">428</span>.' },
  ],
  rules: [
    'Course substitutions may be made after documented consultation with Russian programme staff.',
    'Minors unable to study in a Russian-speaking country are urged toward a summer programme or a Jan Plan in a post-Soviet country.',
  ],
  links: ['russian', 'german', 'cinema', 'history']
},

{
  id: 'min-chinese', name: 'Chinese', short: 'Chinese minor',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: 'chinese', dept: 'East Asian Languages &amp; Cultures',
  size: '6 courses',
  blurb: 'Five language courses and one content course. Open to the Class of 2030 and earlier.',
  path: [
    { when: 'Year 1', what: 'Begin the language sequence.' },
    { when: 'Year 2', what: 'Continue to <span class="code">CN 126</span> and above.' },
    { when: 'Year 3', what: 'Keep building toward five language courses of at least three credits each at <span class="code">CN 126</span> or above.' },
    { when: 'Year 4', what: 'One 400-level Chinese course, or an approved course on Chinese literature or culture at <span class="code">200</span> or higher.' },
  ],
  rules: [
    'Available to the Class of 2030 and earlier; later classes may major in Chinese instead.',
    'A semester abroad counts up to three classes toward the minor.',
  ],
  links: ['chinese', 'eal', 'min-eal', 'min-japanese']
},

{
  id: 'min-japanese', name: 'Japanese', short: 'Japanese minor',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: 'japanese', dept: 'East Asian Languages &amp; Cultures',
  size: '6 courses',
  blurb: 'The mirror of the Chinese minor: five language courses and one content course.',
  path: [
    { when: 'Year 1', what: 'Begin the language sequence.' },
    { when: 'Year 2', what: 'Continue to <span class="code">JA 126</span> and above.' },
    { when: 'Year 3', what: 'Keep building toward five language courses of at least three credits each at <span class="code">JA 126</span> or above.' },
    { when: 'Year 4', what: 'One 400-level Japanese course, or an approved course on Japanese literature or culture at <span class="code">200</span> or higher.' },
  ],
  rules: [
    'Available to the Class of 2030 and earlier; later classes may major in Japanese instead.',
    'A semester abroad counts up to three classes toward the minor.',
  ],
  links: ['japanese', 'eal', 'min-eal', 'min-chinese']
},

{
  id: 'min-eal', name: 'East Asian Languages &amp; Cultures', short: 'East Asian minor',
  div: 'hum', cluster: 'languages', kind: 'minor', parent: 'eal', dept: 'East Asian Languages &amp; Cultures',
  size: '6 courses',
  blurb: 'The comparative route: one language pair plus three content courses drawn from across the College.',
  path: [
    { when: 'Year 1', what: '<span class="code">EA 150</span>, the introductory comparative course.' },
    { when: 'Year 2', what: 'Two language courses at or above the <span class="code">126</span> level, in Chinese or Japanese.' },
    { when: 'Year 3', what: 'Two non-language courses, one at the 200 level and one at or above it, from anthropology, art, economics, government, history, literature, music, philosophy or religious studies on East Asia.' },
    { when: 'Year 4', what: 'A third non-language course at the <span class="code">300</span> level or above.' },
  ],
  rules: [
    '<b>Apart from the introductory comparative course, no 100-level content course counts.</b>',
    'A semester abroad counts up to three classes toward the minor.',
    'A shorter six-course version applies to later classes; confirm which one you are on with the department.',
  ],
  links: ['eal', 'chinese', 'japanese', 'history', 'religion']
},

{
  id: 'min-amst', name: 'American Studies', short: 'American Studies minor',
  div: 'hum', cluster: 'area', kind: 'minor', parent: 'amst', dept: 'American Studies',
  size: '7 courses',
  blurb: 'The major&rsquo;s gateway and one of its two methods courses, then five electives with the social-justice requirement intact.',
  path: [
    { when: 'Year 1', what: '<span class="code">AM 171</span> Introduction to American Studies.' },
    { when: 'Year 2', what: 'Either <span class="code">AM 293</span> Methods or <span class="code">AM 393</span> Junior Seminar.' },
    { when: 'Year 3', what: 'Begin the five electives from the department&rsquo;s approved list.' },
    { when: 'Year 4', what: 'At least one elective at the <span class="code">300</span> level or above.' },
  ],
  rules: [
    '<b>Two electives must be social-justice courses</b> examining how inequities are produced, maintained or challenged.',
    'At most two electives outside the department at the 100 level; at most two courses off campus.',
  ],
  links: ['amst', 'aas', 'min-aas', 'englit', 'history']
},

{
  id: 'min-aas', name: 'African American Studies', short: 'AAS minor',
  div: 'hum', cluster: 'area', kind: 'minor', parent: 'aas', dept: 'African American Studies',
  size: '7 courses',
  blurb: 'Built almost entirely from other departments&rsquo; courses, like the major, with four fixed anchors.',
  path: [
    { when: 'Year 1', what: '<span class="code">AA 125</span> Introduction to African American Culture.' },
    { when: 'Year 2', what: '<span class="code">AM 275</span> or an equivalent, and <span class="code">HI 247</span>.' },
    { when: 'Year 3', what: '<span class="code">EN 343</span> or an equivalent, plus at least one course focused on Africa or the Caribbean.' },
    { when: 'Year 4', what: 'Two courses from <span class="code">AM 493</span>, <span class="code">AY 231</span>, <span class="code">EN 343</span>, <span class="code">346</span>, <span class="code">413</span>, <span class="code">GO 255</span>, <span class="code">336</span>, <span class="code">455</span>, <span class="code">PL 213</span>, <span class="code">SO 252</span>.' },
  ],
  rules: [
    '<b>Tell instructors in other departments that you are an AAS minor</b> when seeking permission for major-restricted courses.',
    'Substitutions may be made in consultation with the department advisor and chair.',
  ],
  links: ['aas', 'amst', 'min-amst', 'englit', 'history', 'gov', 'soc']
},

{
  id: 'min-las', name: 'Latin American Studies', short: 'LAS minor',
  div: 'hum', cluster: 'area', kind: 'minor', parent: 'las', dept: 'Latin American Studies',
  size: '6 courses plus a language requirement',
  blurb: 'Six cross-listed courses spanning humanities and social sciences, on top of proven language proficiency.',
  path: [
    { when: 'Year 1', what: 'Either <span class="code">LA 173</span> or <span class="code">LA 174</span>.' },
    { when: 'Year 2', what: 'Complete or test out of <span class="code">SP 128</span> / <span class="code">SP 131H</span>, <span class="code">FR 128</span>, or petition to show proficiency in another language of the Americas.' },
    { when: 'Year 3', what: 'At least one humanities course and at least one non-history social science course.' },
    { when: 'Year 4', what: 'Three additional cross-listed courses.' },
  ],
  rules: [
    'C&minus; or better for a course to count; nothing satisfactory/unsatisfactory.',
    'Up to two courses from off-campus study count toward the minor.',
  ],
  links: ['las', 'spanish', 'history', 'anth', 'min-french']
},

{
  id: 'min-wgss', name: 'Women&rsquo;s, Gender &amp; Sexuality Studies', short: 'WGSS minor',
  div: 'hum', cluster: 'area', kind: 'minor', parent: 'wgss', dept: 'Women&rsquo;s, Gender &amp; Sexuality Studies',
  size: '6 courses',
  blurb: 'The major&rsquo;s three core courses kept in full, with three electives instead of nine.',
  path: [
    { when: 'Year 1', what: '<span class="code">WG 101</span> Introduction to Women&rsquo;s, Gender, and Sexuality Studies.' },
    { when: 'Year 2', what: 'Begin the three electives, designated or cross-listed WGSS.' },
    { when: 'Year 3', what: '<span class="code">WG 311</span> Feminist Theories and Methodologies. At least two electives must be at the <span class="code">300</span> or <span class="code">400</span> level.' },
    { when: 'Year 4', what: '<span class="code">WG 493</span>, the senior seminar.' },
  ],
  rules: [
    'At most one semester of independent study (<span class="code">WG 491</span> or <span class="code">492</span>) counts.',
    'Because the electives come from across the College, this pairs unusually cleanly with a major.',
  ],
  links: ['wgss', 'englit', 'soc', 'anth', 'amst']
},

{
  id: 'indep', name: 'Independent Major', short: 'Independent Major',
  div: 'soc', cluster: 'world', kind: 'major', dept: 'Independent Major Committee',
  size: 'One third or more of the 128 credits, designed by you',
  blurb: 'For students whose academic interests do not match an existing major. You design the course of study and defend it in a written proposal. It belongs to no division &mdash; it is charted at the crossroads because that is where it lives.',
  path: [
    { when: 'Year 1', what: 'Take the courses that make you want this. The proposal has to argue from something real.' },
    { when: 'Year 2', what: 'Recruit one or two advisors who will carry responsibility for the program throughout. <b>An interdisciplinary major needs two, from different departments.</b>' },
    { when: 'Year 3', what: 'Submit the detailed written proposal. Target dates are <b>15 October</b> for the fall semester and <b>15 March</b> for the spring. Approval must be in hand by the end of your sixth semester.' },
    { when: 'Year 4', what: 'Complete the approved program and its culminating work, keeping the committee informed of any change.' },
  ],
  rules: [
    '<b>The program must total one third or more of the credit hours required for graduation</b> &mdash; roughly 43 of the 128 &mdash; balanced across lower- and upper-level courses.',
    '<b>Written approval must be obtained by the end of your sixth semester.</b> Miss that and the route closes.',
    'Substantial changes to an approved program must go back to the committee.',
    'African American Studies names Africana Studies as a worked example, combining the Caribbean, the Americas and Africa.',
  ],
  links: ['aas', 'amst', 'global', 'sts', 'wgss']
}

];
