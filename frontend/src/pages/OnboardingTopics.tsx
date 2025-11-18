import styled from "styled-components";
import { useState } from "react";
import { useI18n } from "@/app/i18n";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/app/toast";
import TopicIcon from "@/components/common/TopicIcon";

const TOPICS = [
  { id: "animals", labelKey: "topicAnimals" },
  { id: "anime", labelKey: "topicAnime" },
  { id: "art", labelKey: "topicArt" },
  { id: "beauty", labelKey: "topicBeauty" },
  { id: "books", labelKey: "topicBooks" },
  { id: "business", labelKey: "topicBusiness" },
  { id: "dance", labelKey: "topicDance" },
  { id: "education", labelKey: "topicEducation" },
  { id: "entertainment", labelKey: "topicEntertainment" },
  { id: "fashion", labelKey: "topicFashion" },
  { id: "food", labelKey: "topicFood" },
  { id: "gaming", labelKey: "topicGaming" },
  { id: "health", labelKey: "topicHealth" },
  { id: "lifestyle", labelKey: "topicLifestyle" },
  { id: "music", labelKey: "topicMusic" },
  { id: "personal", labelKey: "topicPersonal" },
  { id: "photography", labelKey: "topicPhotography" },
  { id: "sports", labelKey: "topicSports" },
  { id: "tech", labelKey: "topicTech" },
  { id: "travel", labelKey: "topicTravel" },
  { id: "other", labelKey: "topicOther" },
];

export default function OnboardingTopics() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, topicId];
      }
    });
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/app", { replace: true });
  };

  const handleContinue = () => {
    if (selectedTopics.length === 0) {
      notify({
        title: t("error"),
        content: t("onboardingSelectMin"),
        tone: "error",
      });
      return;
    }

    localStorage.setItem("userTopics", JSON.stringify(selectedTopics));
    localStorage.setItem("onboardingCompleted", "true");
    
    notify({
      title: t("saved"),
      content: t("onboardingSuccess"),
      tone: "success",
    });

    navigate("/app", { replace: true });
  };

  const canContinue = selectedTopics.length > 0;

  return (
    <Wrap>
      <Container>
        <Header>
          <Logo>
            <span className="icon">🎬</span>
            <span className="text">ReelsAI</span>
          </Logo>
          <SkipButton onClick={handleSkip}>{t("onboardingSkip")}</SkipButton>
        </Header>

        <Content>
          <Title>{t("onboardingTitle")}</Title>
          <Subtitle>{t("onboardingSubtitle")}</Subtitle>

          <ProgressText>
            {t("topicsSelected")} {selectedTopics.length} {t("topicsOf")} 5 {t("topicsMax")}
          </ProgressText>

          <TopicsGrid>
            {TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              const isDisabled = !isSelected && selectedTopics.length >= 5;

              return (
                <TopicCard
                  key={topic.id}
                  onClick={() => !isDisabled && toggleTopic(topic.id)}
                  className={`${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                >
                  <TopicIcon id={topic.id} size={40} className="icon" />
                  <span className="label">{t(topic.labelKey)}</span>
                  {isSelected && (
                    <CheckIcon>
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path
                          fill="currentColor"
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        />
                      </svg>
                    </CheckIcon>
                  )}
                </TopicCard>
              );
            })}
          </TopicsGrid>

          <ContinueButton onClick={handleContinue} disabled={!canContinue}>
            {t("onboardingContinue")}
          </ContinueButton>
        </Content>
      </Container>
    </Wrap>
  );
}

/* ===================== Styles ===================== */
const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(13, 148, 136, 0.05) 0%, 
    rgba(244, 244, 245, 1) 50%,
    rgba(13, 148, 136, 0.03) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  /* Animated background circles */
  &::before {
    content: "";
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%);
    top: -250px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
  }

  &::after {
    content: "";
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(13, 148, 136, 0.06) 0%, transparent 70%);
    bottom: -200px;
    left: -100px;
    animation: float 10s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.1); }
  }
`;

const Container = styled.div`
  max-width: 900px;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(13, 148, 136, 0.15);
  padding: 32px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(13, 148, 136, 0.1);

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  .icon {
    font-size: 2rem;
  }
`;

const SkipButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(13, 148, 136, 0.08);
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
  margin: 0 0 24px 0;
  font-weight: 500;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ProgressText = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent2};
  margin-bottom: 24px;
  padding: 10px 20px;
  background: rgba(13, 148, 136, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(13, 148, 136, 0.2);
`;

const TopicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  width: 100%;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
`;

const TopicCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  border-radius: 16px;
  border: 2px solid rgba(13, 148, 136, 0.2);
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 130px;

  .icon {
    color: ${({ theme }) => theme.colors.accent};
    transition: all 0.3s ease;
  }

  .label {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
    transition: color 0.3s ease;
  }

  &:hover:not(.disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
    background: linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(13, 148, 136, 0.12) 100%);
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(13, 148, 136, 0.25);

    .icon {
      transform: scale(1.15);
      color: ${({ theme }) => theme.colors.accent};
      filter: drop-shadow(0 4px 8px rgba(13, 148, 136, 0.4));
    }
  }

  &.selected {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%);
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 8px 24px rgba(13, 148, 136, 0.3);
    transform: translateY(-2px);

    .label {
      color: #ffffff;
      font-weight: 700;
    }

    .icon {
      color: #ffffff;
      transform: scale(1.1);
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
    }

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 30px rgba(13, 148, 136, 0.4);
    }
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: rgba(13, 148, 136, 0.1);

    &:hover {
      transform: none;
      box-shadow: none;
      background: #ffffff;
      border-color: rgba(13, 148, 136, 0.1);
    }
  }

  &:active:not(.disabled) {
    transform: translateY(0) scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 20px 12px;
    min-height: 110px;
    gap: 8px;

    .label {
      font-size: 0.85rem;
    }
  }
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  backdrop-filter: blur(4px);
`;

const ContinueButton = styled.button`
  width: 100%;
  max-width: 400px;
  height: 56px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%);
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(13, 148, 136, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: none;
  }

  @media (max-width: 768px) {
    height: 52px;
    font-size: 1rem;
  }
`;
