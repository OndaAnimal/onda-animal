import { NextResponse } from "next/server";
import {
  addMessage,
  createConversation,
  getConversation,
  markConversationRead,
} from "../../../lib/serverStore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Conversa não informada." }, { status: 400 });

    const conversation = await getConversation(id);
    if (!conversation) return NextResponse.json({ data: null }, { status: 404 });

    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error("connect get error", error);
    return NextResponse.json({ error: "Forge Connect indisponível." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === "start") {
      const payload = body.conversation;
      if (!payload?.id || !payload?.visitor?.name || !payload?.visitor?.whatsapp) {
        return NextResponse.json({ error: "Identificação incompleta." }, { status: 400 });
      }
      const data = await createConversation(payload);
      return NextResponse.json({ data }, { status: 201 });
    }

    if (action === "message") {
      if (!body.conversationId || !body.message?.text) {
        return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
      }
      await addMessage(body.conversationId, body.message);
      const data = await getConversation(body.conversationId);
      return NextResponse.json({ data });
    }

    if (action === "read") {
      if (!body.conversationId) {
        return NextResponse.json({ error: "Conversa inválida." }, { status: 400 });
      }
      await markConversationRead(body.conversationId, "client");
      const data = await getConversation(body.conversationId);
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("connect post error", error);
    return NextResponse.json({ error: "Não foi possível atualizar a conversa." }, { status: 500 });
  }
}
