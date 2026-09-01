"use client";

import { useState } from "react";
import { submitSiteFeedback } from "../lib/apiClient";

const initial = {
  rating: "",
  foundWhatNeeded: "",
  comment: "",
};

const ratingLabels = {
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente",
};

export default function FeedbackForm() {
  const [form, setForm] = useState(initial);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function submit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    setError("");
    try {
      await submitSiteFeedback(payload);
      setSent(true);
      setForm(initial);
    } catch (sendError) {
      console.error(sendError);
      setError(sendError.message || "Não foi possível enviar sua avaliação.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="simple-feedback-success">
        <span>✓</span>
        <h2>Obrigado!</h2>
        <p>Seu feedback ajuda a gente a deixar o site cada vez melhor.</p>
        <button
          className="button secondary"
          type="button"
          onClick={() => setSent(false)}
        >
          Enviar outra avaliação
        </button>
      </div>
    );
  }

  return (
    <form className="simple-feedback-card" onSubmit={submit}>
      <div className="simple-feedback-intro">
        <span className="unit-label">AVALIE SUA EXPERIÊNCIA</span>
        <h2>O que achou do site?</h2>
        <p>Leva menos de 30 segundos.</p>
      </div>

      <div className="simple-question">
        <label className="simple-question-title">Sua experiência foi:</label>
        <div className="simple-rating-grid">
          {[1, 2, 3, 4, 5].map((number) => (
            <label
              key={number}
              className={String(number) === form.rating ? "selected" : ""}
            >
              <input
                required
                type="radio"
                name="rating"
                value={number}
                checked={String(number) === form.rating}
                onChange={() => update("rating", String(number))}
              />
              <strong>{number}</strong>
              <span>{ratingLabels[number]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="simple-question">
        <label className="simple-question-title">
          Você encontrou o que precisava?
        </label>
        <div className="simple-answer-grid">
          {["Sim", "Mais ou menos", "Não"].map((value) => (
            <label
              key={value}
              className={form.foundWhatNeeded === value ? "selected" : ""}
            >
              <input
                required
                type="radio"
                name="found"
                value={value}
                checked={form.foundWhatNeeded === value}
                onChange={() => update("foundWhatNeeded", value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="simple-question">
        <label className="simple-question-title" htmlFor="feedback-comment">
          Quer contar algo pra gente? <small>Opcional</small>
        </label>
        <textarea
          id="feedback-comment"
          value={form.comment}
          onChange={(event) => update("comment", event.target.value)}
          placeholder="Pode ser uma sugestão, algo que gostou ou algo que podemos melhorar."
        />
      </div>

      {error && <div className="simple-feedback-error">{error}</div>}

      <div className="simple-feedback-footer">
        <span>Sua opinião é muito importante para a Onda Animal.</span>
        <button className="button primary" type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Enviar avaliação"}
        </button>
      </div>
    </form>
  );
}
