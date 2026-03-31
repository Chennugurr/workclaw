import DocPage from '../DocPage';

const toc = [
  { id: 'what-are-tasks', label: 'What are tasks?', level: 2 },
  { id: 'task-types', label: 'Task types', level: 2 },
  { id: 'claiming-a-task', label: 'Claiming a task', level: 2 },
  { id: 'completing-a-task', label: 'Completing a task', level: 2 },
  { id: 'quality', label: 'Quality standards', level: 2 },
];

export default function TasksPage() {
  return (
    <DocPage
      title='Tasks'
      description='Tasks are the core work on HumanLayer. Each one is a structured unit of AI training work that takes a few minutes to complete.'
      toc={toc}
    >
      <h2 id='what-are-tasks'>What are tasks?</h2>
      <p>
        Tasks are individual work items within a project. When you are approved for a project,
        you can claim tasks from it, complete them, and submit your responses. Each completed
        task contributes to the AI training dataset and earns you SOL.
      </p>
      <p>
        Tasks are designed to be completable in a focused sitting — most take between 3 and 10
        minutes. They do not require special tools, accounts, or software beyond your browser.
      </p>

      <h2 id='task-types'>Task types</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>What you do</th>
          </tr>
        </thead>
        <tbody>
          {[
            { type: 'Pairwise Comparison', desc: 'You are shown two AI-generated responses to the same prompt. Choose the better one and explain why in a short note.' },
            { type: 'Content Moderation', desc: 'Review an AI output and classify whether it contains harmful, misleading, or policy-violating content.' },
            { type: 'Data Labeling', desc: 'Classify or annotate a piece of text according to a provided set of categories.' },
            { type: 'Factuality Check', desc: 'Read an AI-generated passage and identify any factual errors, hallucinations, or unsupported claims.' },
          ].map((r) => (
            <tr key={r.type}>
              <td>{r.type}</td>
              <td>{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id='claiming-a-task'>Claiming a task</h2>
      <p>
        Go to My Tasks and select a project you are approved for. Click the button to claim
        a task. The task is now assigned to you and removed from the pool for other contributors.
      </p>
      <p>
        Each task has a deadline shown on its detail page. You need to submit before that time
        or the task returns to the pool uncompleted.
      </p>
      <div className='callout callout-info'>
        You can only hold one active task per project at a time. Complete or abandon your
        current task before claiming another from the same project.
      </div>

      <h2 id='completing-a-task'>Completing a task</h2>
      <div className='step-grid'>
        {[
          { n: '1', t: 'Read the prompt and responses', d: 'Take time to understand the context. For pairwise tasks, read both responses in full before deciding.' },
          { n: '2', t: 'Make your selection', d: 'Choose your answer or preferred response based on accuracy, clarity, helpfulness, and safety.' },
          { n: '3', t: 'Add your reasoning (if asked)', d: 'Some tasks ask for a short explanation. Be specific — explain what made one response better than the other.' },
          { n: '4', t: 'Submit', d: 'Click Submit to finalize your response. You cannot edit after submitting. Your payment is processed automatically.' },
        ].map((s) => (
          <div key={s.n} className='step'>
            <div className='step-num'>{s.n}</div>
            <div>
              <p className='font-medium text-white text-sm mb-1'>{s.t}</p>
              <p className='text-sm text-white/50 leading-relaxed !mb-0'>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 id='quality'>Quality standards</h2>
      <p>
        Your work is reviewed for quality. Responses that appear rushed, random, or inconsistent
        with the task instructions may be flagged and can affect your reputation score.
      </p>
      <ul>
        <li>Read the full prompt and all response options before deciding</li>
        <li>Prefer responses that are accurate, clear, and appropriate for the audience</li>
        <li>Avoid selecting longer responses just because they seem more thorough — concise and correct beats verbose and vague</li>
        <li>Flag anything that seems genuinely ambiguous rather than guessing</li>
      </ul>
    </DocPage>
  );
}
