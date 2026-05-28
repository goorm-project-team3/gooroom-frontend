import { useFileTreeStore } from '@/stores/fileTreeStore';
import { useRoomStore } from '@/stores/roomStore';
import { Client } from '@stomp/stompjs';
import type * as MonacoType from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FileEditChange {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
}

interface FileEditBroadcast {
  type: 'EDIT';
  changes: FileEditChange[];
  version: number;
  editorId: number;
  editorNickname: string;
  timestamp: string;
}

interface FileSyncBroadcast {
  type: 'FULL';
  content: string;
  version: number;
  timestamp: string;
}

export function useFileEditSocket(
  fileId: string | null,
  editorRef: React.RefObject<MonacoType.editor.IStandaloneCodeEditor | null>,
  versionRef: React.MutableRefObject<number>,
) {
  const roomId = useRoomStore((s) => s.roomId);
  const role = useRoomStore((s) => s.role);
  const myUserId = useRoomStore((s) => s.myUserId);
  const { updateFileContent } = useFileTreeStore();

  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const pendingSyncContentRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  /** STOMP client 생성 및 연결 */
  useEffect(() => {
    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,
      reconnectDelay: 3000,
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error('[STOMP ERROR]', frame);
        console.error('message:', frame.headers['message']);
        console.error('details:', frame.body);
      },
    });
    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    pendingSyncContentRef.current = null;
  }, [fileId]);

  /** 파일 선택 시 sync 요청 + sync/edit 구독 */
  useEffect(() => {
    const client = clientRef.current;

    if (!isConnected || !client || !roomId || !fileId) return;

    /** sync 구독 - 전체 content + version */
    const syncSub = client.subscribe(`/topic/room/${roomId}/file/${fileId}/sync`, (msg) => {
      const broadcast: FileSyncBroadcast = JSON.parse(msg.body);
      updateFileContent(fileId, broadcast.content);
      versionRef.current = broadcast.version;

      if (editorRef.current) {
        isSyncingRef.current = true;
        editorRef.current.setValue(broadcast.content);
        isSyncingRef.current = false;
      } else {
        pendingSyncContentRef.current = broadcast.content;
      }
    });

    /** FileSync 요청 - 초기 버전 수신 */
    client.publish({
      destination: `/app/room/${roomId}/file/${fileId}/sync`,
      body: JSON.stringify({ type: 'FULL' }),
    });

    /** edit 구독 - 변경 사항 수신 */
    const editSub = client.subscribe(`/topic/room/${roomId}/file/${fileId}/edit`, (msg) => {
      const broadcast: FileEditBroadcast = JSON.parse(msg.body);

      /** 발행자가 본인이면 건너뜀 */
      if (broadcast.editorId === myUserId) {
        if (broadcast.version > versionRef.current) {
          versionRef.current = broadcast.version;
        }
        return;
      }

      /** 버전 불일치 시 전체 재동기화 요청 */
      if (broadcast.version !== versionRef.current + 1) {
        client.publish({
          destination: `/app/room/${roomId}/file/${fileId}/sync`,
          body: JSON.stringify({ type: 'FULL' }),
        });
        return;
      }

      /** Monaco Editor에 변경 사항 적용 */
      const model = editorRef.current?.getModel();
      if (model) {
        model.applyEdits(
          broadcast.changes.map((change) => ({
            range: change.range,
            text: change.text,
          })),
        );
      }

      versionRef.current = broadcast.version;
    });

    return () => {
      syncSub.unsubscribe();
      editSub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, roomId, fileId, myUserId]);

  /** OWNER의 편집 발행 */
  const publishEdit = useCallback(
    (changes: FileEditChange[]) => {
      if (!clientRef.current?.connected || !fileId || !roomId || role !== 'OWNER') return;

      clientRef.current.publish({
        destination: `/app/room/${roomId}/file/${fileId}/edit`,
        body: JSON.stringify({
          type: 'EDIT',
          version: versionRef.current,
          changes,
        }),
      });

      versionRef.current += 1;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileId, roomId, role],
  );

  return { publishEdit, pendingSyncContentRef, isSyncingRef };
}
