export const DEFAULT_REVIEW_LINK = "https://g.page/r/CQphdJbRExhREAE/review";

export type TemplateVars = {
  customer_first_name: string;
  vehicle: string;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  service_name: string;
  pickup_date: string;
  pickup_time: string;
  business_name: string;
  business_phone: string;
  review_link: string;
};

export function customerFirstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || "there";
}

/**
 * Vehicle is a single string in this app. Consecutive year/make/model
 * tokens collapse to that string so stock templates still read naturally.
 */
export function interpolateTemplate(
  template: string,
  vars: Partial<TemplateVars>,
): string {
  const vehicle = (vars.vehicle ?? "").trim();
  let out = template.replace(
    /\{\{\s*vehicle_year\s*\}\}(\s*)\{\{\s*vehicle_make\s*\}\}(\s*)\{\{\s*vehicle_model\s*\}\}/g,
    vehicle,
  );
  out = out.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key: string) => {
    const k = key.toLowerCase() as keyof TemplateVars;
    if (k === "vehicle_year" || k === "vehicle_make" || k === "vehicle_model") {
      return vehicle;
    }
    const value = vars[k];
    return typeof value === "string" ? value : "";
  });
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export const DEFAULT_VEHICLE_READY_SMS = `Hi {{customer_first_name}}! Your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is ready for pickup at {{business_name}}.

Your vehicle will be ready for you at {{pickup_time}}.

Thank you for choosing {{business_name}}!`;

export const DEFAULT_VEHICLE_READY_EMAIL = `Hi {{customer_first_name}},

Your {{vehicle}} is ready for pickup at {{business_name}}.

Service: {{service_name}}
Pickup: {{pickup_date}} at {{pickup_time}}

Thank you for choosing {{business_name}}!`;

export const DEFAULT_REVIEW_SMS = `Hi {{customer_first_name}}!

We hope you're loving your freshly detailed {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.

Thank you for choosing {{business_name}}!

If you have a moment, we'd really appreciate your feedback.

{{review_link}}

Thank you!
{{business_name}}`;

export const DEFAULT_REVIEW_EMAIL = `Hi {{customer_first_name}},

We hope you're loving your freshly detailed {{vehicle}}.

Thank you for choosing {{business_name}}!

If you have a moment, we'd really appreciate your feedback.

{{review_link}}

Thank you!
{{business_name}}`;
