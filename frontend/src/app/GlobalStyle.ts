import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.primary};
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }
  a { color: ${({ theme }) => theme.colors.accent}; text-decoration: none; }
  a:hover { text-decoration: underline; }
  ::selection { background: ${({ theme }) => theme.colors.accent2}; color: #fff; }

  /* Responsive defaults */
  img, video, canvas { max-width: 100%; height: auto; }
  pre { overflow: auto; white-space: pre-wrap; word-wrap: break-word; }
  code { white-space: pre-wrap; }
  table { width: 100%; border-collapse: collapse; }
  .table-wrap { overflow-x: auto; }

  /* Tránh tràn ngang khi sidebar trượt */
  html, body { overflow-x: hidden; }
`;
