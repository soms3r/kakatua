import React from 'react';
import LegalLayout from '../../components/LegalLayout';

export default function AboutPage() {
  return (
    <LegalLayout title="About Kakatua" icon="nest_eco_leaf">
      <h1 className="text-lg font-bold text-[#154212] mt-0">Finding Your Canopy: The Kakatua Story</h1>
      <p className="text-xs text-[#72796e] italic">A quiet space where languages take flight.</p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">The Origin of the Nest</h2>
      <p>
        Kakatua takes its name from the cockatoo — a bird gifted with an uncommon
        intelligence, a deep social nature, and the rare ability to mirror the sounds of
        the world around it. Like the cockatoo, we believe language is not a skill to be
        conquered in isolation. It is a living thing, learned in the warmth of
        connection, through call and response, through patience and play.
      </p>
      <p className="mt-2">
        We built Kakatua because the existing tools felt hollow. They optimized for
        streaks and scores but forgot the one thing that actually makes language stick:
        another person. A native speaker. A patient ear. A shared laugh over a mispronounced
        word. We wanted a space not built around metrics, but around moments.
      </p>
      <p className="mt-2">
        This is not a platform. It is a <strong>digital canopy</strong> — a shaded grove
        where you can arrive as you are, rest your thoughts, and find someone on the
        other side of the world who is also trying to say something new. The canopy does
        not judge your accent. It does not rush your pace. It simply shelters the space
        between two people, so that something real can grow there.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">The Philosophy of Nesting & Flight</h2>
      <p>
        Every journey on Kakatua follows the same quiet rhythm: you <strong>nest</strong>,
        you <strong>fly</strong>, you <strong>return</strong>.
      </p>
      <p className="mt-2">
        Nesting is the act of building your home within the canopy. Your profile, your
        Culture Card, the traditions and foods and stories you choose to share — these are
        the twigs and leaves that make your nest recognizable. A nest is not a resume. It
        is an invitation. It says: <em>this is who I am, and I am here to meet you.</em>
      </p>
      <p className="mt-2">
        Flight is the conversation itself. It begins with a flutter of uncertainty — a
        first message, a stumbling sentence in a language you are still learning — and
        it becomes a journey. Not every flight is smooth. Some are short. Some carry you
        further than you expected. But each one leaves you changed, carrying a new word,
        a new perspective, a new resonance.
      </p>
      <p className="mt-2">
        Returning to the nest is just as important. It is where you reflect, rest, and
        let what you have learned settle into your bones. The nest is your tether. It
        reminds you that you belong here, that the canopy is home, and that there will
        always be another flight when you are ready.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">Why Vibe Coding?</h2>
      <p>
        We build Kakatua differently. We use a practice we call &quot;vibe coding&quot; — a
        deeply collaborative process between human intention and AI acceleration. This
        is not about replacing the craft of software with automation. It is about
        removing friction so that we can spend more time thinking about what matters:
        the feel of a button, the warmth of a color, the clarity of a sentence.
      </p>
      <p className="mt-2">
        Vibe coding, for us, is a philosophy that extends beyond code. It is the belief
        that tools should feel organic. That a matching algorithm should not just be
        efficient — it should be thoughtful, pairing people not only by language but by
        timezone and interest and the quiet hope of a good conversation. That the
        technology should fade into the background so that the human connection can step
        forward.
      </p>
      <p className="mt-2">
        The AI in Kakatua assists with matching, with moderation, with the invisible work
        of keeping the canopy safe. But it never inserts itself into the conversation.
        The space between two people is sacred. We do not record it. We do not analyze it.
        We simply hold the branches steady while you speak.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">The Flock Pledge</h2>
      <p>
        A canopy is only as strong as the trust that holds it together. We make these
        promises to every bird who finds their way here:
      </p>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>
          <strong>We will protect the quiet.</strong> Kakatua is a space for intentional
          connection. There are no advertisements, no algorithms engineered to keep you
          scrolling, no noise. You will never be a product.
        </li>
        <li>
          <strong>We will hold the space.</strong> Every member of the flock is expected
          to show up with kindness, patience, and respect. Harassment, intolerance, and
          exploitation have no place beneath this canopy. We moderate with care and
          fairness, and we will always side with safety.
        </li>
        <li>
          <strong>We will stay small in spirit.</strong> Kakatua is not chasing growth
          for the sake of growth. We would rather have a thousand genuine connections
          than a million hollow ones. Every feature we build is measured against one
          question: does this help two people understand each other better?
        </li>
        <li>
          <strong>We will keep the canopy open.</strong> Kakatua is and will remain free
          for everyone. Language is a bridge, not a commodity. We will never gate it
          behind a paywall.
        </li>
      </ul>

      <h2 className="text-base font-semibold text-[#154212] mt-6">An Invitation</h2>
      <p>
        If you have read this far, you already understand. You are someone who believes
        that language is more than vocabulary lists and grammar drills. You believe it
        is a doorway. You believe that the best way to learn a word is to hear it spoken
        by someone who grew up with it on their tongue.
      </p>
      <p className="mt-2">
        You are welcome here. Build your nest. Spread your wings. Find your flock.
      </p>
      <p className="mt-4 text-sm text-[#154212] font-medium italic">
        Everyone belongs here.
      </p>

      <div className="mt-8 p-4 bg-[#f5f3ef] rounded-2xl border border-[#efeeea]">
        <p className="text-[11px] text-[#72796e]">
          <strong>Founded:</strong> 2026 &middot; <strong>Born from:</strong> a belief that connection is the only curriculum worth following.<br />
          <strong>Find the flock:</strong> <a href="https://github.com/soms3r/kakatua" target="_blank" rel="noopener noreferrer" className="text-[#2D5A27] underline">github.com/soms3r/kakatua</a>
        </p>
      </div>
    </LegalLayout>
  );
}
