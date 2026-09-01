"use client";

import Link from "next/link";
import AdoptionForm from "./AdoptionForm";

export default function AdoptionFormLoader({ slug, initialAnimals }) {
  const animal = initialAnimals.find((a) => a.slug === slug) || null;

  if (!animal) return <div className="catalog-empty"><strong>Animal não encontrado.</strong><Link className="button secondary" href="/adocao">Voltar</Link></div>;
  if (animal.status === "Adotado" || animal.status === "Indisponível") return <div className="catalog-empty"><strong>{animal.name} não está recebendo solicitações no momento.</strong><Link className="button secondary" href={`/adocao/${animal.slug}`}>Voltar ao perfil</Link></div>;
  return <AdoptionForm animal={animal} />;
}
