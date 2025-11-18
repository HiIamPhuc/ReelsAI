import styled from "styled-components";
import { useI18n } from "@/app/i18n";

export default function SettingsPage() {
  const { lang, setLang, t } = useI18n();

  return (
    <Wrap>
      <h1 className="pageTitle">{t("settings")}</h1>

      <section className="card">
        <header className="cardHead">{t("language")}</header>
        <div className="seg" role="tablist" aria-label={t("language")}>
          <button
            role="tab"
            className={lang === "vi" ? "opt active" : "opt"}
            onClick={() => setLang("vi")}
            aria-selected={lang === "vi"}
            aria-pressed={lang === "vi"}
          >
            VI
          </button>
          <button
            role="tab"
            className={lang === "en" ? "opt active" : "opt"}
            onClick={() => setLang("en")}
            aria-selected={lang === "en"}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>
      </section>
    </Wrap>
  );
}

const Wrap = styled.div`
  padding: 20px;
  max-width: 920px;
  margin: 0 auto;

  .pageTitle {
    font-size: 1.25rem;
    font-weight: 800;
    margin: 2px 0 14px;
    color: ${({ theme }) => theme.colors.accent2};
  }

  .card {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 14px;
    box-shadow: ${({ theme }) => theme.shadow};
  }
  .cardHead {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 10px;
  }

  .seg {
    display: inline-flex;
    gap: 10px;
  }
  .opt {
    height: 36px;
    min-width: 64px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff;
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 800;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s,
      color 0.2s, transform 0.08s;
  }
  .opt:hover {
    background: #fff5ef;
    border-color: #f0d2c5;
  }

  .opt.active {
    background:
      linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.accent},
        ${({ theme }) => theme.colors.accent2}
      ) padding-box,
      linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.accent},
        ${({ theme }) => theme.colors.accent2}
      ) border-box;
    border: 1px solid transparent; 
    color: #fff;
    box-shadow: 0 6px 16px rgba(206, 122, 88, 0.35);
    transform: translateY(-1px);
  }
  .opt.active:hover {
    box-shadow: 0 8px 18px rgba(206, 122, 88, 0.42);
  }
`;
