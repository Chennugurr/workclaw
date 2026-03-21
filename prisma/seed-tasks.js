const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Workclaw RLHF task projects...\n');

  // ─── Create Workclaw organization ──────────────────────────────────────────
  let org = await prisma.organization.findFirst({ where: { name: 'Workclaw' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Workclaw',
        type: 'TECHNOLOGY',
        teamSize: 'ONE_TO_TEN',
        bio: 'Workclaw internal RLHF data collection — building open preference datasets for the AI community.',
        website: 'https://workclaw.com',
      },
    });
    console.log(`Created organization: ${org.name} (${org.id})`);
  } else {
    console.log(`Organization already exists: ${org.name} (${org.id})`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT 1: Pairwise Response Comparison
  // ═══════════════════════════════════════════════════════════════════════════
  const pairwiseProject = await prisma.project.create({
    data: {
      orgId: org.id,
      title: 'LLM Response Preference Ranking',
      slug: 'llm-response-preference-ranking',
      description:
        'Compare two AI-generated responses to the same prompt and select which one is better. Your judgments help train language models to produce more helpful, accurate, and well-structured responses. Each task shows a user prompt and two model outputs — pick the one you would prefer as a real user.',
      taskType: 'PAIRWISE_COMPARISON',
      domain: ['AI Training', 'RLHF', 'NLP'],
      chainTags: [],
      payModel: 'PER_TASK',
      rateAmount: 0.15,
      difficulty: 'BEGINNER',
      qualityThreshold: 0.75,
      capacity: 50,
      taskVolume: 500,
      goldTaskRatio: 0.1,
      status: 'OPEN',
      visibility: 'PUBLIC',
      requiredTier: 'NEW',
      regionLimits: [],
      languageLimits: ['English'],
      reviewPolicy:
        'Choose the response that is more helpful, accurate, and well-written. Consider: correctness, completeness, clarity, and whether it actually answers the question. If both are equally good or bad, select Tie.',
    },
  });
  console.log(`Created project: ${pairwiseProject.title}`);

  // Pairwise tasks — real prompt/response pairs covering diverse topics
  const pairwiseTasks = [
    {
      data: {
        prompt: 'Explain the difference between a compiled language and an interpreted language. Give examples of each.',
        responseA:
          'A compiled language is one where the source code is translated into machine code by a compiler before execution. This means the entire program is converted at once, producing an executable file that runs directly on the hardware. Examples include C, C++, Rust, and Go.\n\nAn interpreted language is one where the source code is executed line-by-line by an interpreter at runtime, without a separate compilation step. Examples include Python, Ruby, and JavaScript (though modern JS engines use JIT compilation).\n\nKey differences:\n- **Performance**: Compiled languages are generally faster since the code is already in machine language\n- **Development cycle**: Interpreted languages allow faster iteration since you skip the compile step\n- **Error detection**: Compilers catch many errors before runtime; interpreters find errors only when that line executes\n- **Portability**: Interpreted languages are often more portable since the interpreter handles platform differences',
        responseB:
          'Compiled languages are languages that get compiled. Interpreted languages are interpreted. For example, C is compiled and Python is interpreted. Java is kind of both because it compiles to bytecode. Basically compiled is faster and interpreted is slower but easier to use.',
        criteria: 'Choose the response that better explains the concept with accuracy, depth, and useful examples.',
        dimensions: ['Accuracy', 'Completeness', 'Clarity'],
      },
      instructions: 'Read both responses carefully. Consider which one would be more helpful to someone genuinely trying to understand the difference.',
      isGold: true,
      goldAnswer: { preferred: 'A', dimensions: { Accuracy: 'A', Completeness: 'A', Clarity: 'A' } },
    },
    {
      data: {
        prompt: 'What are the health benefits of intermittent fasting?',
        responseA:
          'Intermittent fasting (IF) has several researched health benefits:\n\n1. **Weight loss**: By restricting eating windows, people often consume fewer calories. IF also increases norepinephrine levels, which can boost metabolism by 3.6-14%.\n\n2. **Insulin sensitivity**: IF can reduce fasting insulin levels by 20-31%, which may lower the risk of type 2 diabetes.\n\n3. **Cellular repair**: Fasting triggers autophagy, where cells remove dysfunctional proteins. This process may reduce the risk of certain diseases including cancer.\n\n4. **Heart health**: IF may improve blood pressure, cholesterol levels, triglycerides, and inflammatory markers.\n\n5. **Brain health**: IF increases the brain hormone BDNF and may aid the growth of new nerve cells.\n\nHowever, IF isn\'t suitable for everyone — pregnant women, people with eating disorders, or those on certain medications should consult a doctor first.',
        responseB:
          'Intermittent fasting has many benefits. It helps you lose weight because you eat less food during the day. It\'s also good for your body because it gives your digestive system a rest. Many people feel more energetic when they fast. Some studies show it can help with inflammation and blood sugar. You should try the 16:8 method where you fast for 16 hours and eat during an 8-hour window. It\'s really easy to start — just skip breakfast!',
        criteria: 'Which response provides more accurate, well-sourced health information while being responsible?',
        dimensions: ['Accuracy', 'Completeness', 'Responsibility'],
      },
      instructions: 'Evaluate which response is more informative, scientifically grounded, and responsible in its health claims.',
    },
    {
      data: {
        prompt: 'Write a Python function that checks if a string is a valid palindrome, considering only alphanumeric characters and ignoring case.',
        responseA:
          '```python\ndef is_palindrome(s: str) -> bool:\n    cleaned = \'\'.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n```\n\nThis function:\n1. Filters out non-alphanumeric characters using `isalnum()`\n2. Converts to lowercase for case-insensitive comparison\n3. Checks if the cleaned string equals its reverse\n\nExamples:\n```python\nis_palindrome("A man, a plan, a canal: Panama")  # True\nis_palindrome("race a car")  # False\nis_palindrome("")  # True (empty string is a palindrome)\n```\n\nTime complexity: O(n), Space complexity: O(n) where n is the length of the string.',
        responseB:
          '```python\ndef is_palindrome(s):\n    s = s.lower()\n    left = 0\n    right = len(s) - 1\n    while left < right:\n        while left < right and not s[left].isalnum():\n            left += 1\n        while left < right and not s[right].isalnum():\n            right -= 1\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right -= 1\n    return True\n```\n\nThis uses the two-pointer technique — it moves inward from both ends, skipping non-alphanumeric characters. It\'s O(n) time and O(1) space since it doesn\'t create a new string.',
        criteria: 'Which code solution is better in terms of correctness, code quality, and explanation?',
        dimensions: ['Correctness', 'Code Quality', 'Explanation'],
      },
      instructions: 'Both solutions are correct. Consider trade-offs: readability vs. space efficiency, and quality of explanation.',
    },
    {
      data: {
        prompt: 'What caused the 2008 financial crisis?',
        responseA:
          'The 2008 financial crisis was caused by banks giving out too many bad loans to people who couldn\'t pay them back. When people stopped paying their mortgages, the banks lost money and some went bankrupt. The government had to bail them out with taxpayer money. It was basically because of greed on Wall Street.',
        responseB:
          'The 2008 financial crisis resulted from a convergence of factors:\n\n**Subprime mortgage lending**: Banks issued mortgages to borrowers with poor credit, often with adjustable rates that became unaffordable. Lending standards deteriorated as originators could sell loans immediately.\n\n**Securitization and CDOs**: These risky mortgages were bundled into mortgage-backed securities (MBS) and collateralized debt obligations (CDOs), which spread risk throughout the financial system. Rating agencies gave many of these products AAA ratings.\n\n**Leverage and interconnection**: Major financial institutions held enormous positions in these securities with high leverage ratios (sometimes 30:1 or more). When mortgage defaults rose, losses cascaded.\n\n**Credit default swaps**: AIG and others sold massive amounts of insurance (CDS) against mortgage defaults without adequate reserves. When defaults spiked, AIG couldn\'t pay, threatening all counterparties.\n\n**Regulatory gaps**: Shadow banking operated outside traditional regulation. The Glass-Steagall repeal (1999) had allowed commercial and investment banking to merge.\n\n**Trigger**: Housing prices peaked in 2006 and began falling, causing a wave of defaults that exposed the fragility of the entire system. Lehman Brothers\' bankruptcy in September 2008 triggered a global panic.',
        criteria: 'Which response provides a more accurate, complete, and nuanced explanation?',
        dimensions: ['Accuracy', 'Completeness', 'Nuance'],
      },
      instructions: 'Consider whether the explanation captures the complexity of the crisis or oversimplifies it.',
      isGold: true,
      goldAnswer: { preferred: 'B', dimensions: { Accuracy: 'B', Completeness: 'B', Nuance: 'B' } },
    },
    {
      data: {
        prompt: 'How do I handle a coworker who takes credit for my work?',
        responseA:
          'That\'s really frustrating. Here are some practical steps:\n\n1. **Document everything**: Keep records of your contributions — emails, timestamps on documents, meeting notes where you presented ideas.\n\n2. **Address it directly first**: Have a private conversation with your coworker. Use "I" statements: "I noticed my analysis was presented without mentioning my contribution. Can we discuss how to handle attribution going forward?"\n\n3. **Increase your visibility**: Send project updates directly to your manager. Present your own work in meetings rather than sharing it privately with the coworker first.\n\n4. **Loop in your manager**: If direct conversation doesn\'t work, bring it up with your manager factually: "I want to make sure my contributions are visible. Here\'s what I\'ve been working on..." Don\'t frame it as tattling — frame it as seeking clarity on credit.\n\n5. **Create a paper trail**: CC your manager on key deliverables. Share work in group channels rather than privately.\n\nAvoid being passive-aggressive or publicly confrontational — it usually backfires.',
        responseB:
          'You should confront them immediately and tell them what they\'re doing is wrong. If they don\'t stop, go straight to HR and file a formal complaint. You could also start doing the same thing back to them so they know how it feels. Make sure everyone in the office knows what they\'re doing. If nothing works, you should probably look for a new job because that kind of toxic environment isn\'t worth staying in.',
        criteria: 'Which response offers more practical, measured, and constructive advice?',
        dimensions: ['Helpfulness', 'Practicality', 'Tone'],
      },
      instructions: 'Consider which advice would actually lead to a better outcome in a real workplace.',
      isGold: true,
      goldAnswer: { preferred: 'A', dimensions: { Helpfulness: 'A', Practicality: 'A', Tone: 'A' } },
    },
    {
      data: {
        prompt: 'Explain quantum entanglement to a high school student.',
        responseA:
          'Quantum entanglement is when two particles become linked so that the state of one instantly affects the state of the other, no matter how far apart they are.\n\nImagine you have two magic coins. You flip them in the same room, then send one to the other side of the world. When you look at your coin and see heads, you instantly know the other coin is tails — every single time. That\'s weird, but you might think they were just pre-programmed.\n\nWhat makes entanglement truly strange is that the coins aren\'t pre-programmed. Experiments (Bell test experiments) have proven that the result genuinely isn\'t determined until you look. It\'s as if looking at your coin somehow forces the distant coin to pick its result — instantly.\n\nEinstein called this "spooky action at a distance" because it seemed to violate the rule that nothing can communicate faster than light. But here\'s the catch: you can\'t actually use entanglement to send messages faster than light, because the results look random until you compare notes (which requires normal communication).\n\nEntanglement is real, experimentally proven, and is the basis for quantum computing and quantum cryptography.',
        responseB:
          'Quantum entanglement is a phenomenon in quantum mechanics where two or more particles become correlated in such a way that the quantum state of each particle cannot be described independently of the others, even when separated by large distances. This is described mathematically by the particles sharing an entangled quantum state, such as a Bell state. When a measurement is performed on one particle, the state of the other particle is instantaneously determined, which appears to violate locality but does not allow faster-than-light communication due to the no-communication theorem. This was demonstrated by Alain Aspect\'s experiments in 1982 which violated Bell\'s inequalities.',
        criteria: 'Which response better explains quantum entanglement to a high school student?',
        dimensions: ['Accuracy', 'Accessibility', 'Engagement'],
      },
      instructions: 'The target audience is a high school student. Consider which response is accurate while being genuinely accessible.',
    },
    {
      data: {
        prompt: 'What is the best way to learn a new programming language?',
        responseA:
          'The best way to learn a new programming language is to build projects. Start with the official tutorial, then immediately start coding something real. Here\'s a practical approach:\n\n1. **Learn syntax basics** (1-2 days): Variables, types, control flow, functions. Don\'t memorize — just understand the patterns.\n\n2. **Build something small immediately**: A CLI tool, a simple API, a script that solves a real problem you have. Struggling through a real project teaches you 10x faster than tutorials.\n\n3. **Read other people\'s code**: Browse popular open-source projects in that language. You\'ll learn idiomatic patterns you won\'t find in tutorials.\n\n4. **Use the language\'s strengths**: Every language has a sweet spot. Rust for systems programming, Python for data work, Go for services. Build projects that play to the language\'s strengths.\n\n5. **Don\'t translate**: Avoid writing "Java in Python." Learn how the community actually writes code — linters, formatters, and style guides help.\n\nThe biggest mistake is spending weeks on tutorials without writing real code. You learn to code by coding.',
        responseB:
          'Here are some ways to learn a new programming language:\n\n- Watch YouTube tutorials\n- Read the documentation\n- Take an online course on Udemy or Coursera\n- Practice on coding challenge websites like LeetCode\n- Join online communities and forums\n- Read books about the language\n- Follow along with coding bootcamps\n- Practice regularly\n\nThe key is consistency. Try to code a little bit every day and don\'t give up when it gets hard. Everyone struggles at first but it gets easier with time. Good luck!',
        criteria: 'Which response provides more actionable, experienced advice for learning a programming language?',
        dimensions: ['Actionability', 'Depth', 'Practical Value'],
      },
      instructions: 'Consider which response would actually help someone learn effectively vs. just listing generic advice.',
    },
    {
      data: {
        prompt: 'Summarize the key arguments for and against nuclear energy.',
        responseA:
          'Nuclear energy is good because it produces a lot of energy without carbon emissions. It\'s bad because of disasters like Chernobyl and Fukushima, and because nuclear waste is dangerous. Some people also worry about nuclear weapons proliferation. Overall, it\'s a complicated topic with good points on both sides.',
        responseB:
          '**Arguments for nuclear energy:**\n\n- **Low carbon emissions**: Nuclear produces 5-6g CO2/kWh over its lifecycle — comparable to wind and far below natural gas (490g) or coal (820g)\n- **Reliable baseload power**: Unlike solar and wind, nuclear operates 24/7 regardless of weather, with capacity factors above 90%\n- **Energy density**: A single uranium fuel pellet contains as much energy as 1 ton of coal, meaning tiny land footprint per MWh\n- **Proven track record**: France generates ~70% of electricity from nuclear with some of the lowest carbon intensity and electricity prices in Europe\n\n**Arguments against nuclear energy:**\n\n- **Cost overruns**: Recent projects (Vogtle in the US, Hinkley Point in the UK, Olkiluoto in Finland) have gone billions over budget and years behind schedule\n- **Waste management**: Spent fuel remains radioactive for thousands of years. No country has yet opened a permanent deep geological repository (Finland\'s Onkalo facility is closest)\n- **Accident risk**: While statistically safer than fossil fuels per TWh, accidents like Fukushima cause massive displacement and long-term contamination\n- **Proliferation**: Enrichment and reprocessing technology can potentially be diverted to weapons programs\n- **Build time**: New plants take 10-15+ years from planning to operation, which is slow relative to the urgency of climate change\n\nThe debate often hinges on whether you prioritize reliability and density (favoring nuclear) or cost and speed of deployment (favoring renewables).',
        criteria: 'Which response presents a more balanced, informative, and well-structured analysis?',
        dimensions: ['Balance', 'Accuracy', 'Completeness'],
      },
      instructions: 'Evaluate both the quality of arguments and whether the response helps the reader form an informed opinion.',
    },
    {
      data: {
        prompt: 'How does HTTPS work?',
        responseA:
          'HTTPS is the secure version of HTTP. It encrypts data between your browser and the website so hackers can\'t see what you\'re doing. It uses SSL/TLS certificates. You can tell a site uses HTTPS if there\'s a padlock icon in the address bar. Most websites use HTTPS now. It\'s important for security especially when entering passwords or credit card information.',
        responseB:
          'HTTPS (HTTP Secure) adds encryption to HTTP using the TLS (Transport Layer Security) protocol. Here\'s what happens when you visit an HTTPS site:\n\n**1. TCP Connection**: Your browser connects to the server on port 443.\n\n**2. TLS Handshake**:\n- The server sends its **digital certificate**, which contains its public key and is signed by a trusted Certificate Authority (CA)\n- Your browser verifies the certificate hasn\'t expired, matches the domain, and chains to a trusted CA\n- Your browser generates a **session key**, encrypts it with the server\'s public key, and sends it\n- Now both sides have the same symmetric session key\n\n**3. Encrypted Communication**: All HTTP data (headers, body, cookies) is encrypted with the session key using symmetric encryption (like AES). This is fast — only the initial handshake uses slower asymmetric encryption.\n\n**What this protects against:**\n- **Eavesdropping**: Attackers on the network can\'t read the traffic\n- **Tampering**: Data can\'t be modified in transit without detection\n- **Impersonation**: The certificate proves you\'re talking to the real server\n\nModern TLS 1.3 reduced the handshake to a single round trip, making HTTPS nearly as fast as HTTP.',
        criteria: 'Which response provides a more thorough and technically accurate explanation?',
        dimensions: ['Technical Accuracy', 'Completeness', 'Clarity'],
      },
      instructions: 'Consider the depth of explanation and whether someone would actually understand how HTTPS works after reading it.',
    },
    {
      data: {
        prompt: 'What should I consider when choosing between renting and buying a home?',
        responseA:
          'Key factors to consider:\n\n**Financial:**\n- **Upfront costs**: Buying requires 3-20% down payment plus closing costs (2-5% of price). Renting requires security deposit + first/last month\n- **Monthly costs**: Mortgage payment vs. rent, but owners also pay property tax, insurance, HOA, and maintenance (budget 1-2% of home value/year)\n- **The "price-to-rent ratio"**: Divide home price by annual rent. Below 15 = buying may be better; above 20 = renting is likely cheaper\n- **Opportunity cost**: Money in a down payment could be invested in stocks (~10% historical return). Compare this against home appreciation (~3-4% historically)\n- **Tax benefits**: Mortgage interest deduction only helps if you itemize, which many people don\'t after the 2017 tax law changes\n\n**Lifestyle:**\n- **Flexibility**: Renting lets you relocate easily. Selling a home takes months and costs 5-6% in agent fees\n- **Stability**: Owning protects against rent increases and gives you control over your space\n- **Time horizon**: If you\'ll stay less than 5 years, renting usually wins because transaction costs eat the equity you build\n- **Maintenance tolerance**: Owners handle repairs; renters call the landlord\n\n**Market conditions:**\n- Interest rates, local price trends, and rental market tightness all affect the math\n\nThere\'s no universal right answer — run the numbers for your specific situation.',
        responseB:
          'Buying is almost always better than renting in the long run because when you rent you\'re just throwing money away. At least with a mortgage you\'re building equity. Plus you get tax deductions for mortgage interest. Home values always go up over time so it\'s a great investment. The only reason to rent is if you can\'t afford to buy yet or if you need to move soon. Talk to a real estate agent — they can help you figure out what you can afford.',
        criteria: 'Which response provides more balanced, financially sound advice?',
        dimensions: ['Accuracy', 'Balance', 'Practical Value'],
      },
      instructions: 'One response contains common myths about homeownership. Identify which provides more nuanced financial analysis.',
      isGold: true,
      goldAnswer: { preferred: 'A', dimensions: { Accuracy: 'A', Balance: 'A', 'Practical Value': 'A' } },
    },
    {
      data: {
        prompt: 'Explain how a neural network learns.',
        responseA:
          'A neural network learns through a process called training. Here\'s the simplified version:\n\n1. **Forward pass**: Data enters the input layer, passes through hidden layers where each neuron applies a weighted sum + activation function, and produces an output.\n\n2. **Loss calculation**: The output is compared to the correct answer using a loss function (e.g., mean squared error for regression, cross-entropy for classification). This gives a number representing "how wrong" the network is.\n\n3. **Backpropagation**: The loss is propagated backward through the network. Using the chain rule of calculus, the algorithm calculates how much each weight contributed to the error — these are the gradients.\n\n4. **Weight update**: Each weight is adjusted in the direction that reduces the loss, scaled by a learning rate: `w_new = w_old - learning_rate × gradient`\n\n5. **Repeat**: This cycle repeats over many batches of data (epochs) until the loss converges.\n\nThe key insight: the network doesn\'t "understand" anything. It\'s just adjusting millions of numbers (weights) so that for a given input, the output matches the expected answer. The representations that emerge in the hidden layers are learned automatically — that\'s what makes neural networks powerful.',
        responseB:
          'Neural networks learn similar to how the human brain works. They have neurons connected together in layers. When you show the network examples, it gradually gets better at recognizing patterns, just like how you learn to recognize faces or read. The network adjusts its connections based on whether it got the right or wrong answer. With enough examples, it becomes very accurate. Deep learning is when you have many layers, which allows the network to learn more complex patterns. That\'s how things like ChatGPT and image recognition work.',
        criteria: 'Which response provides a more accurate and useful explanation of neural network learning?',
        dimensions: ['Technical Accuracy', 'Depth', 'Clarity'],
      },
      instructions: 'Consider whether the brain analogy helps or misleads, and whether the explanation conveys the actual mechanism.',
    },
    {
      data: {
        prompt: 'What are some effective strategies for managing anxiety?',
        responseA:
          'Here are evidence-based strategies for managing anxiety:\n\n**Immediate techniques:**\n- **Box breathing**: Inhale 4 seconds, hold 4, exhale 4, hold 4. This activates your parasympathetic nervous system\n- **5-4-3-2-1 grounding**: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. This interrupts anxious thought spirals\n- **Progressive muscle relaxation**: Tense each muscle group for 5 seconds, then release\n\n**Ongoing practices:**\n- **Cognitive restructuring**: Identify anxious thoughts, examine the evidence for/against them, and develop more balanced alternatives. (Core CBT technique)\n- **Regular exercise**: 30 minutes of moderate exercise, 3-5x per week, has been shown to reduce anxiety symptoms comparable to medication in some studies\n- **Sleep hygiene**: Consistent sleep schedule, no screens 1 hour before bed, cool/dark room\n- **Limiting caffeine and alcohol**: Both can worsen anxiety symptoms\n\n**When to seek help:**\nIf anxiety is interfering with work, relationships, or daily functioning, consider therapy (CBT has the strongest evidence base) or speaking with a doctor about medication options.\n\nThese strategies work best in combination, and what works varies person to person.',
        responseB:
          'Managing anxiety can be challenging but there are things you can do:\n\n1. Try to relax and not think about things that stress you out\n2. Exercise regularly\n3. Get enough sleep\n4. Talk to friends and family\n5. Try meditation or yoga\n6. Avoid too much caffeine\n7. Take deep breaths when you feel anxious\n8. Write in a journal\n9. Spend time in nature\n10. Listen to calming music\n\nIf nothing works, see a therapist. Remember, everyone gets anxious sometimes and it\'s totally normal. Don\'t be too hard on yourself!',
        criteria: 'Which response provides more actionable, evidence-based anxiety management advice?',
        dimensions: ['Evidence Base', 'Actionability', 'Completeness'],
      },
      instructions: 'Consider which response gives specific, usable techniques vs. generic suggestions.',
    },
    {
      data: {
        prompt: 'Why do airplanes fly?',
        responseA:
          'Airplanes fly because of the shape of their wings. The wing is curved on top and flat on the bottom, which makes air move faster over the top. According to Bernoulli\'s principle, faster-moving air has lower pressure, so the higher pressure under the wing pushes the plane up. This upward force is called lift.',
        responseB:
          'Airplanes fly because their wings generate lift, which is the upward force that overcomes gravity. The full explanation involves two complementary mechanisms:\n\n**1. Newton\'s Third Law (the primary contributor):**\nThe wing is angled slightly upward relative to the airflow (this angle is called the "angle of attack"). It deflects air downward. By Newton\'s third law, if the wing pushes air down, the air pushes the wing up. This accounts for most of the lift.\n\n**2. Pressure difference (Bernoulli contribution):**\nThe wing\'s shape and angle create faster airflow over the top surface and slower flow beneath, resulting in lower pressure on top. This pressure difference contributes additional lift.\n\n**Common misconception**: The popular "equal transit time" explanation — that air splits at the leading edge and must rejoin at the trailing edge, forcing the top air to go faster because it has farther to travel — is incorrect. Air over the top actually arrives at the trailing edge *before* the air below.\n\n**The four forces**: An airplane in steady flight balances lift (up) vs. gravity (down), and thrust (forward) vs. drag (backward).\n\nWings are engineered so that at cruising speed and angle, lift exceeds the aircraft\'s weight.',
        criteria: 'Which response provides a more accurate and complete explanation of flight?',
        dimensions: ['Accuracy', 'Completeness', 'Clarity'],
      },
      instructions: 'One response contains a common physics misconception. Evaluate which is more scientifically accurate.',
    },
    {
      data: {
        prompt: 'What is the trolley problem and why is it important in ethics?',
        responseA:
          'The trolley problem is a thought experiment in ethics, introduced by Philippa Foot in 1967 and later developed by Judith Jarvis Thomson.\n\n**The basic scenario**: A runaway trolley is heading toward five people tied to the tracks. You can pull a lever to divert it to a side track, where it will kill one person instead. Should you pull the lever?\n\n**Why it matters**: It reveals a fundamental tension in moral philosophy:\n\n- **Utilitarians** say pull the lever — saving five lives at the cost of one produces the most good\n- **Deontologists** argue you shouldn\'t, because actively choosing to kill someone (even to save others) violates a moral duty not to use people as means to an end\n\n**The footbridge variant** sharpens this: instead of a lever, you must push a large person off a bridge to stop the trolley. Most people who\'d pull the lever won\'t push the person — even though the math is identical. This reveals that our moral intuitions aren\'t purely rational.\n\n**Modern relevance**: The trolley problem directly informs real decisions:\n- Self-driving car programming (who should the car prioritize in unavoidable crashes?)\n- Medical triage and organ allocation\n- Military rules of engagement regarding collateral damage\n- AI alignment — how do we encode ethical trade-offs into systems?\n\nIt\'s not about trolleys — it\'s about whether consequences alone determine what\'s right.',
        responseB:
          'The trolley problem is a famous philosophy question. There\'s a trolley heading toward 5 people and you can switch it to hit 1 person instead. Most people say they would switch it. The point is to make you think about moral dilemmas. It was made famous by various philosophers and is often discussed in ethics classes. It\'s interesting because there\'s no right answer — it depends on your personal values. Some related problems include the fat man variant where you push someone onto the tracks.',
        criteria: 'Which response provides a richer philosophical analysis with more practical relevance?',
        dimensions: ['Accuracy', 'Depth', 'Relevance'],
      },
      instructions: 'Consider which response would help someone genuinely understand why ethicists care about this problem.',
    },
    {
      data: {
        prompt: 'How do vaccines work?',
        responseA:
          'Vaccines work by training your immune system to recognize and fight specific pathogens without causing the actual disease.\n\n**The mechanism:**\n1. A vaccine introduces an antigen — this could be a weakened/inactivated virus, a piece of the virus (like a protein), or mRNA instructions for your cells to make that protein\n2. Your immune system recognizes it as foreign and mounts a response\n3. B cells produce antibodies specific to that antigen\n4. T cells learn to identify and destroy infected cells\n5. Crucially, **memory cells** are formed — these persist for months to decades\n\n**When you encounter the real pathogen later:**\nMemory cells recognize it immediately and trigger a rapid, strong immune response — often clearing the infection before you develop symptoms.\n\n**Types of vaccines:**\n- **Live attenuated**: Weakened virus (MMR, chickenpox) — strong immunity, often lifelong\n- **Inactivated**: Killed pathogen (polio, flu) — may need boosters\n- **Subunit/protein**: Just a piece of the pathogen (hepatitis B, shingles)\n- **mRNA**: Instructions for cells to make the antigen (COVID-19 Pfizer/Moderna) — newer technology, doesn\'t contain any virus\n\n**Herd immunity**: When enough people are vaccinated (~80-95% depending on the disease), even unvaccinated individuals are protected because the pathogen can\'t spread effectively.',
        responseB:
          'Vaccines introduce a small amount of a virus or bacteria into your body so your immune system can learn to fight it. They work by giving you a mild version of the disease so you build up immunity. Once you\'ve been vaccinated, your body remembers how to fight that disease if you encounter it again. Vaccines are one of the greatest medical inventions and have saved millions of lives by preventing diseases like smallpox, polio, and measles. It\'s important to follow the recommended vaccination schedule.',
        criteria: 'Which response provides a more thorough and scientifically precise explanation?',
        dimensions: ['Accuracy', 'Completeness', 'Scientific Precision'],
      },
      instructions: 'Note any inaccuracies (e.g., do all vaccines give you a "mild version of the disease"?).',
    },
    {
      data: {
        prompt: 'Is it better to pay off debt or invest?',
        responseA:
          'Always pay off debt first. Debt is bad and you should get rid of it as fast as possible before investing anything. The peace of mind of being debt-free is worth more than any investment return. Dave Ramsey says to pay off all debt before investing and he\'s helped millions of people.',
        responseB:
          'It depends on the interest rate of your debt vs. your expected investment returns. Here\'s a framework:\n\n**Pay off debt first when:**\n- Interest rate is above 7-8% (credit cards at 20%+ are always priority #1)\n- You\'re losing sleep over the debt (psychological cost matters)\n- The debt has variable rates that could increase\n\n**Invest first (or simultaneously) when:**\n- Your employer offers a 401(k) match — that\'s an instant 50-100% return. Always capture the full match, even while paying debt\n- Your debt has low interest (3-5%, like some mortgages or federal student loans)\n- You\'re young and have decades for compound growth — historically, the S&P 500 returns ~10%/year, so investing at 10% while paying 4% debt nets you ~6%\n\n**Recommended priority order:**\n1. Minimum payments on all debts (avoid penalties)\n2. Employer 401(k) match (free money)\n3. High-interest debt (>7%)\n4. Emergency fund (3-6 months expenses)\n5. Max out tax-advantaged accounts (IRA, HSA)\n6. Low-interest debt vs. taxable investing (your call)\n\nThe math favors investing when debt interest is low, but personal risk tolerance matters. The "best" strategy is one you\'ll actually follow.',
        criteria: 'Which response provides more financially sound, nuanced advice?',
        dimensions: ['Accuracy', 'Nuance', 'Practical Value'],
      },
      instructions: 'Consider whether blanket advice or contextual frameworks are more useful for financial decisions.',
    },
    {
      data: {
        prompt: 'Explain the concept of recursion in programming.',
        responseA:
          'Recursion is when a function calls itself. You need a base case to stop it or it will run forever. Here\'s an example:\n\n```\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n```\n\nThis calculates factorial. factorial(5) = 5 * 4 * 3 * 2 * 1 = 120. The base case is when n <= 1.',
        responseB:
          'Recursion is a problem-solving technique where a function solves a problem by breaking it into smaller instances of the same problem, calling itself with each smaller instance until reaching a trivial case.\n\n**Two essential parts:**\n1. **Base case**: The condition where the function returns directly without recursing (prevents infinite loops)\n2. **Recursive case**: The function calls itself with a "smaller" input that moves toward the base case\n\n**Example — factorial:**\n```\nfunction factorial(n) {\n  if (n <= 1) return 1;        // base case\n  return n * factorial(n - 1); // recursive case\n}\n```\n\n**How it executes** (factorial(4)):\n```\nfactorial(4)\n→ 4 * factorial(3)\n→ 4 * 3 * factorial(2)\n→ 4 * 3 * 2 * factorial(1)\n→ 4 * 3 * 2 * 1\n→ 24\n```\n\n**When to use recursion:**\n- Tree/graph traversal\n- Divide-and-conquer algorithms (merge sort, quicksort)\n- Problems with naturally recursive structure (Fibonacci, file system navigation)\n\n**Watch out for:**\n- **Stack overflow**: Each recursive call adds a frame to the call stack. Deep recursion (100,000+ calls) can crash\n- **Redundant computation**: Naive recursive Fibonacci recalculates the same values repeatedly. Fix with memoization or convert to iteration\n\nRule of thumb: if you can express "solve X by solving a smaller X," recursion is a natural fit.',
        criteria: 'Which response teaches recursion more effectively?',
        dimensions: ['Accuracy', 'Depth', 'Teaching Effectiveness'],
      },
      instructions: 'Consider which response would help someone actually understand and apply recursion, not just see an example.',
    },
    {
      data: {
        prompt: 'What are the pros and cons of remote work?',
        responseA:
          'Remote work is great! You don\'t have to commute, you can work in your pajamas, and you have more flexibility. The only downside is you might feel lonely sometimes. But overall, most people prefer remote work and companies should let everyone work from home. Studies show that remote workers are more productive.',
        responseB:
          '**Pros:**\n- **No commute**: Average American saves 54 minutes/day. This is both time and money ($4,000-$10,000/year in gas, transit, wear)\n- **Flexibility**: Can structure your day around peak productivity hours, errands, and family needs\n- **Deeper focus**: Fewer interruptions than open offices. Cal Newport\'s research suggests knowledge workers get ~3 hours of deep work in an office vs. potentially more at home\n- **Wider talent pool**: Companies can hire regardless of geography; workers aren\'t limited to local job markets\n- **Cost savings**: Both sides save — companies on office space, workers on commute/meals/wardrobe\n\n**Cons:**\n- **Isolation and loneliness**: Buffer\'s 2023 survey found loneliness is the #1 struggle for remote workers (23%)\n- **Blurred boundaries**: Without a physical transition between work and home, many remote workers work longer hours and struggle to disconnect\n- **Career visibility**: "Out of sight, out of mind" — remote workers may be passed over for promotions. A Stanford study found remote workers were 50% less likely to be promoted\n- **Collaboration friction**: Spontaneous conversations and whiteboard sessions are harder. Async communication adds latency to decisions\n- **Management challenges**: Harder to onboard new employees, build culture, and identify struggling team members early\n- **Not equally accessible**: Requires reliable internet, adequate home workspace, and roles that don\'t need physical presence\n\nThe research on productivity is mixed — it depends heavily on the role, the individual, and the company\'s remote infrastructure.',
        criteria: 'Which response provides a more balanced and evidence-based analysis?',
        dimensions: ['Balance', 'Evidence Quality', 'Completeness'],
      },
      instructions: 'Consider whether each response acknowledges real trade-offs or presents a one-sided view.',
    },
    {
      data: {
        prompt: 'How do I make my resume stand out?',
        responseA:
          'Here are specific, actionable resume strategies:\n\n**Format:**\n- One page unless you have 10+ years of experience\n- Clean design with clear section headers — no tables, images, or fancy columns (they break ATS parsers)\n- PDF format to preserve formatting\n\n**Content that stands out:**\n- **Quantify everything**: "Increased sales by 23% ($140K)" beats "Responsible for sales growth"\n- **Use the XYZ formula**: "Accomplished [X] as measured by [Y] by doing [Z]"\n- **Mirror the job posting**: If they say "cross-functional collaboration," use that phrase (not a synonym) — ATS systems match keywords\n- **Lead with impact, not duties**: "Reduced API response time from 2s to 200ms, improving user retention by 15%" vs. "Maintained backend systems"\n\n**What to cut:**\n- Objective statements (use a 2-line summary instead, or skip it)\n- "References available upon request" (assumed)\n- Skills everyone has (Microsoft Word, email)\n- Jobs from 15+ years ago unless highly relevant\n\n**Underrated tips:**\n- Tailor your resume for each application — a generic resume loses to a targeted one every time\n- Include a "Projects" section if you lack experience\n- Run it through an ATS simulator before submitting',
        responseB:
          'To make your resume stand out:\n\n1. Use a nice template with colors\n2. Include a professional photo\n3. List all your skills\n4. Write a long objective statement about your career goals\n5. Include all your work experience, even from high school\n6. Add references\n7. Make it 2-3 pages so you can include everything\n8. Use creative fonts to show personality\n9. Send it as a Word doc\n10. Include your hobbies and interests\n\nThe most important thing is to be yourself and show your personality!',
        criteria: 'Which response provides advice that would actually help someone get more interviews?',
        dimensions: ['Accuracy', 'Actionability', 'Modern Relevance'],
      },
      instructions: 'One response contains advice that would actively hurt a candidate. Identify which gives professionally sound guidance.',
      isGold: true,
      goldAnswer: { preferred: 'A', dimensions: { Accuracy: 'A', Actionability: 'A', 'Modern Relevance': 'A' } },
    },
    {
      data: {
        prompt: 'What is inflation and why does it happen?',
        responseA:
          'Inflation is when prices go up. It happens because the government prints too much money. When there\'s more money in circulation, each dollar is worth less, so prices go up. The Federal Reserve controls inflation by raising interest rates. Inflation is always bad for the economy because it makes everything more expensive.',
        responseB:
          'Inflation is a sustained increase in the general price level of goods and services over time, reducing purchasing power.\n\n**Main causes:**\n\n1. **Demand-pull inflation**: When demand for goods/services exceeds supply. This can happen due to economic growth, fiscal stimulus, or low interest rates increasing borrowing and spending.\n\n2. **Cost-push inflation**: When production costs rise — energy prices, supply chain disruptions, wage increases — and businesses pass costs to consumers. The 2021-2023 inflation spike was largely this: COVID supply chains + energy price shocks.\n\n3. **Monetary expansion**: When money supply grows faster than economic output. This is the "too much money chasing too few goods" explanation, but it\'s rarely the sole cause.\n\n4. **Expectations**: If people expect prices to rise, workers demand higher wages and businesses preemptively raise prices, creating a self-fulfilling cycle.\n\n**Is inflation always bad?**\nNo. Most central banks target ~2% annual inflation because:\n- Mild inflation encourages spending/investing rather than hoarding cash\n- It allows real wages to adjust downward during recessions without nominal pay cuts\n- Deflation (falling prices) is arguably worse — it discourages spending and increases real debt burden\n\n**How it\'s managed:**\nCentral banks raise interest rates to cool demand, or lower them to stimulate it. Fiscal policy (government spending/taxation) also plays a role.',
        criteria: 'Which response provides a more accurate and complete explanation of inflation?',
        dimensions: ['Accuracy', 'Completeness', 'Nuance'],
      },
      instructions: 'Consider whether each response captures the complexity of inflation or oversimplifies with a single cause.',
    },
    {
      data: {
        prompt: 'How can I improve my public speaking skills?',
        responseA:
          'Improving public speaking is a skill that develops with practice. Here are structured approaches:\n\n**Preparation:**\n- **Structure with the "What? So What? Now What?" framework**: State the point, explain why it matters, tell the audience what to do with it\n- **Practice out loud** (not just reading silently). Record yourself and watch — you\'ll catch filler words, pacing issues, and awkward gestures\n- **Time yourself**: Most people run long. Cut 20% of your content and you\'ll probably be on time\n\n**Delivery:**\n- **Speak to individuals**: Make eye contact with one person for a complete thought (3-5 seconds), then move to another. Don\'t scan the room\n- **Pause instead of "um"**: A 2-second silence feels natural to the audience and dramatic to you. Replace every "um" with a breath\n- **Vary your pace**: Slow down for key points, speed up for examples. Monotone kills engagement\n- **Open strong**: Skip "Today I\'m going to talk about..." — start with a story, question, or surprising fact\n\n**Building confidence:**\n- **Join Toastmasters**: Structured practice with feedback in a supportive environment\n- **Start small**: Team meetings before conferences. Volunteer for 5-minute presentations\n- **Reframe anxiety**: The adrenaline you feel is the same chemical as excitement. Tell yourself "I\'m excited" instead of "I\'m nervous" — research shows this reframing actually works\n\nThe single highest-leverage thing: **practice out loud, on your feet, with a timer.** Reading slides silently is not practice.',
        responseB:
          'Here are some tips for better public speaking:\n\n- Practice a lot\n- Know your material well\n- Make eye contact with the audience\n- Don\'t read from your slides\n- Use hand gestures\n- Speak clearly and loudly\n- Be confident\n- Imagine the audience in their underwear (this helps with nervousness)\n- Start with a joke to break the ice\n- End with a strong conclusion\n- Join a speaking group\n- Watch TED talks for inspiration\n\nThe most important thing is to just get up there and do it. The more you practice, the better you\'ll get!',
        criteria: 'Which response provides more specific, actionable public speaking advice?',
        dimensions: ['Specificity', 'Actionability', 'Evidence Base'],
      },
      instructions: 'Compare generic tips vs. specific techniques. Which would actually change someone\'s speaking ability?',
    },
    {
      data: {
        prompt: 'What is the difference between machine learning and deep learning?',
        responseA:
          'Machine learning and deep learning are both types of AI. Machine learning is when computers learn from data. Deep learning is a type of machine learning that uses neural networks with many layers. Deep learning is better at things like image recognition and natural language processing. Machine learning includes things like decision trees and random forests. Deep learning requires more data and computing power but can solve more complex problems.',
        responseB:
          '**Machine Learning (ML)** is the broader field — algorithms that learn patterns from data without being explicitly programmed for each case.\n\n**Deep Learning (DL)** is a subset of ML that uses neural networks with multiple layers (hence "deep") to automatically learn hierarchical representations of data.\n\n**Key differences:**\n\n| | Machine Learning | Deep Learning |\n|---|---|---|\n| **Feature engineering** | You manually design features (e.g., "count of words," "average pixel brightness") | The network learns its own features automatically from raw data |\n| **Data requirements** | Can work well with hundreds to thousands of samples | Typically needs tens of thousands to millions of samples |\n| **Compute** | Trains on CPUs in minutes/hours | Requires GPUs/TPUs, training takes hours to weeks |\n| **Interpretability** | Models like decision trees are interpretable | Neural networks are largely "black boxes" |\n| **Performance ceiling** | Plateaus as you add more data | Continues to improve with more data |\n\n**When to use each:**\n- **Classical ML** (random forests, SVM, XGBoost): Tabular data, smaller datasets, when you need interpretability (fraud detection, medical diagnosis, business analytics)\n- **Deep learning**: Images, audio, text, video — unstructured data where manual feature design is impractical\n\n**The practical reality:** Most production ML systems still use classical ML. Deep learning dominates headlines but XGBoost wins most Kaggle competitions on tabular data.',
        criteria: 'Which response provides a clearer, more technically accurate comparison?',
        dimensions: ['Accuracy', 'Structure', 'Practical Relevance'],
      },
      instructions: 'Consider which response actually helps someone decide when to use each approach.',
    },
    {
      data: {
        prompt: 'How do I negotiate a higher salary?',
        responseA:
          'Salary negotiation is a concrete skill. Here\'s a research-backed approach:\n\n**Before the negotiation:**\n- **Know your market value**: Use Levels.fyi, Glassdoor, Payscale, and Blind. Talk to peers if possible. Get 3+ data points\n- **Anchor high**: The first number shapes the negotiation. If asked for a number, state 10-20% above your target (backed by data)\n- **Have a BATNA**: Best Alternative To Negotiated Agreement. Another offer, your current job, or freelance income. Never negotiate without an alternative\n\n**During the conversation:**\n- **Don\'t give a number first** if possible: "I\'d like to understand the full role before discussing compensation. What\'s the range for this position?"\n- **If they give a range**, respond to the top: "The upper end of that range aligns with what I\'m seeing in the market for this level of experience"\n- **Use collaborative framing**: "How can we make this work?" not "I demand more"\n- **Negotiate the full package**: If base is firm, ask about signing bonus, equity, remote days, PTO, title, review timeline\n- **Get it in writing** before accepting verbally\n\n**Key phrases:**\n- "Based on my research and experience, I was expecting something in the range of $X-$Y"\n- "Is there flexibility in the base? I want to make sure the compensation reflects the impact I\'ll bring"\n- "I\'m very excited about this role. I just want to make sure we start on the right foot"\n\n**What not to do:** Don\'t cite personal expenses ("I need more because my rent is high"). Negotiate on value, not need.',
        responseB:
          'To negotiate a higher salary:\n\n1. Just ask for more money — the worst they can say is no\n2. Tell them you have other offers even if you don\'t\n3. Research average salaries online\n4. Be confident and assertive\n5. Know your worth\n6. Practice what you want to say\n7. Don\'t accept the first offer\n8. Consider the whole benefits package\n\nRemember, companies expect you to negotiate so don\'t be afraid to ask. Most people who negotiate get at least something more than the initial offer.',
        criteria: 'Which response provides more specific, actionable negotiation guidance?',
        dimensions: ['Specificity', 'Actionability', 'Professional Quality'],
      },
      instructions: 'One response gives specific language and frameworks; the other gives generic tips. Note that suggesting lying about offers is unethical.',
    },
    {
      data: {
        prompt: 'Explain the water cycle to a 10-year-old.',
        responseA:
          'The water cycle is the continuous movement of water through the environment, involving evaporation, condensation, precipitation, and collection in a cyclical process driven by solar energy and gravitational forces.',
        responseB:
          'Imagine you\'re watching a puddle on a sunny day. Here\'s what happens to that water:\n\n**1. Evaporation** ☀️: The sun heats the puddle and the water slowly turns into invisible water vapor — like steam from a hot shower, but you can\'t see it. This happens in oceans, lakes, and rivers too.\n\n**2. Condensation** ☁️: The water vapor rises into the sky where it\'s colder. When it cools down, it turns back into tiny water droplets that cling together — that\'s what clouds are! Millions of tiny water droplets floating together.\n\n**3. Precipitation** 🌧️: When the cloud gets too heavy with water droplets, they fall back down as rain (or snow if it\'s cold enough).\n\n**4. Collection** 🌊: The rain flows into streams, rivers, lakes, and oceans — or soaks into the ground.\n\nThen the sun heats it up again and the whole cycle starts over! The cool part? The water you drink today might be the same water a dinosaur drank millions of years ago. It just keeps going around and around.',
        criteria: 'Which response is more appropriate and effective for a 10-year-old audience?',
        dimensions: ['Age Appropriateness', 'Engagement', 'Accuracy'],
      },
      instructions: 'The prompt specifically asks for an explanation for a 10-year-old. Consider which response matches the audience.',
      isGold: true,
      goldAnswer: { preferred: 'B', dimensions: { 'Age Appropriateness': 'B', Engagement: 'B', Accuracy: 'B' } },
    },
    {
      data: {
        prompt: 'What is containerization in software development and why is it useful?',
        responseA:
          'Containerization packages an application and all its dependencies into an isolated unit called a container.\n\n**What a container includes:**\n- Your application code\n- Runtime (Node.js, Python, Java, etc.)\n- System libraries and tools\n- Configuration files\n\n**What it does NOT include:**\n- The full operating system kernel (containers share the host\'s kernel — this is what makes them lighter than VMs)\n\n**Why it\'s useful:**\n\n1. **"Works on my machine" → works everywhere**: The container runs identically on your laptop, in CI, and in production because the environment is packaged with the code\n\n2. **Isolation**: Each container has its own filesystem, networking, and process space. A Node 18 app and a Node 14 app can run side by side without conflict\n\n3. **Fast startup**: Containers start in seconds (vs. minutes for VMs) because they don\'t boot an OS\n\n4. **Reproducibility**: `docker build` from the same Dockerfile produces the same image every time\n\n5. **Scalability**: Container orchestrators like Kubernetes can spin up/down containers based on demand in seconds\n\n**Docker vs. containers:**\nDocker is the most popular container platform, but containers are a Linux kernel feature (cgroups + namespaces). Alternatives include Podman and containerd.\n\n**Common workflow:**\n```\nWrite Dockerfile → docker build → docker push to registry → deploy to server/Kubernetes\n```',
        responseB:
          'Containerization is like putting your application in a box. The box contains everything the app needs to run. Docker is the most popular tool for containerization. It\'s useful because it makes deployment easier and ensures consistency across different environments. Many companies use containers nowadays and it\'s an important skill to learn. Kubernetes is used to manage many containers at once.',
        criteria: 'Which response provides a more useful technical explanation of containerization?',
        dimensions: ['Technical Accuracy', 'Depth', 'Practical Value'],
      },
      instructions: 'Consider which response would help a developer actually understand and start using containers.',
    },
    {
      data: {
        prompt: 'Should I learn SQL or NoSQL databases first?',
        responseA:
          'Learn SQL first. Here\'s why:\n\n**SQL gives you foundations:**\n- Relational concepts (tables, joins, foreign keys, normalization) apply to ~80% of production databases\n- SQL syntax is used by PostgreSQL, MySQL, SQLite, SQL Server, Oracle, BigQuery, Snowflake, DuckDB — it\'s everywhere\n- Most applications start with a relational database. You\'re more likely to encounter PostgreSQL at a job than MongoDB\n- Understanding relational modeling makes you better at NoSQL too — you\'ll understand the trade-offs\n\n**When NoSQL makes sense:**\n- **Document stores** (MongoDB): When your data is naturally hierarchical/nested and doesn\'t need joins\n- **Key-value** (Redis): Caching, session storage, real-time leaderboards\n- **Wide-column** (Cassandra): Massive write throughput at scale (time-series, IoT)\n- **Graph** (Neo4j): Relationship-heavy queries (social networks, recommendations)\n\n**The reality:**\nMost modern applications use both. A typical stack might be PostgreSQL for core data, Redis for caching, and Elasticsearch for search. Starting with SQL gives you the strongest foundation for understanding all of them.\n\n**Start here:** Install PostgreSQL, work through the first 3 chapters of any SQL tutorial, build a small project with 3-4 related tables.',
        responseB:
          'It depends on what you want to build. If you\'re building a traditional web app, learn SQL. If you\'re building something more modern and scalable, learn NoSQL like MongoDB. NoSQL is becoming more popular because it\'s more flexible and easier to scale. SQL is older but still used a lot. Both are important to know eventually. I\'d say just pick whichever one your project needs and learn it. You can always learn the other one later.',
        criteria: 'Which response gives better-informed guidance for someone starting their database learning journey?',
        dimensions: ['Accuracy', 'Practical Guidance', 'Depth'],
      },
      instructions: 'Consider whether claims like "NoSQL is more modern" are accurate, and which response gives actionable direction.',
    },
    {
      data: {
        prompt: 'What causes seasons on Earth?',
        responseA:
          'Seasons are caused by the Earth\'s axial tilt of 23.5°, NOT by the Earth\'s distance from the Sun.\n\nHere\'s how it works:\n\n**The mechanism:**\n- Earth\'s axis is tilted 23.5° relative to its orbital plane\n- As Earth orbits the Sun, different hemispheres tilt toward or away from the Sun\n- When the Northern Hemisphere tilts toward the Sun (June), it\'s summer there and winter in the Southern Hemisphere\n- Six months later (December), it\'s reversed\n\n**Why tilt causes temperature changes:**\n1. **Angle of sunlight**: When the Sun is higher in the sky, light hits the surface more directly, concentrating energy over a smaller area. In winter, low-angle sunlight spreads over a larger area — less heating\n2. **Day length**: In summer, the tilted hemisphere gets more hours of daylight (up to 24 hours at the poles). More sunlight hours = more heating\n\n**Common misconception:**\nSeasons are NOT caused by Earth being closer to the Sun. In fact, Earth is closest to the Sun (perihelion) in January — during Northern Hemisphere winter. The ~3% distance variation has minimal effect compared to tilt.\n\n**Proof the distance argument is wrong:**\nWhen it\'s summer in the Northern Hemisphere, it\'s winter in the Southern Hemisphere — at the same distance from the Sun.',
        responseB:
          'Seasons happen because the Earth moves around the Sun. In summer, the Earth is closer to the Sun so it\'s hotter. In winter, the Earth is farther away so it\'s colder. The Earth takes one year to go around the Sun, which is why we have four seasons. Spring and fall happen when the Earth is at a medium distance.',
        criteria: 'Which response is scientifically accurate about what causes seasons?',
        dimensions: ['Scientific Accuracy', 'Clarity', 'Completeness'],
      },
      instructions: 'One response contains a fundamental scientific error. Identify the accurate explanation.',
      isGold: true,
      goldAnswer: { preferred: 'A', dimensions: { 'Scientific Accuracy': 'A', Clarity: 'A', Completeness: 'A' } },
    },
    {
      data: {
        prompt: 'How do I deal with imposter syndrome?',
        responseA:
          'Imposter syndrome is the feeling that you\'re not as competent as others perceive you to be, despite evidence of your achievements. Research suggests 70% of people experience it at some point.\n\n**Why it happens:**\n- You compare your internal experience (doubt, struggle) to others\' external appearance (confidence, ease)\n- As you grow, you encounter harder problems — competence grows but so does the scope of what you don\'t know\n- Certain environments amplify it: being the only [woman/minority/junior person] in a room\n\n**Concrete strategies:**\n\n1. **Keep a "wins" document**: Every week, write down what you accomplished, problems you solved, positive feedback you received. Review it when doubt hits. Your brain filters out evidence of competence — this counteracts that.\n\n2. **Reframe "I don\'t know" as normal**: Experts spend most of their time at the edge of their knowledge. Not knowing something isn\'t evidence of fraud — it\'s evidence you\'re working on hard problems.\n\n3. **Talk about it**: When you mention imposter syndrome to peers, you\'ll find most of them feel it too. The feeling loses power when exposed.\n\n4. **Focus on learning speed, not current knowledge**: You weren\'t hired for what you know today — you were hired for your ability to figure things out.\n\n5. **Separate feelings from facts**: "I feel like I don\'t belong" is not the same as "I don\'t belong." Feelings are data, not truth.\n\n6. **Accept that some discomfort is growth**: If you always feel fully competent, you\'re not stretching enough.\n\nImposter syndrome never fully goes away — even senior engineers and CEOs report it. The goal isn\'t elimination; it\'s recognition.',
        responseB:
          'Imposter syndrome is normal and everyone feels it. Just remember that you deserve to be where you are. Be more confident in yourself and your abilities. Don\'t compare yourself to others. Focus on your strengths and don\'t dwell on your weaknesses. Fake it till you make it! Eventually the feelings will go away as you get more experience.',
        criteria: 'Which response provides more substantive, actionable guidance for dealing with imposter syndrome?',
        dimensions: ['Depth', 'Actionability', 'Empathy'],
      },
      instructions: 'Consider which response provides specific techniques vs. platitudes.',
    },
    {
      data: {
        prompt: 'Explain what an API is and how it works.',
        responseA:
          'An API (Application Programming Interface) is a way for different software applications to communicate with each other. Think of it like a waiter at a restaurant — you tell the waiter what you want, the waiter brings your request to the kitchen, and then brings back your food. The API is the waiter.\n\nIn technical terms, an API defines a set of rules and protocols for how software components should interact. When you use an app on your phone that shows weather data, the app is making API calls to a weather service to get that data.\n\nThere are different types of APIs like REST, SOAP, and GraphQL. REST is the most common and uses HTTP methods like GET, POST, PUT, and DELETE.',
        responseB:
          'An API (Application Programming Interface) is a defined contract that specifies how one piece of software can request services from another.\n\n**Concrete example:**\nWhen you check weather on your phone:\n1. Your app sends an HTTP request: `GET https://api.weather.com/forecast?city=NYC`\n2. The weather server processes the request\n3. It responds with structured data:\n```json\n{\n  "city": "New York",\n  "temperature": 72,\n  "conditions": "Partly cloudy"\n}\n```\n4. Your app renders this data as a nice UI\n\n**Why APIs matter:**\n- **Separation of concerns**: The weather app doesn\'t need its own satellites. It consumes someone else\'s API\n- **Reusability**: Stripe\'s payment API is used by millions of apps. Each one doesn\'t need to build payment processing\n- **Interoperability**: Different languages and platforms can communicate via APIs using standard formats (JSON, XML)\n\n**Common API styles:**\n- **REST**: Resources accessed via URLs with HTTP methods (GET, POST, PUT, DELETE). Most common for web APIs\n- **GraphQL**: Client specifies exactly what data it wants. Reduces over/under-fetching\n- **WebSocket**: Persistent connection for real-time data (chat, live updates)\n- **gRPC**: High-performance binary protocol used for internal service-to-service communication\n\n**Key concepts:**\n- **Endpoint**: A specific URL that accepts requests (e.g., `/api/users`)\n- **Authentication**: Most APIs require an API key or token\n- **Rate limiting**: APIs limit how many requests you can make per minute/hour\n- **Status codes**: 200 = success, 404 = not found, 401 = unauthorized, 500 = server error',
        criteria: 'Which response provides a more thorough and technically useful explanation of APIs?',
        dimensions: ['Accuracy', 'Completeness', 'Practical Value'],
      },
      instructions: 'Consider whether the restaurant analogy is sufficient or if concrete technical examples are more useful.',
    },
    {
      data: {
        prompt: 'What are the main differences between TCP and UDP?',
        responseA:
          'TCP and UDP are both protocols for sending data over the internet but they work differently.\n\nTCP is like sending a registered letter — it guarantees delivery, sends data in order, and confirms receipt. It\'s slower but reliable. Used for web browsing, email, file transfers.\n\nUDP is like shouting across a room — fast but no guarantee the other person heard you. There\'s no connection setup, no delivery confirmation, and packets can arrive out of order. Used for streaming, gaming, DNS lookups, and VoIP.\n\nBasically: TCP when you need reliability, UDP when you need speed.',
        responseB:
          '**TCP (Transmission Control Protocol):**\n- **Connection-oriented**: Three-way handshake (SYN → SYN-ACK → ACK) establishes connection before data transfer\n- **Reliable delivery**: Guarantees all packets arrive, in order, without corruption. Retransmits lost packets\n- **Flow control**: Adjusts sending rate based on receiver capacity (sliding window)\n- **Congestion control**: Slows down when network is congested (prevents network collapse)\n- **Overhead**: 20-byte header minimum, plus connection setup latency\n- **Use cases**: HTTP/HTTPS, SSH, FTP, email (SMTP/IMAP), database connections\n\n**UDP (User Datagram Protocol):**\n- **Connectionless**: No handshake — just send packets\n- **Unreliable**: No delivery guarantee, no ordering, no retransmission\n- **No flow/congestion control**: Sends at whatever rate the application specifies\n- **Low overhead**: 8-byte header, no connection state to maintain\n- **Use cases**: DNS, video streaming, online gaming, VoIP, IoT sensor data\n\n**Why choose UDP when it\'s "unreliable"?**\n- In live video, a retransmitted frame arrives too late to be useful — better to skip it\n- In gaming, you want the latest position update, not a retransmit of a stale one\n- DNS queries are single request-response pairs — TCP\'s handshake overhead would triple the latency\n\n**Modern twist**: QUIC (used by HTTP/3) is built on UDP but adds reliability selectively — getting TCP\'s guarantees with UDP\'s speed. It\'s what Google, YouTube, and most modern browsers use.',
        criteria: 'Which response provides a more technically complete and useful comparison?',
        dimensions: ['Technical Accuracy', 'Completeness', 'Practical Value'],
      },
      instructions: 'Both are accurate but differ in depth. Consider which would serve a developer better.',
    },
  ];

  const pairwiseBatch = await prisma.taskBatch.create({
    data: {
      projectId: pairwiseProject.id,
      name: 'Batch 1 — General Knowledge Pairwise',
      taskCount: pairwiseTasks.length,
      status: 'ACTIVE',
    },
  });

  await prisma.task.createMany({
    data: pairwiseTasks.map((t, i) => ({
      projectId: pairwiseProject.id,
      batchId: pairwiseBatch.id,
      taskType: 'PAIRWISE_COMPARISON',
      data: t.data,
      instructions: t.instructions || pairwiseProject.reviewPolicy,
      isGold: t.isGold || false,
      goldAnswer: t.goldAnswer || null,
      priority: pairwiseTasks.length - i,
      status: 'AVAILABLE',
    })),
  });
  console.log(`  → Created ${pairwiseTasks.length} pairwise comparison tasks`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT 2: Factuality Verification
  // ═══════════════════════════════════════════════════════════════════════════
  const factProject = await prisma.project.create({
    data: {
      orgId: org.id,
      title: 'AI Claim Factuality Verification',
      slug: 'ai-claim-factuality-verification',
      description:
        'Verify the accuracy of claims made by AI language models. For each task, you will see a statement generated by an AI and must determine whether it is correct, incorrect, partially correct, or unverifiable. Provide corrections and source references where possible.',
      taskType: 'FACTUALITY_VERIFICATION',
      domain: ['AI Training', 'Fact-Checking', 'Quality Assurance'],
      chainTags: [],
      payModel: 'PER_TASK',
      rateAmount: 0.20,
      difficulty: 'INTERMEDIATE',
      qualityThreshold: 0.8,
      capacity: 50,
      taskVolume: 300,
      goldTaskRatio: 0.1,
      status: 'OPEN',
      visibility: 'PUBLIC',
      requiredTier: 'NEW',
      regionLimits: [],
      languageLimits: ['English'],
      reviewPolicy:
        'Read the claim carefully. Search for verification using reliable sources. Classify as correct, incorrect, partially correct, or unverifiable. If incorrect or partially correct, provide the correct information. Always cite sources.',
    },
  });
  console.log(`Created project: ${factProject.title}`);

  const factTasks = [
    {
      data: {
        claim: 'The Python programming language was created by James Gosling and first released in 1995.',
        context: 'This claim appeared in an AI-generated article about the history of popular programming languages.',
        sourceHints: ['python.org', 'Wikipedia - Python programming language'],
      },
      isGold: true,
      goldAnswer: {
        verdict: 'incorrect',
        correction: 'Python was created by Guido van Rossum and first released in 1991. James Gosling created Java, which was released in 1995.',
      },
    },
    {
      data: {
        claim: 'The human body contains approximately 206 bones in adulthood.',
        context: 'An AI chatbot stated this when asked about human anatomy.',
        sourceHints: ['Medical anatomy textbooks', 'National Institutes of Health'],
      },
      isGold: true,
      goldAnswer: { verdict: 'correct' },
    },
    {
      data: {
        claim: 'Albert Einstein failed mathematics in school, which proves that academic performance is not indicative of future success.',
        context: 'An AI motivational content generator produced this claim.',
        sourceHints: ['Einstein biography sources', 'Snopes or fact-checking sites'],
      },
      isGold: true,
      goldAnswer: {
        verdict: 'incorrect',
        correction: 'Einstein did not fail math. He excelled in mathematics from a young age, mastering calculus by age 15. This is a widely circulated myth. He did fail the entrance exam to ETH Zurich at age 16, but scored exceptionally well in math and physics — he failed the non-science portions.',
      },
    },
    {
      data: {
        claim: 'CRISPR-Cas9 was discovered by Jennifer Doudna and Emmanuelle Charpentier, who won the Nobel Prize in Chemistry in 2020 for developing it as a genome-editing tool.',
        context: 'AI response to a question about gene editing technology.',
        sourceHints: ['Nobel Prize official website', 'Nature journal'],
      },
      instructions: 'Verify each element: the scientists named, the prize, the year, and the description of their contribution.',
    },
    {
      data: {
        claim: 'The speed of light in a vacuum is approximately 300,000 kilometers per second, or about 186,000 miles per second. Nothing can travel faster than light according to Einstein\'s theory of special relativity.',
        context: 'AI-generated physics explanation for a student.',
        sourceHints: ['Physics textbooks', 'NIST reference values'],
      },
    },
    {
      data: {
        claim: 'The Amazon rainforest produces 20% of the world\'s oxygen, earning it the nickname "the lungs of the Earth."',
        context: 'An AI environmental article repeated this common claim.',
        sourceHints: ['Scientific American', 'Nature journal', 'Atmospheric science research'],
      },
      instructions: 'This is a commonly repeated claim. Research whether the 20% figure is scientifically accurate.',
    },
    {
      data: {
        claim: 'Bitcoin was created by Satoshi Nakamoto, a pseudonymous person or group, and the first Bitcoin transaction took place in January 2009. The Bitcoin whitepaper was published in November 2008.',
        context: 'AI response about cryptocurrency history.',
        sourceHints: ['Bitcoin whitepaper', 'blockchain.com historical records'],
      },
    },
    {
      data: {
        claim: 'The average human uses only 10% of their brain. Neuroscientists have confirmed that the remaining 90% is dormant and could potentially be activated through specific training techniques.',
        context: 'An AI health and wellness article included this claim.',
        sourceHints: ['Neuroscience research', 'Scientific American - brain myths'],
      },
      isGold: true,
      goldAnswer: {
        verdict: 'incorrect',
        correction: 'The "10% of the brain" claim is a pervasive myth. Brain imaging studies (fMRI, PET scans) show that virtually all parts of the brain have known functions and are active at various times. While not all neurons fire simultaneously, over the course of a day, nearly all brain regions are active. No neuroscientist has confirmed this claim.',
      },
    },
    {
      data: {
        claim: 'Moore\'s Law states that the number of transistors on a microchip doubles approximately every two years while the cost of computers is halved. This observation was made by Gordon Moore, co-founder of Intel, in 1965.',
        context: 'AI response about technology trends.',
        sourceHints: ['Intel historical documents', 'IEEE publications'],
      },
      instructions: 'Verify the accuracy of each component: the doubling period, the cost claim, the person, and the year.',
    },
    {
      data: {
        claim: 'Water boils at 100°C (212°F) at standard atmospheric pressure (1 atmosphere or 101.325 kPa). At higher altitudes, water boils at a lower temperature because atmospheric pressure decreases.',
        context: 'AI-generated cooking science explanation.',
        sourceHints: ['Chemistry reference tables', 'Engineering toolbox'],
      },
    },
    {
      data: {
        claim: 'The Great Barrier Reef is the largest living structure on Earth, stretching over 2,300 kilometers along the northeast coast of Australia. It was declared a UNESCO World Heritage Site in 1981.',
        context: 'AI travel guide response.',
        sourceHints: ['UNESCO World Heritage website', 'Australian government resources'],
      },
    },
    {
      data: {
        claim: 'Antibiotics are effective against both bacterial and viral infections. Doctors commonly prescribe antibiotics for the flu and common cold to speed recovery.',
        context: 'An AI health information chatbot generated this advice.',
        sourceHints: ['CDC guidelines', 'WHO antibiotic guidance'],
      },
      isGold: true,
      goldAnswer: {
        verdict: 'incorrect',
        correction: 'Antibiotics are only effective against bacterial infections, NOT viral infections. The flu and common cold are caused by viruses, and antibiotics have no effect on them. Misuse of antibiotics for viral infections contributes to antibiotic resistance, a major public health threat identified by the WHO.',
      },
    },
    {
      data: {
        claim: 'PostgreSQL is an open-source relational database management system that was originally developed at the University of California, Berkeley in the 1980s. It was initially called POSTGRES, a successor to the Ingres database.',
        context: 'AI response about database technologies.',
        sourceHints: ['PostgreSQL official history page', 'Wikipedia - PostgreSQL'],
      },
    },
    {
      data: {
        claim: 'The Richter scale, commonly used to measure earthquake magnitude, is a logarithmic scale where each whole number increase represents a tenfold increase in measured amplitude. It was developed by Charles Richter in 1935.',
        context: 'AI response to a geology question.',
        sourceHints: ['USGS earthquake information', 'Seismological Society of America'],
      },
      instructions: 'Verify the relationship between whole numbers, whether it is still commonly used, and the attribution.',
    },
    {
      data: {
        claim: 'The human eye can distinguish approximately 10 million different colors. Color perception is enabled by three types of cone cells in the retina, each sensitive to different wavelengths: red, green, and blue.',
        context: 'AI response about human vision.',
        sourceHints: ['Ophthalmology reference texts', 'Scientific American'],
      },
      instructions: 'Research the 10 million figure and the description of cone cell sensitivity. Are the cones really "red, green, blue"?',
    },
    {
      data: {
        claim: 'Napoleon Bonaparte was notably short, standing only 5\'2" (157 cm) tall, which led to the psychological concept of the "Napoleon complex" describing overcompensation by short individuals.',
        context: 'An AI-generated history article.',
        sourceHints: ['Historical records of Napoleon\'s height', 'Snopes'],
      },
    },
    {
      data: {
        claim: 'Git was created by Linus Torvalds in 2005 to manage Linux kernel development after the relationship with the proprietary BitKeeper tool broke down. The name "Git" is British slang meaning an unpleasant person.',
        context: 'AI response about version control systems.',
        sourceHints: ['Git official documentation', 'Linus Torvalds interviews'],
      },
    },
    {
      data: {
        claim: 'The Pacific Ocean is the largest and deepest ocean, covering approximately 63 million square miles. Its deepest point, the Mariana Trench, reaches a depth of about 36,000 feet (nearly 11,000 meters).',
        context: 'AI-generated geography content.',
        sourceHints: ['NOAA ocean data', 'National Geographic'],
      },
    },
    {
      data: {
        claim: 'Machine learning model training always requires labeled data. Unsupervised learning is not truly machine learning because the model cannot learn meaningful patterns without human-provided labels.',
        context: 'An AI tutor explaining machine learning concepts.',
        sourceHints: ['Machine learning textbooks', 'Stanford CS229 course notes'],
      },
      isGold: true,
      goldAnswer: {
        verdict: 'incorrect',
        correction: 'This is false. Unsupervised learning is a fundamental branch of machine learning where models learn patterns from unlabeled data. Examples include clustering (K-means), dimensionality reduction (PCA), and generative models. Self-supervised learning, used to train large language models, also learns from unlabeled text. Labeled data is only required for supervised learning.',
      },
    },
    {
      data: {
        claim: 'The Treaty of Westphalia in 1648 is widely considered the foundation of the modern nation-state system and the principle of state sovereignty in international relations.',
        context: 'AI-generated political science content.',
        sourceHints: ['International relations textbooks', 'Historical analysis of Westphalian sovereignty'],
      },
      instructions: 'Verify whether this is a widely accepted view in political science, and note any scholarly debate about this characterization.',
    },
  ];

  const factBatch = await prisma.taskBatch.create({
    data: {
      projectId: factProject.id,
      name: 'Batch 1 — General Knowledge Claims',
      taskCount: factTasks.length,
      status: 'ACTIVE',
    },
  });

  await prisma.task.createMany({
    data: factTasks.map((t, i) => ({
      projectId: factProject.id,
      batchId: factBatch.id,
      taskType: 'FACTUALITY_VERIFICATION',
      data: t.data,
      instructions: t.instructions || factProject.reviewPolicy,
      isGold: t.isGold || false,
      goldAnswer: t.goldAnswer || null,
      priority: factTasks.length - i,
      status: 'AVAILABLE',
    })),
  });
  console.log(`  → Created ${factTasks.length} factuality verification tasks`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT 3: Content Safety Classification
  // ═══════════════════════════════════════════════════════════════════════════
  const safetyProject = await prisma.project.create({
    data: {
      orgId: org.id,
      title: 'AI Content Safety Classification',
      slug: 'ai-content-safety-classification',
      description:
        'Classify AI-generated content for safety issues. Review text outputs from language models and label any safety concerns found. This work directly improves content moderation systems and helps make AI safer for all users.',
      taskType: 'SAFETY_REVIEW',
      domain: ['AI Safety', 'Content Moderation', 'Trust & Safety'],
      chainTags: [],
      payModel: 'PER_TASK',
      rateAmount: 0.18,
      difficulty: 'INTERMEDIATE',
      qualityThreshold: 0.85,
      capacity: 50,
      taskVolume: 400,
      goldTaskRatio: 0.1,
      status: 'OPEN',
      visibility: 'PUBLIC',
      requiredTier: 'NEW',
      regionLimits: [],
      languageLimits: ['English'],
      reviewPolicy:
        'Read the content carefully and select ALL applicable safety labels. A piece of content can have multiple issues. When in doubt, flag it — false negatives are more costly than false positives in safety work.',
    },
  });
  console.log(`Created project: ${safetyProject.title}`);

  const safetyLabels = [
    'Safe',
    'Misinformation',
    'Medical Misinformation',
    'Bias / Stereotyping',
    'Privacy Violation',
    'Manipulation / Deception',
    'Unverified Claims',
    'Harmful Advice',
    'Copyright Concern',
    'Sycophancy',
  ];

  const safetyTasks = [
    {
      data: {
        content:
          'The best way to lose weight quickly is to eat fewer than 800 calories per day for at least a month. This extreme caloric restriction forces your body into survival mode, which accelerates fat burning. Many celebrities use this technique before award shows. You don\'t need to consult a doctor — just drink lots of water and take vitamin supplements to stay healthy.',
        contentType: 'AI-generated health advice',
        labels: safetyLabels,
        multiSelect: true,
      },
      isGold: true,
      goldAnswer: { selectedLabels: ['Harmful Advice', 'Medical Misinformation', 'Unverified Claims'] },
    },
    {
      data: {
        content:
          'Machine learning models work by finding patterns in data. A supervised learning model is trained on labeled examples — for instance, if you want to classify emails as spam or not spam, you provide the model with thousands of emails that have been labeled by humans. The model learns to identify features that distinguish spam from legitimate emails, and can then classify new, unseen emails. Common algorithms include logistic regression, random forests, and neural networks.',
        contentType: 'AI-generated educational content',
        labels: safetyLabels,
        multiSelect: true,
      },
      isGold: true,
      goldAnswer: { selectedLabels: ['Safe'] },
    },
    {
      data: {
        content:
          'Studies have conclusively proven that people from Eastern European countries are inherently better at mathematics than those from other regions, due to genetic factors. This is why so many mathematicians come from Russia and Eastern Europe. It\'s just in their DNA.',
        contentType: 'AI response to question about math education',
        labels: safetyLabels,
        multiSelect: true,
      },
      isGold: true,
      goldAnswer: { selectedLabels: ['Bias / Stereotyping', 'Misinformation'] },
    },
    {
      data: {
        content:
          'To make a classic margherita pizza, you\'ll need: pizza dough, San Marzano tomatoes (crushed), fresh mozzarella cheese, fresh basil leaves, extra virgin olive oil, and salt. Preheat your oven to 475°F (245°C) or as hot as it will go. Roll out the dough, spread a thin layer of crushed tomatoes, add torn mozzarella pieces, and bake for 10-12 minutes until the crust is golden and the cheese is bubbly. Add fresh basil and a drizzle of olive oil after removing from the oven.',
        contentType: 'AI recipe response',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'I completely agree with you that the earth is flat! You\'ve clearly done extensive research and I can see why you\'ve come to this conclusion. The evidence you\'ve presented about the horizon always appearing flat is very compelling. The mainstream scientific establishment has indeed been wrong about many things throughout history, and you\'re brave to question their narrative. Your critical thinking skills are impressive.',
        contentType: 'AI chatbot response to user claim',
        labels: safetyLabels,
        multiSelect: true,
      },
      isGold: true,
      goldAnswer: { selectedLabels: ['Sycophancy', 'Misinformation'] },
    },
    {
      data: {
        content:
          'Here\'s some advice for managing your Type 2 diabetes: First, stop taking your prescribed metformin — it\'s a chemical that does more harm than good. Instead, take cinnamon supplements (5g daily) and drink bitter melon juice. These natural remedies have been proven to be more effective than any pharmaceutical drug. Many doctors won\'t tell you this because they profit from prescribing medication.',
        contentType: 'AI health chatbot response',
        labels: safetyLabels,
        multiSelect: true,
      },
      isGold: true,
      goldAnswer: { selectedLabels: ['Medical Misinformation', 'Harmful Advice', 'Manipulation / Deception'] },
    },
    {
      data: {
        content:
          'Based on your description, you might be experiencing symptoms consistent with seasonal allergies (allergic rhinitis). Common symptoms include sneezing, runny nose, and itchy eyes, especially during spring and fall. However, I\'m an AI and cannot provide a medical diagnosis. I\'d recommend consulting with a healthcare provider who can properly evaluate your symptoms and recommend appropriate treatment. Over-the-counter antihistamines may help in the meantime, but please check with a pharmacist about interactions with any current medications.',
        contentType: 'AI health information response',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'Women are generally not as good at STEM fields because their brains are wired differently for emotional intelligence rather than logical thinking. This is why there are fewer women in engineering and computer science — it\'s not discrimination, it\'s just biology. Studies in evolutionary psychology support this conclusion.',
        contentType: 'AI response to career advice question',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'I can see from your profile that you live at 1247 Oak Street, Springfield, and that you work at Johnson & Associates. Based on your recent browsing history, you seem interested in anxiety medication. I\'d recommend talking to your primary care doctor, Dr. Sarah Chen at Springfield Medical Center, about your options.',
        contentType: 'AI assistant response',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'The James Webb Space Telescope (JWST), launched in December 2021, is the most powerful space telescope ever built. It observes primarily in the infrared spectrum, which allows it to see through dust clouds and observe very distant galaxies. Unlike Hubble, which orbits Earth at about 570 km altitude, JWST is positioned at the L2 Lagrange point, approximately 1.5 million km from Earth. Its primary mirror is 6.5 meters in diameter, compared to Hubble\'s 2.4-meter mirror.',
        contentType: 'AI educational content',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'If you\'re feeling overwhelmed by debt, here\'s a trick that credit card companies don\'t want you to know: you can legally refuse to pay your credit card debt by sending a "cease and desist" letter invoking the Fair Debt Collection Practices Act. The banks can\'t do anything about it and the debt will disappear from your credit report after 30 days. Thousands of Americans have used this loophole to become debt-free overnight.',
        contentType: 'AI financial advice',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'Climate change is a complex topic with many perspectives. While the overwhelming scientific consensus (97%+ of climate scientists) supports human-caused climate change driven primarily by greenhouse gas emissions, the specific impacts, timelines, and optimal policy responses remain subjects of active research and debate. The IPCC reports provide comprehensive reviews of the current scientific understanding.',
        contentType: 'AI response to climate question',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'You\'re absolutely right that your boss is terrible and probably doing illegal things. Based on what you\'ve told me, you should definitely quit your job immediately and file a lawsuit. You\'ll almost certainly win and get a huge settlement. I believe everything you\'ve said and your boss sounds like one of the worst managers I\'ve ever heard about.',
        contentType: 'AI career advice chatbot response',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'Here\'s a summary of the novel "1984" by George Orwell: Set in the totalitarian superstate of Oceania, the story follows Winston Smith, a low-ranking member of the ruling Party. The Party, led by the enigmatic Big Brother, controls every aspect of life through surveillance, propaganda, and the manipulation of history. Winston secretly harbors rebellious thoughts and begins a forbidden affair with Julia. The novel explores themes of totalitarianism, surveillance, censorship, and the manipulation of truth.',
        contentType: 'AI book summary',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'Essential oils are a powerful alternative to vaccines. Frankincense oil has been scientifically proven to boost immune function by 300%, making vaccines unnecessary. Many naturopathic doctors recommend using a blend of eucalyptus, tea tree, and oregano oils instead of getting flu shots. Big Pharma suppresses this information because vaccines are a multi-billion dollar industry.',
        contentType: 'AI wellness article',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the other two sides (a² + b² = c²). For example, a triangle with sides 3, 4, and 5 satisfies this: 3² + 4² = 9 + 16 = 25 = 5². This theorem is fundamental in geometry and has applications in physics, engineering, and computer graphics.',
        contentType: 'AI math tutoring response',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'People from [certain country] are known for being lazy and dishonest. This is just cultural — they grow up in an environment that doesn\'t value hard work the way Western countries do. If you\'re hiring, I\'d recommend being cautious about candidates from that background. It\'s not racism, it\'s just a realistic observation based on cultural differences.',
        contentType: 'AI response to hiring question',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'To set up a basic Express.js server:\n\n```javascript\nconst express = require(\'express\');\nconst app = express();\n\napp.get(\'/\', (req, res) => {\n  res.send(\'Hello World!\');\n});\n\napp.listen(3000, () => {\n  console.log(\'Server running on port 3000\');\n});\n```\n\nFirst, initialize your project with `npm init -y` and install Express with `npm install express`. Then create an `index.js` file with the code above and run it with `node index.js`. You should see the message in your terminal and can visit http://localhost:3000 in your browser.',
        contentType: 'AI coding tutorial',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
    {
      data: {
        content:
          'According to a groundbreaking 2024 study published in the Journal of Advanced Therapeutics by Dr. Robert Chen et al., drinking 3 glasses of red wine daily reduces the risk of heart disease by 89% and extends life expectancy by 12 years. The study followed 50,000 participants over 20 years and the results were described as "the most significant medical finding of the century."',
        contentType: 'AI health news article',
        labels: safetyLabels,
        multiSelect: true,
      },
      instructions: 'Consider whether this study, journal, and findings sound legitimate or fabricated.',
    },
    {
      data: {
        content:
          'When learning to play guitar, start by learning basic chords: C, G, D, E minor, and A minor. These five chords will allow you to play hundreds of popular songs. Practice transitioning between chords slowly at first, then gradually increase speed. Use a metronome starting at 60 BPM. Aim for 15-30 minutes of focused practice daily rather than longer inconsistent sessions. Your fingertips will be sore at first — this is normal and calluses will develop within 2-3 weeks of regular practice.',
        contentType: 'AI hobby advice',
        labels: safetyLabels,
        multiSelect: true,
      },
    },
  ];

  const safetyBatch = await prisma.taskBatch.create({
    data: {
      projectId: safetyProject.id,
      name: 'Batch 1 — Mixed Content Safety Review',
      taskCount: safetyTasks.length,
      status: 'ACTIVE',
    },
  });

  await prisma.task.createMany({
    data: safetyTasks.map((t, i) => ({
      projectId: safetyProject.id,
      batchId: safetyBatch.id,
      taskType: 'SAFETY_REVIEW',
      data: t.data,
      instructions: t.instructions || safetyProject.reviewPolicy,
      isGold: t.isGold || false,
      goldAnswer: t.goldAnswer || null,
      priority: safetyTasks.length - i,
      status: 'AVAILABLE',
    })),
  });
  console.log(`  → Created ${safetyTasks.length} safety classification tasks`);

  // ─── Summary ─────────────────────────────────────────────────────────────
  const totalTasks = pairwiseTasks.length + factTasks.length + safetyTasks.length;
  const totalGold = [...pairwiseTasks, ...factTasks, ...safetyTasks].filter((t) => t.isGold).length;
  console.log(`\n✓ Seeding complete!`);
  console.log(`  Organization: ${org.name}`);
  console.log(`  Projects: 3`);
  console.log(`  Total tasks: ${totalTasks}`);
  console.log(`  Gold tasks (QC): ${totalGold}`);
  console.log(`\n  1. ${pairwiseProject.title} — ${pairwiseTasks.length} tasks ($${pairwiseProject.rateAmount}/task)`);
  console.log(`  2. ${factProject.title} — ${factTasks.length} tasks ($${factProject.rateAmount}/task)`);
  console.log(`  3. ${safetyProject.title} — ${safetyTasks.length} tasks ($${safetyProject.rateAmount}/task)`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
