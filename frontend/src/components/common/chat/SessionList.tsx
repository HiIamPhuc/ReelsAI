import styled from "styled-components";
import SessionItem from "./SessionItem";

export type Session = { id: string; title: string; active?: boolean };

type Props = {
  items: Session[];
  onSelect?: (id: string) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function SessionList({
  items,
  onSelect,
  onRename,
  onDelete,
}: Props) {
  if (!items?.length) return <Empty className="empty">Chưa có phiên nào</Empty>;
  return (
    <Wrap>
      <div className="list">
        {items.map((s) => (
          <SessionItem
            key={s.id}
            title={s.title}
            active={!!s.active}
            onClick={() => onSelect?.(s.id)}
            onRename={() => onRename?.(s.id)}
            onDelete={() => onDelete?.(s.id)}
          />
        ))}
      </div>
    </Wrap>
  );
}

/* ============ styles ============ */
const Wrap = styled.div`
  /* Để parent kiểm soát chiều cao & cuộn */
  .list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

const Empty = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  padding: 6px 4px;
`;
