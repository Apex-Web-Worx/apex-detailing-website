import { Link } from "wouter";
import { ArrowLeft, Phone } from "lucide-react";

const EFFECTIVE = "May 2, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to site</span>
          </Link>
          <div className="text-sm font-bold tracking-widest text-white/80">
            PRIVACY POLICY
          </div>
          <a
            href="tel:417-527-6165"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-[#00E5FF] transition"
          >
            <Phone className="w-4 h-4" />
            <span>417-527-6165</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">
          Effective {EFFECTIVE} &middot; Apex Detailing &middot; Nixa, Missouri
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Who we are
            </h2>
            <p>
              Apex Detailing (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) is a vehicle detailing shop located at 1114
              E Lakota St, Nixa, MO 65714. You can reach us by phone at
              (417) 527-6165 or by email at apexdetailing.net@gmail.com. This
              policy explains what information we collect when you book a
              service with us, how we use it, and the limited situations in
              which it may be shared.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Information we collect
            </h2>
            <p>
              When you book an appointment through our website, you provide
              us with: your name, email address, mobile phone number,
              vehicle make/model/year, and any notes you choose to add about
              the job. We also store the date and time of your appointment
              and which service you selected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              How we use it
            </h2>
            <p className="mb-3">
              We use the information you provide solely to operate our
              detailing business and service your appointment. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                To confirm, reschedule, or cancel your appointment via email
                and SMS text message.
              </li>
              <li>
                To send you a one-time courtesy reminder text approximately
                24 hours before your appointment.
              </li>
              <li>
                To contact you if a question arises about your vehicle or
                service.
              </li>
              <li>
                To maintain internal records of work performed.
              </li>
            </ul>
            <p className="mt-3">
              We do <span className="text-white font-semibold">not</span>{" "}
              use your information to send marketing or promotional
              messages. All texts you receive from us are transactional and
              tied to a specific appointment you booked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              SMS / text messaging
            </h2>
            <p className="mb-3">
              By providing your mobile phone number on the booking form and
              submitting the form, you consent to receive transactional
              text messages from Apex Detailing related to your appointment
              (confirmation, reschedule/cancel notices, and a single
              reminder approximately 24 hours before the appointment).
              Message frequency varies by booking activity and is typically
              two to four messages per appointment. Message and data rates
              may apply depending on your mobile carrier and plan.
            </p>
            <p className="mb-3">
              You can opt out of all future messages at any time by replying{" "}
              <span className="text-white font-semibold">STOP</span> to any
              text from us. Reply{" "}
              <span className="text-white font-semibold">HELP</span> for
              help, or contact us directly at (417) 527-6165 or
              apexdetailing.net@gmail.com.
            </p>
            <p>
              <span className="text-white font-semibold">
                We do not share, sell, rent, or otherwise transfer your
                mobile phone number or SMS opt-in status to any third party
                or affiliate for marketing or promotional purposes.
              </span>{" "}
              Phone numbers and consent records are used only for the
              transactional messages described above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Service providers we rely on
            </h2>
            <p>
              We use a small number of trusted service providers strictly to
              deliver these notifications: Twilio (for sending SMS), Google
              Workspace / Gmail (for sending email), and Google Calendar
              (for scheduling). These providers process your information
              only on our behalf to deliver the message or calendar event
              and are bound by their own privacy and security commitments.
              They are not permitted to use your information for their own
              marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              We do not sell your data
            </h2>
            <p>
              We do not sell your personal information. We do not share it
              with advertisers, data brokers, or any third party for
              marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Data retention
            </h2>
            <p>
              We keep your booking records as long as needed to operate our
              business and meet basic recordkeeping needs. You may request
              deletion of your records at any time by emailing
              apexdetailing.net@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Children
            </h2>
            <p>
              Our services are intended for adults. We do not knowingly
              collect information from anyone under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Changes
            </h2>
            <p>
              If we update this policy, we&rsquo;ll change the effective
              date at the top of this page. Material changes will be noted
              in plain language.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Contact us
            </h2>
            <p>
              Questions about your data or this policy? Call (417) 527-6165
              or email{" "}
              <a
                href="mailto:apexdetailing.net@gmail.com"
                className="text-[#00E5FF] hover:underline"
              >
                apexdetailing.net@gmail.com
              </a>
              . You can also see our{" "}
              <Link href="/terms" className="text-[#00E5FF] hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0a] py-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <a
            href="https://www.apexwebworx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 hover:opacity-100 transition-all"
            aria-label="APEX WEB WORX"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
              alt="APEX WEB WORX"
              className="h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest group-hover:text-white transition-colors">
              Designed and developed by <span className="text-[#00E5FF] font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
