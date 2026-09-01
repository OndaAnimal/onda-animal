import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";

export default function HowToAdopt() {
  return (
    <SiteShell>
      <PageHero eyebrow="Adoção responsável" title="Como funciona para adotar?"
        text="Um processo simples, pensado para aumentar a chance de uma adoção definitiva e feliz." />
      <section className="section detail-section">
        <div className="container adoption-step-grid">
          <article><span>01</span><h2>Conheça</h2><p>Veja os animais e leia o perfil completo.</p></article>
          <article><span>02</span><h2>Preencha o formulário</h2><p>Conte sobre sua casa, rotina, família e experiência com animais.</p></article>
          <article><span>03</span><h2>Aguarde a análise</h2><p>A equipe compara seu perfil com as necessidades do animal e entra em contato.</p></article>
          <article><span>04</span><h2>Aprovação e adoção</h2><p>Se houver compatibilidade, a equipe orienta os próximos passos para a adoção.</p></article>
        </div>
        <div className="center-action">
          <Link className="button primary" href="/adocao">Ver animais disponíveis</Link>
        </div>
      </section>
    </SiteShell>
  );
}
