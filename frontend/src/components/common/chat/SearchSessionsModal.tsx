import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import type { ChatSession } from "@/services/sessions";
import { useI18n } from "@/app/i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onChoose: (sessionId: string) => void;
};

export default function SearchSessionsModal({
  open,
  onClose,
  sessions,
  onChoose,
}: Props) {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return sessions;
    return sessions.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(k) ||
        (s.last_message_preview || "").toLowerCase().includes(k)
    );
  }, [q, sessions]);

  const groups = useMemo(() => groupByTime(filtered), [filtered]);

  if (!open) return null;
  
  const modalContent = (
    <Overlay onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Header>
          <input
            autoFocus
            placeholder={t("search") || "Tìm hội thoại…"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </Header>
        <Body>
          {Object.entries(groups).map(([label, items]) => (
            <div key={label} className="group">
              <div className="gtitle">
                <span>{label}</span>
                <em>{items.length}</em>
              </div>
              {items.map((s) => (
                <div
                  className="row"
                  key={s.session_id}
                  onClick={() => {
                    onChoose(s.session_id);
                    onClose();
                  }}
                >
                  <div className="title">{s.title || "New chat"}</div>
                  <div className="preview">{S(s.last_message_preview)}</div>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <Empty>{t("noSessions") || "Không có phiên nào"}</Empty>
          )}
        </Body>
      </Card>
    </Overlay>
  );

  return createPortal(modalContent, document.body);
}

function groupByTime(items: ChatSession[]): Record<string, ChatSession[]> {
  const out: Record<string, ChatSession[]> = {};
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const oneDay = 86400000;
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  for (const s of items) {
    const u = s.updated_at || s.created_at || "";
    let time = Date.parse(u);
    if (!isFinite(time)) time = Date.now();
    const day = startOf(new Date(time));
    let bucket = "Trước đó";
    if (day >= today) bucket = "Hôm nay";
    else if (day >= today - oneDay) bucket = "Hôm qua";
    else if (day >= today - 7 * oneDay) bucket = "7 ngày qua";
    else if (day >= today - 30 * oneDay) bucket = "30 ngày qua";
    (out[bucket] ||= []).push(s);
  }
  for (const k of Object.keys(out)) {
    out[k].sort(
      (a, b) =>
        Date.parse(b.updated_at || b.created_at || "") -
        Date.parse(a.updated_at || a.created_at || "")
    );
  }
  return out;
}

const S = (s?: string | null) => (s ? s : "");

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Card = styled.div`
  width: min(920px, 94vw);
  height: min(80vh, 700px);
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(13, 148, 136, 0.1);
  display: grid;
  grid-template-rows: auto 1fr;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const Header = styled.div`
  display: flex;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  input {
    flex: 1;
    background: ${({ theme }) => theme.colors.surface2};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.12s ease, box-shadow 0.12s ease;
  }
  input:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.accent}30`};
  }
  button {
    min-width: 36px;
    height: 36px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface2};
    color: ${({ theme }) => theme.colors.secondary};
  }
  button:hover {
    color: ${({ theme }) => theme.colors.accent2};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => `${theme.colors.accent}20`};
  }
`;

const Body = styled.div`
  overflow: auto;
  padding: 10px 12px;

  .group {
    padding: 8px 4px;
  }
  .gtitle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.secondary};
    padding: 6px 8px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .gtitle em {
    font-style: normal;
    font-weight: 700;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.accent2};
    background: ${({ theme }) => theme.colors.surface2};
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 2px 6px;
    border-radius: 999px;
  }

  .row {
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radii.md};
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.12s ease, border-color 0.12s ease,
      transform 0.06s ease;
  }
  .row:hover {
    background: ${({ theme }) => theme.colors.surface2};
    border-color: ${({ theme }) => theme.colors.border};
  }
  .row:active {
    transform: scale(0.997);
  }

  .title {
    font-weight: 700;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.primary};
  }
  .preview {
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Empty = styled.div`
  opacity: 0.8;
  text-align: center;
  padding: 18px;
  color: ${({ theme }) => theme.colors.secondary};
`;
