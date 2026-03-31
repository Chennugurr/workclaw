import DocPage from '../DocPage';

const toc = [
  { id: 'what-are-screenings', label: 'What are screenings?', level: 2 },
  { id: 'available-screenings', label: 'Available screenings', level: 2 },
  { id: 'taking-a-screening', label: 'Taking a screening', level: 2 },
  { id: 'scoring', label: 'Scoring and attempts', level: 2 },
  { id: 'after-passing', label: 'After passing', level: 2 },
];

export default function ScreeningsPage() {
  return (
    <DocPage
      title='Screenings'
      description='Screenings are qualification tests that verify your knowledge before you can work on specific types of projects.'
      toc={toc}
    >
      <h2 id='what-are-screenings'>What are screenings?</h2>
      <p>
        Before you can work on a project, you need to demonstrate that you have relevant knowledge
        in its subject area. Screenings are the way HumanLayer verifies that — short, structured
        multiple-choice tests that cover a specific domain.
      </p>
      <p>
        Screenings exist to protect the quality of the training data. AI teams need contributors
        who genuinely understand the material they are evaluating. Screenings filter for that.
      </p>

      <h2 id='available-screenings'>Available screenings</h2>
      <table>
        <thead>
          <tr>
            <th>Screening</th>
            <th>What it covers</th>
            <th>Pass score</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'Content Moderation & Safety', desc: 'Harmful content, bias, safety guidelines', score: '75%' },
            { name: 'Factuality Review', desc: 'Hallucinations, factual errors, AI claims', score: '80%' },
            { name: 'Prompt Evaluation', desc: 'Prompt quality, injection risks, best practices', score: '70%' },
          ].map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.desc}</td>
              <td>{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>New screenings are added as new project types become available on the platform.</p>

      <h2 id='taking-a-screening'>Taking a screening</h2>
      <div className='step-grid'>
        {[
          { n: '1', t: 'Open the Screenings page', d: 'Find it in the left sidebar of your contributor dashboard.' },
          { n: '2', t: 'Choose a screening', d: 'Pick one that matches your background. Check the pass score and number of questions before starting.' },
          { n: '3', t: 'Answer each question', d: 'You will see one question at a time. There is no time limit per question. Read carefully and choose the best answer.' },
          { n: '4', t: 'Submit and see your result', d: 'After the final question, your score is calculated immediately. You will see whether you passed and your score breakdown.' },
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

      <h2 id='scoring'>Scoring and attempts</h2>
      <p>
        Each screening has a minimum passing score shown on its card. You need to meet or exceed
        that score to pass. Each question is worth equal weight.
      </p>
      <p>
        If you do not pass, you can retry up to the maximum number of attempts — usually three.
        Your previous scores are saved so you can see where you went wrong.
      </p>
      <div className='callout callout-warn'>
        Once you use all your attempts on a screening, you cannot retake it. Use each attempt
        thoughtfully and review the topic area before retrying.
      </div>

      <h2 id='after-passing'>After passing</h2>
      <p>
        Passing a screening unlocks every project on the platform that requires it. Head to the
        Opportunities page to see what is now available to you and apply to projects that interest you.
      </p>
      <p>
        Passing a screening also adds to your on-chain reputation score, which grows over time
        and unlocks higher-tier projects as it increases.
      </p>
    </DocPage>
  );
}
