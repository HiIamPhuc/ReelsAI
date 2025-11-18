import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TikTokVideo } from "./TikTokCarousel";

type Props = {
  videos: TikTokVideo[];
  isOpen: boolean;
  onClose: () => void;
};

export default function TikTokSwipeModal({ videos, isOpen, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeAnimation, setLikeAnimation] = useState<"like" | "dislike" | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: "like" | "dislike" }>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      // Reload TikTok embeds after modal opens
      const timer = setTimeout(() => {
        const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
        if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://www.tiktok.com/embed.js";
          script.async = true;
          script.onload = () => {
            // Force render after script loads
            setTimeout(() => {
              if ((window as any).tiktokEmbed) {
                (window as any).tiktokEmbed.lib.render();
              }
            }, 200);
          };
          document.body.appendChild(script);
        } else {
          // Script exists, force re-render
          if ((window as any).tiktokEmbed && (window as any).tiktokEmbed.lib) {
            (window as any).tiktokEmbed.lib.render();
          }
        }
      }, 150);
      
      return () => {
        document.body.style.overflow = "";
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, currentIndex]);

  const handleLike = () => {
    if (currentIndex >= videos.length) return;
    const currentVideo = videos[currentIndex];
    
    setLikeAnimation("like");
    setRatings(prev => ({ ...prev, [currentVideo.id]: "like" }));
    
    setTimeout(() => {
      setLikeAnimation(null);
      if (currentIndex < videos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 600);
    
    // TODO: Send to backend API
    console.log("LIKE:", currentVideo.id);
  };

  const handleDislike = () => {
    if (currentIndex >= videos.length) return;
    const currentVideo = videos[currentIndex];
    
    setLikeAnimation("dislike");
    setRatings(prev => ({ ...prev, [currentVideo.id]: "dislike" }));
    
    setTimeout(() => {
      setLikeAnimation(null);
      if (currentIndex < videos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 600);
    
    // TODO: Send to backend API
    console.log("DISLIKE:", currentVideo.id);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDownload = async () => {
    if (currentIndex >= videos.length) return;
    const currentVideo = videos[currentIndex];
    
    // TODO: Implement actual download logic
    // This will need backend API to fetch video URL
    console.log("DOWNLOAD VIDEO:", currentVideo.id);
    
    // For now, open TikTok page in new tab
    window.open(currentVideo.url, '_blank');
  };

  if (!isOpen) return null;

  const currentVideo = videos[currentIndex];
  const isFirstVideo = currentIndex === 0;
  const isLastVideo = currentIndex === videos.length - 1;

  const modalContent = (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </CloseBtn>

        <Content>
          <VideoContainer>
            {likeAnimation && (
              <AnimationOverlay className={likeAnimation}>
                {likeAnimation === "like" ? (
                  <AnimIcon className="like">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"/>
                    </svg>
                  </AnimIcon>
                ) : (
                  <AnimIcon className="dislike">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round"/>
                    </svg>
                  </AnimIcon>
                )}
              </AnimationOverlay>
            )}

            <VideoWrapper key={currentVideo?.id || currentIndex}>
              {currentVideo && (
                <div dangerouslySetInnerHTML={{ __html: currentVideo.embedHtml }} />
              )}
            </VideoWrapper>
          </VideoContainer>

          {/* Navigation arrows - Outside video container */}
          {!isFirstVideo && (
            <NavArrow className="left" onClick={handlePrevious}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavArrow>
          )}

          {!isLastVideo && (
            <NavArrow className="right" onClick={handleNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavArrow>
          )}

          <Controls>
            <Counter>
              Video {currentIndex + 1} / {videos.length}
            </Counter>

            <ActionButtons>
              <ActionBtn className="dislike" onClick={handleDislike} disabled={likeAnimation !== null}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>Không thích</span>
              </ActionBtn>

              <ActionBtn className="download" onClick={handleDownload} disabled={likeAnimation !== null}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
                <span>Tải xuống</span>
              </ActionBtn>

              <ActionBtn className="like" onClick={handleLike} disabled={likeAnimation !== null}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" 
                        fill="currentColor" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
                <span>Thích</span>
              </ActionBtn>
            </ActionButtons>

            <ProgressBar>
              {videos.map((video, idx) => (
                <ProgressDot 
                  key={video.id} 
                  className={
                    idx < currentIndex ? "completed" :
                    idx === currentIndex ? "active" : ""
                  }
                  $rating={ratings[video.id]}
                />
              ))}
            </ProgressBar>
          </Controls>
        </Content>
      </Modal>
    </Overlay>
  );

  // Use React Portal to render modal at body level
  return createPortal(modalContent, document.body);
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { 
    opacity: 0; 
    transform: translate(-50%, -50%) scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: translate(-50%, -50%) scale(1); 
  }
`;

const likeAnim = keyframes`
  0% { 
    opacity: 0; 
    transform: scale(0.5); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
  100% { 
    opacity: 0; 
    transform: scale(1); 
  }
`;

const Overlay = styled.div`
  position: fixed !important;
  inset: 0 !important;
  z-index: 999999 !important;
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(8px) !important;
  display: grid !important;
  place-items: center !important;
  animation: ${fadeIn} 0.2s ease-out;
  
  /* Ensure it's on top of everything */
  isolation: isolate;
  pointer-events: auto !important;
`;

const Modal = styled.div`
  position: relative;
  z-index: 1000000;
  width: min(480px, 95vw);
  max-height: 90vh;
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);
  border: 2px solid rgba(13, 148, 136, 0.2);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(13, 148, 136, 0.15),
              0 0 0 1px rgba(13, 148, 136, 0.05);
  animation: ${scaleIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    width: 95vw;
    max-height: 95vh;
    padding: 20px;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(13, 148, 136, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
    transform: rotate(90deg);
    box-shadow: 0 6px 16px rgba(13, 148, 136, 0.25);
  }
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 560px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  border: 2px solid rgba(13, 148, 136, 0.15);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.1);
  
  @media (max-width: 768px) {
    height: 500px;
  }
  
  @media (max-height: 800px) {
    height: 450px;
  }
`;

const AnimationOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  pointer-events: none;
  animation: ${likeAnim} 0.6s ease-out;

  &.like {
    background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
  }

  &.dislike {
    background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
  }
`;

const AnimIcon = styled.div`
  &.like {
    color: #22c55e;
    filter: drop-shadow(0 0 30px rgba(34, 197, 94, 0.8));
  }

  &.dislike {
    color: #ef4444;
    filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.8));
  }
`;

const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  blockquote.tiktok-embed {
    margin: 0 !important;
    border: none !important;
    max-width: 100% !important;
    min-width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  iframe {
    border-radius: 16px;
    max-height: 100%;
  }

  /* Fix TikTok embed container */
  section {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
  }
`;

const NavArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 40;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &.left {
    left: -130px;
  }

  &.right {
    right: -130px;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    &.left {
      left: -65px;
    }

    &.right {
      right: -65px;
    }
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const Counter = styled.div`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
  border-radius: 12px;
  border: 1px solid rgba(13, 148, 136, 0.2);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 16px;
  border: 2px solid;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 110px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &.dislike {
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
      border-color: transparent;
    }
  }

  &.download {
    border-color: rgba(13, 148, 136, 0.3);
    color: ${({ theme }) => theme.colors.accent};

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%);
      color: white;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(13, 148, 136, 0.35);
      border-color: transparent;
    }
  }

  &.like {
    border-color: rgba(34, 197, 94, 0.3);
    color: #22c55e;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.35);
      border-color: transparent;
    }
  }

  svg {
    width: 24px;
    height: 24px;
  }

  span {
    line-height: 1;
  }

  @media (max-width: 768px) {
    min-width: 100px;
    padding: 12px 16px;
    font-size: 0.8125rem;
    gap: 6px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ProgressDot = styled.div<{ $rating?: "like" | "dislike" }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(13, 148, 136, 0.15);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &.active {
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 12px rgba(13, 148, 136, 0.6);
  }

  &.completed {
    background: ${({ $rating }) =>
      $rating === "like" ? "#22c55e" : $rating === "dislike" ? "#ef4444" : "rgba(13, 148, 136, 0.3)"};
    box-shadow: ${({ $rating }) =>
      $rating === "like"
        ? "0 0 8px rgba(34, 197, 94, 0.5)"
        : $rating === "dislike"
        ? "0 0 8px rgba(239, 68, 68, 0.5)"
        : "none"};
  }
`;
