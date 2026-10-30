import { NextRequest, NextResponse } from "next/server";
import {
  getServerRoom,
  serverAdvanceRound,
  serverJoinPlayer,
  serverSpawnBots,
  serverSubmitOrder,
  serverTriggerNews,
  setServerRoom,
} from "@/lib/server/roomStore";
import { createInitialRoom } from "@/lib/sync/syncService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "WALLST").toUpperCase();
  const room = getServerRoom(code);
  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, data } = body;
    const upperCode = (code || "WALLST").toUpperCase();

    if (action === "JOIN") {
      const room = serverJoinPlayer(upperCode, data);
      return NextResponse.json({ success: true, room });
    }

    if (action === "ORDER") {
      const result = serverSubmitOrder(upperCode, data);
      return NextResponse.json(result);
    }

    if (action === "NEWS") {
      const room = serverTriggerNews(upperCode, data);
      return NextResponse.json({ success: true, room });
    }

    if (action === "ADVANCE_ROUND") {
      const room = serverAdvanceRound(upperCode);
      return NextResponse.json({ success: true, room });
    }

    if (action === "SPAWN_BOTS") {
      const room = serverSpawnBots(upperCode, data?.count || 30);
      return NextResponse.json({ success: true, room });
    }

    if (action === "UPDATE_STATUS") {
      const room = getServerRoom(upperCode);
      const updated = { ...room, status: data.status };
      setServerRoom(updated);
      return NextResponse.json({ success: true, room: updated });
    }

    if (action === "RESET") {
      const init = createInitialRoom(upperCode);
      setServerRoom(init);
      return NextResponse.json({ success: true, room: init });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("API /api/room error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
