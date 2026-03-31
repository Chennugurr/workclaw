import DocPage from '../DocPage';

const toc = [
  { id: 'what-is-reputation', label: 'What is reputation?', level: 2 },
  { id: 'how-it-grows', label: 'How it grows', level: 2 },
  { id: 'what-it-unlocks', label: 'What it unlocks', level: 2 },
  { id: 'portability', label: 'Portability', level: 2 },
];

export default function ReputationPage() {
  return (
    <DocPage
      title='Reputation'
      description='Your reputation on HumanLayer is a portable, on-chain record of your work quality and expertise.'
      toc={toc}
    >
      <h2 id='what-is-reputation'>What is reputation?</h2>
      <p>
        Reputation is a score tied to your wallet address that reflects the quality and volume
        of your contributions on HumanLayer. It grows as you pass screenings, complete tasks,
        and submit high-quality work over time.
      </p>
      <p>
        Unlike closed platforms where your history disappears if you stop using the service,
        your HumanLayer reputation is tied to your wallet. You own it.
      </p>

      <h2 id='how-it-grows'>How it grows</h2>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Effect on reputation</th>
          </tr>
        </thead>
        <tbody>
          {[
            { action: 'Passing a screening', effect: 'Reputation points added based on difficulty' },
            { action: 'Completing a task', effect: 'Points added per completed task' },
            { action: 'High-quality submissions', effect: 'Bonus points if work passes quality review' },
            { action: 'Consistent activity', effect: 'Regular contributions compound over time' },
          ].map((r) => (
            <tr key={r.action}>
              <td>{r.action}</td>
              <td>{r.effect}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id='what-it-unlocks'>What it unlocks</h2>
      <p>
        As your reputation grows, you gain access to higher-tier projects — work that pays more
        and requires deeper expertise. Some projects are only visible to contributors who have
        reached a certain reputation threshold.
      </p>
      <p>
        Reputation also signals credibility to project owners who review applications manually.
        A strong track record makes it more likely your application gets approved quickly.
      </p>

      <h2 id='portability'>Portability</h2>
      <p>
        Your reputation is stored on-chain and associated with your wallet address. This means
        it is yours regardless of what happens to the platform. It cannot be taken away, reset,
        or locked behind a closed account.
      </p>
      <p>
        As HumanLayer grows, reputation built today will carry forward — unlocking opportunities
        on new project types as they are added to the platform.
      </p>
    </DocPage>
  );
}
