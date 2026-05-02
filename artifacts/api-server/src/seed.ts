import { db, servicesTable } from "@workspace/db";
import { eq, notInArray } from "drizzle-orm";

// New "Apex" elite catalog (replaces the prior 6-service list).
// priceCents is intentionally 0 across the board — the website no longer
// shows prices to customers ("Call/text for quote" vibe). The column stays
// in the schema for now in case we re-introduce pricing later.
const seeds = [
  {
    slug: "apex-full-detailing",
    name: "Apex Full Detailing",
    description:
      "The ultimate package — interior and exterior detailed cleaning and protection. Get your vehicle looking showroom fresh inside and out. Add-ons available to customize your package.",
    durationMinutes: 360,
    priceCents: 0,
    sortOrder: 10,
  },
  {
    slug: "apex-interior-detailing",
    name: "Apex Interior Detailing",
    description:
      "Comprehensive interior cleaning that transforms every surface — from carpets to leather to air vents. Add-ons available to customize your package.",
    durationMinutes: 240,
    priceCents: 0,
    sortOrder: 20,
  },
  {
    slug: "apex-express-interior-detailing",
    name: "Apex Express Interior Detailing",
    description:
      "A fast, high-quality interior refresh designed to keep your vehicle clean, fresh, and presentable — without the time commitment of a full detail. Note: heavily soiled interiors, stains, excessive pet hair, or deep cleaning needs may require a Full Interior Detail. Final service type confirmed upon inspection.",
    durationMinutes: 90,
    priceCents: 0,
    sortOrder: 30,
  },
  {
    slug: "apex-exterior-detailing",
    name: "Apex Exterior Detailing",
    description:
      "Comprehensive exterior cleaning and protection to make your car turn heads everywhere you go. Detailed hand wash, windows & mirrors, wheels & tires detailed, door jambs wiped, 1-month spray sealant.",
    durationMinutes: 180,
    priceCents: 0,
    sortOrder: 40,
  },
  {
    slug: "apex-wash-clay-wax",
    name: "Apex Wash, Clay & Wax",
    description:
      "Thorough hand wash, clay bar treatment to remove embedded contaminants, and a protective wax coating to enhance shine, protect the paint, and repel water and dirt.",
    durationMinutes: 180,
    priceCents: 0,
    sortOrder: 50,
  },
  {
    slug: "apex-headlight-restoration",
    name: "Apex Headlight Restoration",
    description:
      "Fix foggy, yellowed headlights to improve nighttime visibility and dramatically improve your car's appearance. Removes oxidation and applies UV protection.",
    durationMinutes: 90,
    priceCents: 0,
    sortOrder: 60,
  },
  {
    slug: "apex-ceramic-coating",
    name: "Apex Ceramic Coating",
    description:
      "Ultimate protection and extreme gloss for your vehicle's paint. Lasts for years, making maintenance washes a breeze. Up to 5 years of protection, extreme hydrophobics, scratch resistance.",
    durationMinutes: 600,
    priceCents: 0,
    sortOrder: 70,
  },
  {
    slug: "apex-paint-correction",
    name: "Apex Paint Correction",
    description:
      "Remove swirl marks, light scratches, and oxidation to restore your paint to a flawless, mirror-like finish. Deep gloss restoration that enhances resale value.",
    durationMinutes: 480,
    priceCents: 0,
    sortOrder: 80,
  },
];

async function main() {
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
    console.log(`Deactivated (no longer in catalog): ${row.slug}`);
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
      console.log(`Updated: ${s.slug}`);
    } else {
      await db.insert(servicesTable).values({ ...s, active: true });
      console.log(`Inserted: ${s.slug}`);
    }
  }
  console.log("Seed complete");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
