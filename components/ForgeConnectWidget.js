"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  connectAction,
  getConnectConversation,
} from "../lib/apiClient";
import { maskBrazilPhone } from "../lib/masks";

const VISITOR_KEY = "forge_connect_onda_visitor_v1";

const TOPICS = [
  "Adoção de animal",
  "Dúvida sobre um animal",
  "Solicitação de adoção enviada",
  "Atendimento da clínica",
  "Outro assunto",
];

function makeId(prefix = "fc") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadVisitor() {
  try {
    return JSON.parse(localStorage.getItem(VISITOR_KEY) || "null");
  } catch {
    return null;
  }
}

export default function ForgeConnectWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    whatsapp: "",
    topic: "Adoção de animal",
  });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusText, setStatusText] = useState("");
  const threadRef = useRef(null);

  useEffect(() => {
    const saved = loadVisitor();
    setVisitor(saved);

    if (saved?.conversationId) {
      getConnectConversation(saved.conversationId)
        .then(setConversation)
        .catch(() => setConversation(null));
    }
  }, []);

  useEffect(() => {
    if (!visitor?.conversationId) return;

    const refresh = async () => {
      try {
        const latest = await getConnectConversation(visitor.conversationId);
        if (latest) setConversation(latest);
      } catch {
        // mantém a conversa localmente na tela caso haja oscilação
      }
    };

    refresh();
    const interval = setInterval(refresh, open ? 4000 : 12000);
    return () => clearInterval(interval);
  }, [visitor?.conversationId, open]);

  const unread = useMemo(() => {
    if (!conversation) return 0;
    return (conversation.messages || []).filter(
      (item) => item.from === "support" && !item.readByClient
    ).length;
  }, [conversation]);

  useEffect(() => {
    if (!open || !conversation || unread === 0) return;
    connectAction("read", { conversationId: conversation.id })
      .then(setConversation)
      .catch(() => {});
  }, [open, conversation?.id, unread]);

  useEffect(() => {
    if (open && threadRef.current) {
      setTimeout(() => {
        threadRef.current?.scrollTo({
          top: threadRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 80);
    }
  }, [open, conversation?.messages?.length]);

  async function startConversation(event) {
    event.preventDefault();
    if (!profileForm.name.trim() || !profileForm.whatsapp.trim()) return;

    setSending(true);
    setStatusText("");

    try {
      const conversationId = makeId("onda");
      const now = new Date().toISOString();
      const visitorData = {
        id: makeId("visitor"),
        conversationId,
        name: profileForm.name.trim(),
        whatsapp: profileForm.whatsapp.trim(),
        topic: profileForm.topic,
      };

      const created = await connectAction("start", {
        conversation: {
          id: conversationId,
          site: "Onda Animal",
          channel: "SITE_ONDA",
          status: "ABERTA",
          topic: profileForm.topic,
          page: pathname,
          visitor: {
            name: visitorData.name,
            whatsapp: visitorData.whatsapp,
          },
          createdAt: now,
          initialMessage: {
            id: makeId("msg"),
            from: "support",
            text: `Olá, ${visitorData.name}! Você está falando com a Onda Animal pelo Forge Connect. Como podemos ajudar?`,
            date: now,
            readByClient: true,
            readBySupport: true,
          },
        },
      });

      localStorage.setItem(VISITOR_KEY, JSON.stringify(visitorData));
      setVisitor(visitorData);
      setConversation(created);
    } catch (error) {
      setStatusText(error.message || "Não foi possível iniciar o atendimento.");
    } finally {
      setSending(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || !conversation || sending) return;

    setSending(true);
    setStatusText("");

    try {
      const updated = await connectAction("message", {
        conversationId: conversation.id,
        message: {
          id: makeId("msg"),
          from: "client",
          text,
          date: new Date().toISOString(),
          readByClient: true,
          readBySupport: false,
        },
      });
      setConversation(updated);
      setMessage("");
    } catch (error) {
      setStatusText(error.message || "Não foi possível enviar sua mensagem.");
    } finally {
      setSending(false);
    }
  }

  function resetConversation() {
    localStorage.removeItem(VISITOR_KEY);
    setVisitor(null);
    setConversation(null);
    setProfileForm({
      name: "",
      whatsapp: "",
      topic: "Adoção de animal",
    });
    setStatusText("");
  }

  return (
    <div className="forge-connect-public">
      {open && (
        <section className="forge-connect-window" aria-label="Forge Connect">
          <header className="forge-connect-head">
            <div className="forge-connect-logo">FC</div>
            <div>
              <strong>Forge Connect</strong>
              <span><i /> Onda Animal • Atendimento</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar chat">×</button>
          </header>

          {!visitor || !conversation ? (
            <form className="forge-connect-identify" onSubmit={startConversation}>
              <div className="forge-connect-welcome-icon">💬</div>
              <h3>Olá! Como podemos ajudar?</h3>
              <p>
                Antes de iniciar, informe seus dados para que a equipe consiga
                continuar o atendimento caso você saia do site.
              </p>

              <label>
                <span>Seu nome</span>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Como podemos chamar você?"
                  required
                />
              </label>

              <label>
                <span>WhatsApp</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={profileForm.whatsapp}
                  onChange={(e) => setProfileForm({ ...profileForm, whatsapp: maskBrazilPhone(e.target.value) })}
                  placeholder="(51) 99999-9999"
                  maxLength={15}
                  required
                />
              </label>

              <label>
                <span>Assunto</span>
                <select
                  value={profileForm.topic}
                  onChange={(e) => setProfileForm({ ...profileForm, topic: e.target.value })}
                >
                  {TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
                </select>
              </label>

              {statusText && <div className="forge-connect-status-error">{statusText}</div>}

              <button className="forge-connect-start" type="submit" disabled={sending}>
                {sending ? "Conectando..." : "Iniciar conversa"}
              </button>
              <small>Atendimento realizado pela equipe Onda Animal.</small>
            </form>
          ) : (
            <>
              <div className="forge-connect-context">
                <div>
                  <small>ASSUNTO</small>
                  <strong>{conversation.topic}</strong>
                </div>
                <button type="button" onClick={resetConversation}>Nova conversa</button>
              </div>

              <div className="forge-connect-thread" ref={threadRef}>
                {(conversation.messages || []).map((item) => (
                  <div
                    className={`forge-connect-message ${item.from === "client" ? "client" : "support"}`}
                    key={item.id}
                  >
                    <p>{item.text}</p>
                    <small>
                      {item.from === "client" ? "Você" : "Onda Animal"} •{" "}
                      {new Date(item.date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                ))}
              </div>

              {statusText && <div className="forge-connect-status-error inline">{statusText}</div>}

              <form className="forge-connect-compose" onSubmit={sendMessage}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  autoComplete="off"
                />
                <button type="submit" aria-label="Enviar mensagem" disabled={sending}>➤</button>
              </form>

              <footer className="forge-connect-footer">
                <span>Powered by</span> <strong>Forge Connect</strong>
              </footer>
            </>
          )}
        </section>
      )}

      <button
        className={open ? "forge-connect-bubble open" : "forge-connect-bubble"}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir Forge Connect"
      >
        <span className="forge-connect-bubble-icon">{open ? "×" : "💬"}</span>
        {!open && (
          <span className="forge-connect-bubble-copy">
            <b>Forge Connect</b>
            <small>Fale com a Onda</small>
          </span>
        )}
        {!open && unread > 0 && <em>{unread}</em>}
      </button>
    </div>
  );
}
