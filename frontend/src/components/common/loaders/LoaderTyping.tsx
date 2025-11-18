import styled from "styled-components";

export default function LoaderTyping() {
  return (
    <Wrap aria-label="Đang soạn">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </Wrap>
  );
}

const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  box-shadow: ${({ theme }) => theme.shadow};

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.accent2};
    opacity: 0.6;
    transform: translateY(0);
    animation: bounce 1.2s infinite ease-in-out;
  }
  .dot:nth-child(2) {
    animation-delay: 0.15s;
    background: ${({ theme }) => theme.colors.accent};
  }
  .dot:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }
    40% {
      transform: translateY(-6px);
      opacity: 1;
    }
  }
`;
