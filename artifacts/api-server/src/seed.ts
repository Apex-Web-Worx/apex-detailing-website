import { db, servicesTable } from "@workspace/db";
import { eq, notInArray } from "drizzle-orm";

// New "Apex" elite catalog (replaces the prior 6-service list).
// priceCents represents the "starting at" price shown on the booking
// service-picker. A value of 0 is treated as "Call for quote" by the
// frontend (currently only Ceramic Coating). Final pricing is always
// confirmed in person and may vary by vehicle size / condition.
const seeds = [
  {
    slug: "apex-full-detailing",
    name: "Apex Full Detailing",
    description:
      "The ultimate package — interior and exterior detailed cleaning and protection. Get your vehicle looking showroom fresh inside and out. Add-ons available to customize your package.",
    durationMinutes: 360,
    priceCents: 30000,
    sortOrder: 10,
  },
  {
    slug: "apex-interior-detailing",
    name: "Apex Interior Detailing",
    description:
      "Comprehensive interior cleaning that transforms every surface — from carpets to leather to air vents. Add-ons available to customize your package.",
    durationMinutes: 240,
    priceCents: 20000,
    sortOrder: 20,
  },
  {
    slug: "apex-express-interior-detailing",
    name: "Apex Express Interior Detailing",
    description:
      "A fast, high-quality interior refresh designed to keep your vehicle clean, fresh, and presentable — without the time commitment of a full detail. This service is intended only to maintain a semi-clean vehicle. Note: heavily soiled interiors, stains, excessive pet hair, or deep cleaning needs may require a Full Interior Detail. Final service type confirmed upon inspection.",
    durationMinutes: 90,
    priceCents: 10000,
    sortOrder: 30,
  },
  {
    slug: "apex-exterior-detailing",
    name: "Apex Exterior Detailing",
    description:
      "Comprehensive exterior cleaning and protection to make your car turn heads everywhere you go. Detailed hand wash, windows & mirrors, wheels & tires detailed, door jambs wiped, 1-month spray sealant.",
    durationMinutes: 180,
    priceCents: 15000,
    sortOrder: 40,
  },
  {
    slug: "apex-wash-clay-wax",
    name: "Apex Wash, Clay & Wax",
    description:
      "Thorough hand wash, clay bar treatment to remove embedded contaminants, and a protective wax coating to enhance shine, protect the paint, and repel water and dirt.",
    durationMinutes: 180,
    priceCents: 25000,
    sortOrder: 50,
  },
  {
    slug: "apex-headlight-restoration",
    name: "Apex Headlight Restoration",
    description:
      "Fix foggy, yellowed headlights to improve nighttime visibility and dramatically improve your car's appearance. Removes oxidation and applies UV protection.",
    durationMinutes: 90,
    priceCents: 10000,
    sortOrder: 60,
  },
  {
    slug: "apex-ceramic-coating",
    name: "Apex Ceramic Coating",
    description:
      "Ultimate protection and extreme gloss for your vehicle's paint. Lasts for years, making maintenance washes a breeze. Up to 5 years of protection, extreme hydrophobics, scratch resistance.",
    durationMinutes: 600,
    // Custom-quoted — frontend shows "Call for quote" when priceCents === 0.
    priceCents: 0,
    sortOrder: 70,
  },
  {
    slug: "apex-paint-correction",
    name: "Apex Paint Correction",
    description:
      "Remove swirl marks, light scratches, and oxidation to restore your paint to a flawless, mirror-like finish. Deep gloss restoration that enhances resale value.",
    durationMinutes: 480,
    priceCents: 30000,
    sortOrder: 80,
  },
];

/**
 * Idempotent. Safe to call on every server boot — re-runs are no-ops
 * once the catalog matches. Used both by the CLI seed script and by
 * the api-server's startup hook so a fresh production database
 * (which Replit Publish provisions empty) auto-populates without us
 * having to remember to run the script manually.
 */
export async function runSeed(): Promise<void> {
  const newSlugs = seeds.map((s) => s.slug);

  // Deactivate any service whose slug isn't in the new catalog. We don't
  // delete — existing bookings keep their FK and historical name/price
  // snapshots stay intact. Deactivated rows just stop appearing in the
  // public /booking/services list (filter is `active = true`).
  const deactivated = await db
    .update(servicesTable)
    .set({ active: false })
    .where(notInArray(servicesTable.slug, newSlugs))
    .returning({ slug: servicesTable.slug });
  for (const row of deactivated) {
    console.log(`[seed] deactivated (no longer in catalog): ${row.slug}`);
  }

  for (const s of seeds) {
    const existing = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.slug, s.slug));
    if (existing.length > 0) {
      await db
        .update(servicesTable)
        .set({ ...s, active: true })
        .where(eq(servicesTable.slug, s.slug));
    } else {
      await db.insert(servicesTable).values({ ...s, active: true });
      console.log(`[seed] inserted: ${s.slug}`);
    }
  }
}

// CLI entrypoint: only runs when invoked directly via `tsx ./src/seed.ts`,
// not when the module is imported by the server. Uses an explicit
// env-var gate to stay compatible with both ESM and the bundler.
if (process.env["RUN_AS_CLI"] === "1" || process.argv[1]?.endsWith("seed.ts")) {
  runSeed()
    .then(() => {
      console.log("Seed complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
