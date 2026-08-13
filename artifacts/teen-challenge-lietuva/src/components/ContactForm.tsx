import { type FormEvent, useState } from "react";
import { Button } from "@/components/Button";

type FormState = {
  name: string;
  email: string;
  message: string;
};

const empty: FormState = { name: "", email: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<FormState>(empty);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setStatus("error");
      return;
    }

    // TODO: Integrate EmailJS / Resend / a backend endpoint.
    // This only stores a local success state so the UI can be wired later.
    console.info("Contact form submitted (not sent):", values);
    setStatus("success");
    setValues(empty);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-bold text-navy">
          Vardas
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-navy"
          required
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-bold text-navy">
          El. paštas
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-navy"
          required
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-bold text-navy">
          Žinutė
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
          className="w-full resize-y rounded-[12px] border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-navy"
          required
        />
      </div>
      {status === "error" ? (
        <p className="text-sm font-semibold text-red" role="alert">
          Prašome užpildyti visus laukus.
        </p>
      ) : null}
      {status === "success" ? (
        <p className="text-sm font-semibold text-green" role="status">
          Ačiū. Žinutė išsaugota šiame lange, bet dar nėra siunčiama el. paštu.
        </p>
      ) : null}
      <Button type="submit" variant="navy">
        Siųsti žinutę
      </Button>
    </form>
  );
}
