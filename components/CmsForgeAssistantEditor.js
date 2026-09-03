"use client";

function newItem() {
  return {
    id: `faq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    question: "",
    keywords: "",
    answer: "",
    active: true,
  };
}

export default function CmsForgeAssistantEditor({ items = [], onChange }) {
  const list = Array.isArray(items) ? items : [];

  function update(index, field, value) {
    const next = list.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  }

  function add() {
    onChange([...list, newItem()]);
  }

  function remove(index) {
    onChange(list.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="cms-forge-knowledge">
      {list.map((item, index) => (
        <article className="cms-forge-knowledge-card" key={item.id || index}>
          <header>
            <div>
              <small>RESPOSTA {index + 1}</small>
              <strong>{item.question || "Nova dúvida"}</strong>
            </div>
            <label className="cms-forge-active">
              <span>Ativa</span>
              <input
                type="checkbox"
                checked={item.active !== false}
                onChange={(event) => update(index, "active", event.target.checked)}
              />
            </label>
          </header>

          <div className="cms-field-grid">
            <label className="span-2">
              <span>Pergunta / tema</span>
              <input
                value={item.question || ""}
                onChange={(event) => update(index, "question", event.target.value)}
                placeholder="Ex.: Como funciona a adoção?"
              />
            </label>

            <label className="span-2">
              <span>Palavras-chave <small>separadas por vírgula</small></span>
              <input
                value={item.keywords || ""}
                onChange={(event) => update(index, "keywords", event.target.value)}
                placeholder="adoção, adotar, quero adotar, formulário..."
              />
            </label>

            <label className="span-2">
              <span>Resposta</span>
              <textarea
                rows={4}
                value={item.answer || ""}
                onChange={(event) => update(index, "answer", event.target.value)}
                placeholder="Resposta que o assistente enviará..."
              />
            </label>
          </div>

          <footer>
            <div>
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑ Subir</button>
              <button type="button" disabled={index === list.length - 1} onClick={() => move(index, 1)}>↓ Descer</button>
            </div>
            <button type="button" className="danger" onClick={() => remove(index)}>Excluir</button>
          </footer>
        </article>
      ))}

      <button type="button" className="button secondary cms-forge-add" onClick={add}>
        + Adicionar nova dúvida
      </button>
    </div>
  );
}
