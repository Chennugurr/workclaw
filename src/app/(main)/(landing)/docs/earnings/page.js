import DocPage from '../DocPage';

const toc = [
  { id: 'how-payments-work', label: 'How payments work', level: 2 },
  { id: 'rates', label: 'Rates', level: 2 },
  { id: 'tracking-earnings', label: 'Tracking earnings', level: 2 },
  { id: 'receiving-sol', label: 'Receiving SOL', level: 2 },
];

export default function EarningsPage() {
  return (
    <DocPage
      title='Earnings & Payments'
      description='HumanLayer pays contributors in SOL directly to their wallet. No payout requests, no minimums, no delays.'
      toc={toc}
    >
      <h2 id='how-payments-work'>How payments work</h2>
      <p>
        When you complete a qualifying piece of work — a passed screening or a submitted task —
        the payment is processed automatically. SOL is sent directly from the platform treasury
        to your connected wallet address.
      </p>
      <p>
        There is no payout request to make, no minimum balance to reach before withdrawing,
        and no payment processor standing between you and your earnings. It goes straight to
        your wallet, settled on Solana in under a second.
      </p>
      <div className='callout callout-info'>
        Payments go to the wallet address you used to sign in. Make sure you are connected with
        the wallet you want to receive payments on.
      </div>

      <h2 id='rates'>Rates</h2>
      <p>
        Each project sets its own rate per task. The rate is shown on every project listing
        before you apply, so you always know what a task pays before committing to it.
      </p>
      <p>
        Screenings also carry a reward for passing. The amount is shown on the screening card.
        The reward is paid on your first pass only — retakes after a failure do not pay out again
        even if you pass on a subsequent attempt.
      </p>

      <h2 id='tracking-earnings'>Tracking earnings</h2>
      <p>
        Your full earnings history is available on the Earnings page in your contributor dashboard.
        It shows each payment, the task or screening it was for, the amount in SOL, and the
        transaction signature you can verify on-chain.
      </p>
      <p>
        Because everything is on Solana, you can also verify any payment independently using
        any Solana block explorer — just search for your wallet address or the transaction signature.
      </p>

      <h2 id='receiving-sol'>Receiving SOL</h2>
      <p>
        Any standard Solana wallet can receive SOL. Phantom, Solflare, Backpack, and most other
        wallets support this out of the box. No additional setup is needed.
      </p>
      <p>
        If you are new to Solana, you may notice a small amount of SOL is needed to keep your
        account active (called rent). This is a standard Solana requirement and is not specific
        to HumanLayer. Most wallets handle this automatically.
      </p>
    </DocPage>
  );
}
