import { db, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const seeds = [
  {
    slug: "express-wash",
    name: "Express Wash & Vacuum",
    description:
      "Hand wash, wheels & tires, full vacuum, windows, and quick interior wipe-down. Great for a quick refresh.",
    durationMinutes: 60,
    priceCents: 4500,
    sortOrder: 10,
  },
  {
    slug: "interior-detail",
    name: "Interior Detail",
    description:
      "Deep interior clean: shampoo carpets & seats, steam clean surfaces, leather treatment, vents & crevices, full glass.",
    durationMinutes: 240,
    priceCents: 18500,
    sortOrder: 20,
  },
  {
    slug: "full-detail",
    name: "Full Detail (Interior + Exterior)",
    description:
      "Our most popular package — complete interior detail plus full hand wash, decontamination, wax/sealant, tires & trim dressing.",
    durationMinutes: 360,
    priceCents: 27500,
    sortOrder: 30,
  },
  {
    slug: "paint-correction",
    name: "Paint Correction",
    description:
      "Multi-stage machine polish to remove swirls, scratches, and oxidation. Restores depth and gloss to your paint.",
    durationMinutes: 480,
    priceCents: 45000,
    sortOrder: 40,
  },
  {
    slug: "ceramic-coating",
    name: "Ceramic Coating",
    description:
      "Long-lasting professional ceramic coating with paint prep & polish. Hydrophobic protection for years of easy maintenance.",
    durationMinutes: 600,
    priceCents: 85000,
    sortOrder: 50,
  },
  {
    slug: "headlight-restoration",
    name: "Headlight Restoration",
    description:
      "Sand, polish, and seal cloudy or yellowed headlights for clearer night driving and a fresher front-end look.",
    durationMinutes: 90,
    priceCents: 12500,
    sortOrder: 60,
  },
];

async function main() {
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
