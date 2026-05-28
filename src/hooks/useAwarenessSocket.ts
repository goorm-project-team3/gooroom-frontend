import { useRoomStore } from '@/stores/roomStore';
import { Client } from '@stomp/stompjs';
import * as MonacoType from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface AwarenessCursor {
  lineNumber: number;
  column: number;
}

interface AwarenessSelection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface AwarenessBroadcast {
  cursor: AwarenessCursor;
  selection: AwarenessSelection | null;
  userId: number;
  nickname: string;
  color: string;
}

type DecorationMap = Map<number, MonacoType.editor.IEditorDecorationsCollection>;

export function useAwarenessSocket(
  fileId: string | null,
  editorRef: React.RefObject<MonacoType.editor.IStandaloneCodeEditor | null>,
) {
  const roomId = useRoomStore((s) => s.roomId);
  const myUserId = useRoomStore((s) => s.myUserId);
  const role = useRoomStore((s) => s.role);

  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const decorationMap = useRef<DecorationMap>(new Map());
  const lastPublishTime = useRef(0);

  useEffect(() => {
    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,
      reconnectDelay: 3000,
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => console.error('[STOMP ERROR] Awareness Error', frame),
    });
    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;

    if (editor) {
      decorationMap.current.forEach((collection) => collection.clear());
      decorationMap.current.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  useEffect(() => {
    const client = clientRef.current;
    if (!isConnected || !client || !fileId || !roomId) return;

    const sub = client.subscribe(`/topic/room/${roomId}/file/${fileId}/awareness`, (msg) => {
      const broadcast: AwarenessBroadcast = JSON.parse(msg.body);

      if (broadcast.userId === myUserId) return;

      const editor = editorRef.current;
      if (!editor) return;

      const newDecorations: MonacoType.editor.IModelDeltaDecoration[] = [];

      newDecorations.push({
        range: {
          startLineNumber: broadcast.cursor.lineNumber,
          startColumn: broadcast.cursor.column,
          endLineNumber: broadcast.cursor.lineNumber,
          endColumn: broadcast.cursor.column + 1,
        },
        options: {
          className: `remote-cursor-${broadcast.userId}`,
          stickiness: MonacoType.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      });

      const sel = broadcast.selection;
      if (
        sel &&
        !(sel.startLineNumber === sel.endLineNumber && sel.startColumn === sel.endColumn)
      ) {
        newDecorations.push({
          range: sel,
          options: {
            className: `remote-selection-${broadcast.userId}`,
            stickiness: MonacoType.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        });
      }

      const existing = decorationMap.current.get(broadcast.userId);
      if (existing) {
        existing.set(newDecorations);
      } else {
        const collection = editor.createDecorationsCollection(newDecorations);
        decorationMap.current.set(broadcast.userId, collection);
      }

      injectCursorStyle(broadcast.userId, '#f59e0b');
    });

    return () => {
      sub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, fileId, roomId, myUserId]);

  const publishAwareness = useCallback(
    (cursor: AwarenessCursor, selection: AwarenessSelection | null) => {
      if (!clientRef.current?.connected || !fileId || !roomId) return;
      if (role !== 'OWNER') return;

      const now = Date.now();
      if (now - lastPublishTime.current < 100) return;
      lastPublishTime.current = now;

      clientRef.current.publish({
        destination: `/app/room/${roomId}/file/${fileId}/awareness`,
        body: JSON.stringify({
          cursor,
          selection,
        }),
      });
    },
    [fileId, roomId, role],
  );

  return { publishAwareness };
}

function injectCursorStyle(userId: number, color: string) {
  const styleId = `cursor-style-${userId}`;

  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  const rgba = hexToRgba(color, 0.8);
  style.textContent = `
    .remote-cursor-${userId} { border-left: 2px solid ${color}; margin-left: -1px; }
    .remote-selection-${userId} { background-color: ${rgba}; }`;
  document.head.appendChild(style);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
