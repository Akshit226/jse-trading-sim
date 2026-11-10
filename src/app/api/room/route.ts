import { NextRequest, NextResponse } from "next/server";
import {
  fetchRemoteRoom,
  getServerRoom,
  patchRemoteRoomStatus,
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

  // Check remote Firebase RTDB first for cross-container synchrony
  const remote = await fetchRemoteRoom(code);
  if (remote) {
    setServerRoom(remote);
    return NextResponse.json({ success: true, room: remote });
  }

  const room = getServerRoom(code);
  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, data } = body;
    const upperCode = (code || "WALLST").toUpperCase();

    // Check remote Firebase RTDB first so serverless containers always operate on latest room state
    if (action !== "RESET") {
      const remote = await fetchRemoteRoom(upperCode);
      if (remote) {
        setServerRoom(remote);
      }
    }

    if (action === "JOIN") {
      const playerPayload = data?.player || data;
      const clientStatus = data?.clientStatus;
      const room = serverJoinPlayer(upperCode, playerPayload, clientStatus);
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
      patchRemoteRoomStatus(upperCode, data.status);
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
