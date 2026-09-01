"use client";

import Link from "next/link";
import PageHero from "./PageHero";
import FeedbackForm from "./FeedbackForm";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function FeedbackPageContent() {
  const { settings } = useSiteSettings();

  if (!settings.feedbackEnabled) {
    return (
      <section className="section detail-section">
        <div className="container module-disabled-card">
          <span>★</span>
          <h1>Pesquisa temporariamente indisponível.</h1>
          <p>Este módulo foi desativado nas configurações do site.</p>
          <Link className="button secondary" href="/">Voltar ao início</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Sua opinião importa"
        title="Como foi sua experiência no site?"
        text="São só três perguntas rápidas. Seu feedback ajuda a Onda Animal a melhorar."
      />
      <FeedbackForm />
    </>
  );
}
