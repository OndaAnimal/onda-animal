"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import AnimalGallery from "./AnimalGallery";
import { useSiteSettings } from "./SiteSettingsProvider";
import { adoptionWhatsAppUrl } from "../lib/whatsapp";

export default function AnimalProfileClient({ slug, initialAnimals, initialViews = 0 }) {
  const { settings } = useSiteSettings();
  const animal = initialAnimals.find((a) => a.slug === slug) || null;
  const [profileViews, setProfileViews] = useState(Number(initialViews || 0));

  useEffect(() => {
    if (!animal?.slug) return;

    let cancelled = false;

    function getViewerId() {
      const key = "onda_animal_profile_viewer_v1";
      let id = localStorage.getItem(key);
      if (!id) {
        id = globalThis.crypto?.randomUUID?.()
          || `viewer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(key, id);
      }
      return id;
    }

    fetch(`/api/animals/${encodeURIComponent(animal.slug)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: getViewerId() }),
    })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!cancelled && payload?.data) {
          setProfileViews(Number(payload.data.total || 0));
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [animal?.slug]);

  if (!animal) {
    return (
      <section className="section detail-section">
        <div className="container catalog-empty">
          <strong>Animal não encontrado.</strong>
          <Link className="button secondary" href="/adocao">Voltar para adoção</Link>
        </div>
      </section>
    );
  }

  const canApply = animal.status === "Disponível" || animal.status === "Em processo";
  const adoptionContactName = settings.adoptionContactName || "Luise";
  const whatsappHref = adoptionWhatsAppUrl(settings.adoptionWhatsApp, {
    animalName: animal.name,
    contactName: adoptionContactName,
  });

  return (
    <>
      <section className="animal-detail-hero">
        <div className="container animal-detail-grid">
          <AnimalGallery animal={animal} />
          <div className="animal-detail-copy">
            <Link className="back-link" href="/adocao">← Voltar para animais</Link>
            <span className="eyebrow">{animal.species} para adoção</span>
            <h1>{animal.name}</h1>
            <p className="animal-lead">{animal.summary}</p>
            {settings.showPublicAnimalViews !== false && (
              <div className="animal-public-views" title="Visualizações deste perfil">
                <span>◉</span>
                <strong>{profileViews.toLocaleString("pt-BR")}</strong>
                <small>{profileViews === 1 ? "visualização" : "visualizações"}</small>
              </div>
            )}
            <div className="profile-facts">
              <div><small>Idade</small><strong>{animal.age}</strong></div>
              <div><small>Sexo</small><strong>{animal.sex}</strong></div>
              <div><small>Porte</small><strong>{animal.size}</strong></div>
              <div><small>Peso</small><strong>{animal.weight || "Não informado"}</strong></div>
              <div><small>Raça</small><strong>{animal.breed || "SRD"}</strong></div>
              <div><small>Local</small><strong>{animal.city}</strong></div>
              <div><small>Cor</small><strong>{animal.color || "Não informado"}</strong></div>
              <div><small>Energia</small><strong>{animal.energy || "Não avaliado"}</strong></div>
              <div><small>Status</small><strong>{animal.status}</strong></div>
            </div>
            <div className="health-badges">
              <span className={animal.vaccinated ? "ok" : ""}>{animal.vaccinated ? "✓ Vacinado" : "Vacinação pendente"}</span>
              <span className={animal.neutered ? "ok" : ""}>{animal.neutered ? "✓ Castrado" : "Ainda não castrado"}</span>
              <span className={animal.dewormed ? "ok" : ""}>{animal.dewormed ? "✓ Vermifugado" : "Vermifugação pendente"}</span>
            </div>
            <div className="animal-adoption-actions">
              {canApply ? (
                <Link className="button primary adoption-main-button" href={`/adocao/${animal.slug}/formulario`}>Quero adotar {animal.name}</Link>
              ) : (
                <span className="animal-unavailable-note">Este animal está com status: {animal.status}.</span>
              )}
              {whatsappHref && (
                <a className="button whatsapp-adoption-button" href={whatsappHref} target="_blank" rel="noreferrer">
                  Falar com {adoptionContactName} no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section animal-story-section">
        <div className="container animal-profile-sections">
          <article className="animal-story-card"><span className="eyebrow">História</span><h2>Conheça {animal.name}.</h2><p>{animal.story}</p></article>
          <article className="animal-traits-card"><span className="unit-label">TEMPERAMENTO</span><h3>Como é a personalidade?</h3><div className="trait-list">{(animal.temperament || []).map((trait) => <span key={trait}>{trait}</span>)}</div></article>
          <article className="compatibility-card"><span className="unit-label">COMPATIBILIDADE</span><h3>Convivência</h3><div className="compatibility-list"><div><span>🐕 Com cães</span><strong>{animal.compatibility?.dogs || "Não avaliado"}</strong></div><div><span>🐈 Com gatos</span><strong>{animal.compatibility?.cats || "Não avaliado"}</strong></div><div><span>👧 Com crianças</span><strong>{animal.compatibility?.children || "Não avaliado"}</strong></div></div></article>
          <article className="ideal-home-card"><span className="unit-label">LAR IDEAL</span><h3>Onde {animal.name} pode se adaptar melhor?</h3><p>{animal.idealHome || "A definir pela equipe."}</p></article>
          <article className="observations-card"><span className="unit-label">OBSERVAÇÕES</span><h3>Informações importantes</h3><p>{animal.observations || "Sem observações adicionais."}</p></article>
        </div>
      </section>

      {canApply && (
        <section className="profile-cta-section">
          <div className="container profile-cta-box">
            <div>
              <span className="eyebrow light">Gostou de {animal.name}?</span>
              <h2>Envie seu formulário para análise.</h2>
              <p>A equipe verifica se sua rotina combina com as necessidades do animal.</p>
            </div>
            <div className="profile-cta-actions">
              <Link className="button white" href={`/adocao/${animal.slug}/formulario`}>Preencher formulário</Link>
              {whatsappHref && (
                <a className="button profile-whatsapp-button" href={whatsappHref} target="_blank" rel="noreferrer">
                  WhatsApp da {adoptionContactName}
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
