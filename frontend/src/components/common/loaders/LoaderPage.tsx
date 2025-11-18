import styled from "styled-components";

const LoaderPage = () => {
  return (
    <StyledWrapper aria-label="loading" role="img">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        height="128"
        width="128"
        className="pl"
      >
        <defs>
          <linearGradient id="gradA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent2)" />
          </linearGradient>
          <linearGradient id="gradB" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent2)" />
          </linearGradient>
        </defs>

        <circle
          strokeDashoffset="-376.4"
          strokeDasharray="377 377"
          strokeLinecap="round"
          transform="rotate(-90,64,64)"
          strokeWidth={8}
          stroke="url(#gradA)"
          fill="none"
          r={60}
          cy={64}
          cx={64}
          className="pl__ring1"
        />
        <circle
          strokeDashoffset="-329.3"
          strokeDasharray="329.9 329.9"
          strokeLinecap="round"
          transform="rotate(-90,64,64)"
          strokeWidth={7}
          stroke="url(#gradB)"
          fill="none"
          r="52.5"
          cy={64}
          cx={64}
          className="pl__ring2"
        />
        <circle
          strokeDashoffset="-288.6"
          strokeDasharray="289 289"
          strokeLinecap="round"
          transform="rotate(-90,64,64)"
          strokeWidth={6}
          stroke="url(#gradA)"
          fill="none"
          r={46}
          cy={64}
          cx={64}
          className="pl__ring3"
        />
        <circle
          strokeDashoffset={-254}
          strokeDasharray="254.5 254.5"
          strokeLinecap="round"
          transform="rotate(-90,64,64)"
          strokeWidth={5}
          stroke="url(#gradB)"
          fill="none"
          r="40.5"
          cy={64}
          cx={64}
          className="pl__ring4"
        />
        <circle
          strokeDashoffset="-225.8"
          strokeDasharray="226.2 226.2"
          strokeLinecap="round"
          transform="rotate(-90,64,64)"
          strokeWidth={4}
          stroke="url(#gradA)"
          fill="none"
          r={36}
          cy={64}
          cx={64}
          className="pl__ring5"
        />
        <circle
          strokeDashoffset="-203.9"
          strokeDasharray="204.2 204.2"
          strokeLinecap="round"
          transform="rotate(-90,64,64)"
          strokeWidth={3}
          stroke="url(#gradB)"
          fill="none"
          r="32.5"
          cy={64}
          cx={64}
          className="pl__ring6"
        />
      </svg>
    </StyledWrapper>
  );
};

export default LoaderPage;

const StyledWrapper = styled.div`
  --accent: ${({ theme }) => theme.colors.accent};
  --accent2: ${({ theme }) => theme.colors.accent2};

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.08));

  .pl {
    width: 8em;
    height: 8em;
  }
  .pl circle {
    transform-box: fill-box;
    transform-origin: 50% 50%;
  }

  .pl__ring1 {
    animation: ring1_ 4s 0s ease-in-out infinite;
  }
  .pl__ring2 {
    animation: ring2_ 4s 0.04s ease-in-out infinite;
  }
  .pl__ring3 {
    animation: ring3_ 4s 0.08s ease-in-out infinite;
  }
  .pl__ring4 {
    animation: ring4_ 4s 0.12s ease-in-out infinite;
  }
  .pl__ring5 {
    animation: ring5_ 4s 0.16s ease-in-out infinite;
  }
  .pl__ring6 {
    animation: ring6_ 4s 0.2s ease-in-out infinite;
  }

  @keyframes ring1_ {
    from {
      stroke-dashoffset: -376.237129776;
      transform: rotate(-0.25turn);
      animation-timing-function: ease-in;
    }
    23% {
      stroke-dashoffset: -94.247778;
      transform: rotate(1turn);
      animation-timing-function: ease-out;
    }
    46%,
    50% {
      stroke-dashoffset: -376.237129776;
      transform: rotate(2.25turn);
      animation-timing-function: ease-in;
    }
    73% {
      stroke-dashoffset: -94.247778;
      transform: rotate(3.5turn);
      animation-timing-function: ease-out;
    }
    96%,
    to {
      stroke-dashoffset: -376.237129776;
      transform: rotate(4.75turn);
    }
  }
  @keyframes ring2_ {
    from {
      stroke-dashoffset: -329.207488554;
      transform: rotate(-0.25turn);
      animation-timing-function: ease-in;
    }
    23% {
      stroke-dashoffset: -82.46680575;
      transform: rotate(1turn);
      animation-timing-function: ease-out;
    }
    46%,
    50% {
      stroke-dashoffset: -329.207488554;
      transform: rotate(2.25turn);
      animation-timing-function: ease-in;
    }
    73% {
      stroke-dashoffset: -82.46680575;
      transform: rotate(3.5turn);
      animation-timing-function: ease-out;
    }
    96%,
    to {
      stroke-dashoffset: -329.207488554;
      transform: rotate(4.75turn);
    }
  }
  @keyframes ring3_ {
    from {
      stroke-dashoffset: -288.4484661616;
      transform: rotate(-0.25turn);
      animation-timing-function: ease-in;
    }
    23% {
      stroke-dashoffset: -72.2566298;
      transform: rotate(1turn);
      animation-timing-function: ease-out;
    }
    46%,
    50% {
      stroke-dashoffset: -288.4484661616;
      transform: rotate(2.25turn);
      animation-timing-function: ease-in;
    }
    73% {
      stroke-dashoffset: -72.2566298;
      transform: rotate(3.5turn);
      animation-timing-function: ease-out;
    }
    96%,
    to {
      stroke-dashoffset: -288.4484661616;
      transform: rotate(4.75turn);
    }
  }
  @keyframes ring4_ {
    from {
      stroke-dashoffset: -253.9600625988;
      transform: rotate(-0.25turn);
      animation-timing-function: ease-in;
    }
    23% {
      stroke-dashoffset: -63.61725015;
      transform: rotate(1turn);
      animation-timing-function: ease-out;
    }
    46%,
    50% {
      stroke-dashoffset: -253.9600625988;
      transform: rotate(2.25turn);
      animation-timing-function: ease-in;
    }
    73% {
      stroke-dashoffset: -63.61725015;
      transform: rotate(3.5turn);
      animation-timing-function: ease-out;
    }
    96%,
    to {
      stroke-dashoffset: -253.9600625988;
      transform: rotate(4.75turn);
    }
  }
  @keyframes ring5_ {
    from {
      stroke-dashoffset: -225.7422778656;
      transform: rotate(-0.25turn);
      animation-timing-function: ease-in;
    }
    23% {
      stroke-dashoffset: -56.5486668;
      transform: rotate(1turn);
      animation-timing-function: ease-out;
    }
    46%,
    50% {
      stroke-dashoffset: -225.7422778656;
      transform: rotate(2.25turn);
      animation-timing-function: ease-in;
    }
    73% {
      stroke-dashoffset: -56.5486668;
      transform: rotate(3.5turn);
      animation-timing-function: ease-out;
    }
    96%,
    to {
      stroke-dashoffset: -225.7422778656;
      transform: rotate(4.75turn);
    }
  }
  @keyframes ring6_ {
    from {
      stroke-dashoffset: -203.795111962;
      transform: rotate(-0.25turn);
      animation-timing-function: ease-in;
    }
    23% {
      stroke-dashoffset: -51.05087975;
      transform: rotate(1turn);
      animation-timing-function: ease-out;
    }
    46%,
    50% {
      stroke-dashoffset: -203.795111962;
      transform: rotate(2.25turn);
      animation-timing-function: ease-in;
    }
    73% {
      stroke-dashoffset: -51.05087975;
      transform: rotate(3.5turn);
      animation-timing-function: ease-out;
    }
    96%,
    to {
      stroke-dashoffset: -203.795111962;
      transform: rotate(4.75turn);
    }
  }
`;
