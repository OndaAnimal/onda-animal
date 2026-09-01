"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdoptionForm from "./AdoptionForm";
import { fetchPublicResource } from "../lib/apiClient";

export default function AdoptionFormLoader({ slug, initialAnimals }) {
  const [animal, setAnimal] = useState(() => initialAnimals.find((a) => a.slug === slug) || null);

  useEffect(() => {
    let active = true;
    fetchPublicResource("animals", initialAnimals).then((items) => {
      if (active) setAnimal((items || []).find((a) => a.slug === slug) || null);
    });
    return () => { active = false; };
  }, [slug, initialAnimals]);

  if (!animal) return <div className="catalog-empty"><strong>Animal não encontrado.</strong><Link className="button secondary" href="/adocao">Voltar</Link></div>;
  if (animal.status === "Adotado" || animal.status === "Indisponível") return <div className="catalog-empty"><strong>{animal.name} não está recebendo solicitações no momento.</strong><Link className="button secondary" href={`/adocao/${animal.slug}`}>Voltar ao perfil</Link></div>;
  return <AdoptionForm animal={animal} />;
}
