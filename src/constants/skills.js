/**
 * Workclaw Skill Taxonomy
 *
 * Categories and skills relevant to AI training work.
 * Used for contributor profiles, project requirements, and matching.
 */

export const SKILL_CATEGORIES = [
  {
    id: 'defi',
    name: 'DeFi',
    icon: '💰',
    skills: [
      'AMM Mechanics',
      'Lending Protocols',
      'Yield Farming',
      'DEX Trading',
      'Derivatives',
      'Stablecoin Design',
      'Liquidity Analysis',
      'Tokenomics',
      'MEV Analysis',
      'Flash Loans',
    ],
  },
  {
    id: 'smart-contracts',
    name: 'Smart Contracts',
    icon: '📜',
    skills: [
      'Solidity',
      'Rust (Solana)',
      'Move',
      'Vyper',
      'Cairo',
      'Contract Auditing',
      'Gas Optimization',
      'Proxy Patterns',
      'ERC Standards',
      'Anchor Framework',
    ],
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    skills: [
      'Vulnerability Assessment',
      'Rug Pull Detection',
      'Phishing Analysis',
      'Wallet Security',
      'Bridge Security',
      'Exploit Analysis',
      'Scam Classification',
      'Social Engineering Detection',
      'Smart Contract Exploits',
      'Honeypot Detection',
    ],
  },
  {
    id: 'research',
    name: 'Research & Analysis',
    icon: '🔬',
    skills: [
      'On-chain Analytics',
      'Protocol Analysis',
      'Governance Research',
      'Token Analysis',
      'Whitepaper Review',
      'Market Analysis',
      'Competitive Analysis',
      'Technical Writing',
      'Data Analysis',
      'Academic Research',
    ],
  },
  {
    id: 'nfts',
    name: 'NFTs & Digital Assets',
    icon: '🎨',
    skills: [
      'NFT Valuation',
      'Collection Analysis',
      'Marketplace Knowledge',
      'Metadata Standards',
      'Royalty Mechanisms',
      'Generative Art',
      'NFT Gaming Assets',
      'Digital Identity',
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: '🏗️',
    skills: [
      'Node Operations',
      'Validator Setup',
      'RPC Providers',
      'Indexing (Subgraphs)',
      'IPFS / Arweave',
      'Oracles',
      'Cross-chain Bridges',
      'Layer 2 Rollups',
      'Data Availability',
      'Consensus Mechanisms',
    ],
  },
  {
    id: 'governance',
    name: 'Governance & DAOs',
    icon: '🏛️',
    skills: [
      'DAO Frameworks',
      'Proposal Analysis',
      'Voting Mechanisms',
      'Treasury Management',
      'Delegation',
      'Governance Attacks',
      'Multi-sig Operations',
    ],
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: '🤖',
    skills: [
      'Prompt Engineering',
      'RLHF / Human Feedback',
      'Data Labeling',
      'Text Classification',
      'Fact Checking',
      'Response Evaluation',
      'Model Evaluation',
      'Dataset Curation',
      'Annotation Guidelines',
    ],
  },
  {
    id: 'content',
    name: 'Content & Communication',
    icon: '✍️',
    skills: [
      'Technical Writing',
      'Translation',
      'Community Management',
      'Documentation',
      'Educational Content',
      'Marketing Copy',
      'Social Media',
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance & Legal',
    icon: '⚖️',
    skills: [
      'KYC/AML',
      'Regulatory Analysis',
      'License Compliance',
      'Sanctions Screening',
      'Privacy Regulations',
      'Securities Classification',
    ],
  },
];

/**
 * Flat list of all skills with their categories.
 */
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((category) =>
  category.skills.map((skill) => ({
    name: skill,
    category: category.name,
    categoryId: category.id,
  }))
);

/**
 * Get skills for a given category ID.
 */
export function getSkillsByCategory(categoryId) {
  const category = SKILL_CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.skills : [];
}
