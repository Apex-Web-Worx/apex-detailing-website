import { Link } from "wouter";
import { ArrowLeft, Phone } from "lucide-react";

const EFFECTIVE = "May 2, 2026";

export default function TermsPage() {
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
            TERMS &amp; CONDITIONS
          </div>
          <a
            href="tel:417-527-6165"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-[#5ECFFF] transition"
          >
            <Phone className="w-4 h-4" />
            <span>417-527-6165</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500 mb-10">
          Effective {EFFECTIVE} &middot; Apex Detailing &middot; Nixa, Missouri
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">About these terms</h2>
            <p>
              These Terms &amp; Conditions govern your use of the Apex
              Detailing website (apexdetailing.net) and the detailing
              services we provide at our shop located at 1114 E Lakota St,
              Nixa, MO 65714. By booking an appointment with us, you agree
              to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Our services</h2>
            <p>
              Apex Detailing offers vehicle detailing services including
              interior and exterior cleaning, paint correction, ceramic
              coating, headlight restoration, and similar services as
              described on our website. The final scope of any service is
              confirmed upon vehicle inspection at drop-off. Heavily soiled
              vehicles, deep stains, excessive pet hair, or other
              unforeseen conditions may require an upgraded service or
              additional time, which we will discuss with you before
              proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Booking, drop-off &amp; pickup
            </h2>
            <p className="mb-3">
              All services are by appointment, booked through our website
              or by phone at (417) 527-6165. Bookings are confirmed when
              you receive our confirmation email and text. Please bring
              your vehicle to our shop at 1114 E Lakota St, Nixa, MO 65714
              at your scheduled time.
            </p>
            <p>
              We&rsquo;ll text or call you when your vehicle is ready for
              pickup. Vehicles left more than 24 hours after notice of
              completion may be subject to a reasonable storage fee.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Reschedules &amp; cancellations
            </h2>
            <p>
              You can reschedule or cancel any appointment using the
              &ldquo;Manage your booking&rdquo; link in your confirmation
              email, or by calling/texting (417) 527-6165. We appreciate as
              much advance notice as you can give us so we can offer the
              slot to another customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Pricing &amp; payment
            </h2>
            <p>
              Final pricing is confirmed at vehicle inspection prior to
              service and may vary based on vehicle size, condition, and
              any add-on services requested. Payment is due upon completion
              of service unless otherwise agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              SMS / text messaging terms
            </h2>
            <p className="mb-3">
              By providing your mobile phone number on our booking form and
              submitting the form, you expressly consent to receive
              transactional SMS text messages from Apex Detailing related
              to your appointment. These include confirmation, reschedule
              and cancellation notices, and a single courtesy reminder
              approximately 24 hours before your appointment.
            </p>
            <p className="mb-3">
              <span className="text-white font-semibold">
                Message frequency varies
              </span>{" "}
              based on your booking activity (typically two to four
              messages per appointment).{" "}
              <span className="text-white font-semibold">
                Message and data rates may apply
              </span>{" "}
              depending on your mobile carrier and plan. Apex Detailing
              and our messaging provider are not responsible for any
              carrier charges.
            </p>
            <p className="mb-3">
              <span className="text-white font-semibold">Opt out:</span>{" "}
              Reply <span className="text-white font-semibold">STOP</span>{" "}
              to any text from us at any time to be removed from all future
              messages. Reply{" "}
              <span className="text-white font-semibold">HELP</span> for
              help, or contact us directly at (417) 527-6165.
            </p>
            <p>
              We do not send marketing or promotional texts. All messages
              are tied to a specific appointment you booked. See our{" "}
              <Link
                href="/privacy"
                className="text-[#5ECFFF] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for details on how phone numbers are handled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Vehicle &amp; personal property
            </h2>
            <p>
              Please remove valuables, electronics, and personal items from
              your vehicle before drop-off. While we take reasonable care,
              Apex Detailing is not responsible for items left in the
              vehicle. By booking a service, you confirm that you are the
              owner of the vehicle or are authorized by the owner to
              authorize service on it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              Limitation of liability
            </h2>
            <p>
              Apex Detailing performs services with reasonable care and
              skill. To the maximum extent permitted by law, our liability
              for any claim arising out of or related to a service is
              limited to the price paid for that service. We are not
              responsible for pre-existing damage, latent defects in paint
              or trim, or normal wear-and-tear conditions identified before
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Changes</h2>
            <p>
              We may update these terms from time to time. The effective
              date at the top of this page reflects the current version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>
              Questions? Call (417) 527-6165 or email{" "}
              <a
                href="mailto:apexdetailing.net@gmail.com"
                className="text-[#5ECFFF] hover:underline"
              >
                apexdetailing.net@gmail.com
              </a>
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
              Designed and developed by <span className="text-[#5ECFFF] font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
