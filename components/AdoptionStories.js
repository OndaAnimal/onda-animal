"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mediaUrl } from "../lib/mediaUrl";

export default function AdoptionStories({ initialStories = [] }) {
  const [selected, setSelected] = useState(null);

  const ordered = useMemo(
    () => [...initialStories].sort((a, b) => String(b.adoptionDate || b.createdAt).localeCompare(String(a.adoptionDate || a.createdAt))),
    [initialStories]
  );

  if (!ordered.length) {
    return (
      <div className="container empty-story-card">
        <span>♡</span>
        <h2>As primeiras histórias reais entram aqui.</h2>
        <p>
          Quando uma adoção for concluída pelo painel, a nova foto e a história
          aparecerão automaticamente nesta página.
        </p>
        <Link className="button secondary" href="/adocao">
          Conhecer animais disponíveis
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="stories-public-grid">
          {ordered.map((story, index) => (
            <article className="public-story-card" key={story.id}>
              <button className="public-story-photo" type="button" onClick={() => setSelected(story)}>
                <img
                  src={mediaUrl(story.photo, { width: 900, height: 680, crop: "fill" })}
                  alt={story.title || story.animalName}
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <span>FINAL FELIZ</span>
              </button>

              <div className="public-story-body">
                <div className="public-story-meta">
                  <span>{story.adoptionDate ? new Date(`${story.adoptionDate}T12:00:00`).toLocaleDateString("pt-BR") : "Adoção concluída"}</span>
                  {story.familyCity && <span>{story.familyCity}</span>}
                </div>

                <h2>{story.title || `${story.animalName} encontrou uma família`}</h2>
                <p>{story.story?.length > 190 ? `${story.story.slice(0, 190).trim()}…` : story.story}</p>

                <div className="public-story-footer">
                  <div><small>ANIMAL</small><strong>{story.animalName}</strong></div>
                  {story.familyName && <div><small>NOVA FAMÍLIA</small><strong>{story.familyName}</strong></div>}
                  <button type="button" onClick={() => setSelected(story)}>Ler história →</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div className="story-public-modal-backdrop" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setSelected(null);
        }}>
          <article className="story-public-modal">
            <button className="story-public-close" type="button" onClick={() => setSelected(null)}>×</button>
            <img
              src={mediaUrl(selected.photo, { width: 1200, height: 1200, crop: "limit" })}
              alt={selected.title || selected.animalName}
              loading="eager"
              decoding="async"
            />
            <div className="story-public-modal-body">
              <span className="eyebrow">Uma nova história</span>
              <h2>{selected.title || `${selected.animalName} encontrou uma família`}</h2>
              <div className="story-public-modal-meta">
                <span><b>{selected.animalName}</b></span>
                {selected.adoptionDate && <span>{new Date(`${selected.adoptionDate}T12:00:00`).toLocaleDateString("pt-BR")}</span>}
                {selected.familyName && <span>Família: {selected.familyName}</span>}
                {selected.familyCity && <span>{selected.familyCity}</span>}
              </div>
              <p>{selected.story}</p>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
