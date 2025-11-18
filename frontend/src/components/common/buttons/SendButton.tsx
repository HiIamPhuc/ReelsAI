import React from "react";
import styled from "styled-components";

type Props = {
  onClick: () => void;
  label?: string;
  size?: number; // px
  disabled?: boolean;
};

const SendButton: React.FC<Props> = ({
  onClick,
  label = "Gửi",
  size = 18,
  disabled,
}) => {
  const hasLabel = !!label?.trim();
  return (
    <SendWrap data-has-label={hasLabel ? "1" : "0"}>
      <button
        onClick={onClick}
        aria-label={label || "Gửi"}
        title={label || "Gửi"}
        disabled={disabled}
        style={{ ["--icon" as any]: `${size}px` }}
      >
        <div className="plane">
          <div className="plane-bob">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={size}
              height={size}
              aria-hidden="true"
              focusable="false"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                fill="currentColor"
                d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
              />
            </svg>
          </div>
        </div>
        {hasLabel && <span className="label">{label}</span>}
      </button>
    </SendWrap>
  );
};

export default SendButton;

const SendWrap = styled.div`
  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    overflow: hidden;
    white-space: nowrap;

    /* sizing */
    --icon: 18px;
    --padX: 0.9em;
    --gapL: 0.45em;
    font-family: inherit;
    font-size: 0.95rem;
    color: #fff;
    padding: 0.55em var(--padX);
    border: none;
    border-radius: 12px;
    cursor: pointer;

    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.accent},
      ${({ theme }) => theme.colors.accent2}
    );
    box-shadow: 0 6px 18px ${({ theme }) => `${theme.colors.accent}40`};

    transition: transform .15s ease, filter .15s ease, box-shadow .15s ease, opacity .15s ease;
  }

  /* chừa chỗ icon khi có label (desktop) */
  &[data-has-label="1"] button {
    padding-left: calc(var(--padX) + var(--icon) + var(--gapL));
  }

  button:hover { filter: brightness(.97); }
  button:active { transform: scale(.98); }
  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.accent}40`}, 0 6px 18px ${({ theme }) => `${theme.colors.accent}40`};
  }

  /* ICON */
  .plane {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: var(--icon);
    height: var(--icon);
    display: grid;
    place-items: center;
    transform-origin: center;
    transition: left .35s ease, transform .35s ease, opacity .2s ease;
  }
  &[data-has-label="1"] .plane { left: var(--padX); }
  &[data-has-label="0"] .plane { left: 50%; transform: translate(-50%, -50%); }

  .plane-bob { transition: transform .35s ease; }
  @keyframes fly-1 { from { transform: translateY(.08em); } to { transform: translateY(-.08em); } }

  .label {
    display: inline-block;
    transition: transform .35s ease, opacity .35s ease;
    will-change: transform;
  }

  /* Hover effects (chỉ thiết bị có hover) */
  @media (hover: hover) and (pointer: fine) {
    &[data-has-label="1"] button:hover .plane {
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg) scale(1.08);
    }
    button:hover .plane-bob { 
      animation: fly-1 .6s ease-in-out infinite alternate; 
    }
    &[data-has-label="1"] button:hover .label { 
      transform: translateX(120%); 
      opacity: 0; 
    }
    button:hover {
      box-shadow: 0 8px 24px ${({ theme }) => `${theme.colors.accent}60`};
    }
  }

  /* Fallback cho mọi thiết bị nếu media query không hoạt động */
  &[data-has-label="1"] button:hover .plane {
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg) scale(1.08);
  }
  button:hover .plane-bob { 
    animation: fly-1 .6s ease-in-out infinite alternate; 
  }
  &[data-has-label="1"] button:hover .label { 
    transform: translateX(120%); 
    opacity: 0; 
  }
  button:hover {
    box-shadow: 0 8px 24px ${({ theme }) => `${theme.colors.accent}60`};
  }

  /* DISABLED */
  button[disabled] { opacity: .6; cursor: not-allowed; filter: grayscale(.1); }

  /* ===== MOBILE COMPACT ===== */
  @media (max-width: 600px) {
    /* ẩn label, dùng nút tròn chỉ-icon */
    &[data-has-label] .label { display: none; }

    &[data-has-label] button {
      width:  var(--iconBtn, 38px);   /* lấy từ parent; fallback 38px */
      height: var(--iconBtn, 38px);
      min-width: var(--iconBtn, 38px);
      padding: 0;
      border-radius: 999px;
      font-size: 0; /* tránh text ẩn ảnh hưởng layout */
    }
    &[data-has-label] .plane {
      left: 50%;
      transform: translate(-50%, -50%);
    }
    /* to icon hơn 1 chút */
    &[data-has-label] button { --icon: 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .plane, .label { transition: none; animation: none; }
    button { transition: none; }
  }
`;
