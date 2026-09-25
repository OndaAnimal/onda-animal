"use client";

function newItem(index) {
  return {
    id: `menu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    number: String(index + 1),
    label: "",
    icon: "•",
    keywords: "",
    answer: "",
    handoff: false,
    active: true,
  };
}

export default function CmsForgeMenuEditor({ items = [], onChange }) {
  const list = Array.isArray(items) ? items : [];

  function update(index, field, value) {
    onChange(list.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function add() {
    onChange([...list, newItem(list.length)]);
  }

  function remove(index) {
    onChange(list.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, itemIndex) => ({ ...item, number: String(itemIndex + 1) })));
  }

  return (
    <div className="cms-forge-menu-editor">
      {list.map((item, index) => (
        <article className={item.handoff ? "cms-forge-menu-card handoff" : "cms-forge-menu-card"} key={item.id || index}>
          <header>
            <div className="cms-forge-menu-number">{index + 1}</div>
            <div>
              <small>OPÇÃO {index + 1}</small>
              <strong>{item.label || "Nova opção"}</strong>
            </div>
            <label className="cms-forge-active">
              <span>Ativa</span>
              <input type="checkbox" checked={item.active !== false} onChange={(e) => update(index, "active", e.target.checked)} />
            </label>
          </header>

          <div className="cms-field-grid">
            <label>
              <span>Ícone curto</span>
              <input value={item.icon || ""} onChange={(e) => update(index, "icon", e.target.value.slice(0, 4))} placeholder="♡" />
            </label>
            <label>
              <span>Texto da opção</span>
              <input value={item.label || ""} onChange={(e) => update(index, "label", e.target.value)} />
            </label>
            <label className="span-2">
              <span>Palavras-chave <small>separadas por vírgula</small></span>
              <input value={item.keywords || ""} onChange={(e) => update(index, "keywords", e.target.value)} />
            </label>
            <label className="span-2">
              <span>Resposta automática</span>
              <textarea rows={5} value={item.answer || ""} onChange={(e) => update(index, "answer", e.target.value)} />
            </label>
            <label className="cms-inline-check span-2">
              <input type="checkbox" checked={Boolean(item.handoff)} onChange={(e) => update(index, "handoff", e.target.checked)} />
              <div>
                <strong>Encaminhar para atendimento humano</strong>
                <small>Quando marcada, esta opção abre o formulário de nome/WhatsApp e cria uma conversa para a equipe.</small>
              </div>
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

      <button type="button" className="button secondary cms-forge-add" onClick={add}>+ Adicionar opção</button>
    </div>
  );
}
