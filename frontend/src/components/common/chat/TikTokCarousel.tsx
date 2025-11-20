import styled from "styled-components";
import { useEffect, useRef, useState } from "react";

export type TikTokVideo = {
  id: string;
  embedHtml: string;
  videoId: string;
  author: string;
  url: string;
};

type Props = {
  videos: TikTokVideo[];
  onOpenSwipe: () => void;
};

export default function TikTokCarousel({ videos, onOpenSwipe }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<TikTokVideo[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const VIDEOS_PER_PAGE = 3;

  // Initialize with first 3 videos
  useEffect(() => {
    setLoadedVideos(videos.slice(0, VIDEOS_PER_PAGE));
    setCurrentPage(0);
  }, [videos]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [loadedVideos]);

  useEffect(() => {
    // Load TikTok embed script
    const loadScript = () => {
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
          }, 100);
        };
        document.body.appendChild(script);
      } else {
        // Script already exists, just trigger render
        setTimeout(() => {
          if ((window as any).tiktokEmbed) {
            (window as any).tiktokEmbed.lib.render();
          }
        }, 100);
      }
    };

    loadScript();
  }, [loadedVideos]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Check if scrolled to end - load more videos (lazy load)
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 50;
    if (isAtEnd && loadedVideos.length < videos.length) {
      const nextPage = currentPage + 1;
      const newVideos = videos.slice(0, (nextPage + 1) * VIDEOS_PER_PAGE);
      setLoadedVideos(newVideos);
      setCurrentPage(nextPage);
    }
    
    el.scrollBy({ left: 260, behavior: "smooth" });
  };

  if (!videos || videos.length === 0) return null;

  return (
    <Wrap>
      <Header>
        <Title>🎬 Video gợi ý cho bạn</Title>
        <ViewAllBtn onClick={onOpenSwipe}>
          <span>Xem & Đánh giá</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ViewAllBtn>
      </Header>

      <CarouselContainer>
        {canScrollLeft && (
          <NavBtn className="left" onClick={scrollLeft}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavBtn>
        )}

        <ScrollContainer ref={scrollRef} onScroll={checkScroll}>
          {loadedVideos.map((video) => (
            <VideoCard key={video.id}>
              <div dangerouslySetInnerHTML={{ __html: video.embedHtml }} />
            </VideoCard>
          ))}
        </ScrollContainer>

        {canScrollRight && (
          <NavBtn className="right" onClick={scrollRight}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </NavBtn>
        )}
      </CarouselContainer>
    </Wrap>
  );
}

const Wrap = styled.div`
  margin: 20px 0 12px;
  padding: 20px;
  background: linear-gradient(135deg, 
    rgba(13, 148, 136, 0.04) 0%, 
    rgba(20, 184, 166, 0.02) 50%,
    rgba(255, 255, 255, 0.6) 100%
  );
  border: 1.5px solid rgba(13, 148, 136, 0.12);
  border-radius: 20px;
  box-shadow: 
    0 4px 16px rgba(13, 148, 136, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(13, 148, 136, 0.2);
    box-shadow: 
      0 8px 24px rgba(13, 148, 136, 0.1),
      0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent} 0%, 
    ${({ theme }) => theme.colors.accent2} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%) border-box;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, ${({ theme }) => theme.colors.accent2} 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  span, svg {
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.25);
    
    &::before {
      opacity: 1;
    }

    span, svg {
      color: white;
    }

    svg {
      transform: translateX(4px);
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const CarouselContainer = styled.div`
  position: relative;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 12px 4px;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(13, 148, 136, 0.3) transparent;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(13, 148, 136, 0.05);
    border-radius: 3px;
    margin: 0 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, 
      ${({ theme }) => theme.colors.accent} 0%, 
      ${({ theme }) => theme.colors.accent2} 100%
    );
    border-radius: 3px;
    transition: all 0.2s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const VideoCard = styled.div`
  flex: 0 0 auto;
  width: 240px;
  height: 430px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #1a1a1a 0%, #000 100%);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(13, 148, 136, 0.1) 0%, 
      transparent 50%,
      rgba(20, 184, 166, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 1;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 
      0 16px 40px rgba(13, 148, 136, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.15),
      inset 0 0 0 1px rgba(13, 148, 136, 0.3);
    
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-4px) scale(1.01);
  }

  /* TikTok embed styling */
  blockquote.tiktok-embed {
    margin: 0 !important;
    border: none !important;
    max-width: 100% !important;
    min-width: 100% !important;
    height: 100% !important;
    background: transparent !important;
  }

  iframe {
    border-radius: 16px;
    width: 100% !important;
    height: 100% !important;
  }
`;

const NavBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(13, 148, 136, 0.2);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 
    0 6px 20px rgba(13, 148, 136, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.accent} 0%, 
      ${({ theme }) => theme.colors.accent2} 100%
    );
    color: white;
    border-color: transparent;
    transform: translateY(-50%) scale(1.15);
    box-shadow: 
      0 8px 28px rgba(13, 148, 136, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-50%) scale(1.05);
  }

  &.left {
    left: -20px;
  }

  &.right {
    right: -20px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    &.left {
      left: -16px;
    }

    &.right {
      right: -16px;
    }
  }
`;
