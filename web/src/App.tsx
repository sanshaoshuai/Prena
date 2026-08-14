import { useState, useEffect, useRef } from 'react';
import sampleDeck from './sample-deck.json';
import { SlideRenderer } from './components/SlideRenderer';
import { exportDeckToPPTX } from './utils/exportPPTX';
import type { Presentation, CardGridComponent } from './types/dsl';
import { Download, Projector, Moon, Sun, Laptop, ChevronUp, ChevronDown, LayoutGrid, Sidebar } from 'lucide-react';

const THEME_COLORS = ['#0A7CFF', '#10B981', '#8B5CF6', '#F59E0B', '#1F2937'];

type AppTheme = 'light' | 'dark' | 'system';
type ViewMode = 'normal' | 'grid';

function App() {
  const [deck, setDeck] = useState<Presentation>(sampleDeck as Presentation);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playMode, setPlayMode] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('system');
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [notesHeight, setNotesHeight] = useState(80); // Default open at lower height
  const [playScale, setPlayScale] = useState(1);
  
  const playContainerRef = useRef<HTMLDivElement>(null);

  // Sync state with JSON for Vite HMR (Hot Module Replacement)
  useEffect(() => {
    setDeck(sampleDeck as Presentation);
  }, [sampleDeck]);

  // Apply UI Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = 
      appTheme === 'dark' || 
      (appTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [appTheme]);

  // Apply Slide Theme Color
  useEffect(() => {
    document.documentElement.style.setProperty('--slide-primary', deck.meta.primaryColor || '#0A7CFF');
  }, [deck.meta.primaryColor]);

  // Handle Fullscreen Play Mode
  useEffect(() => {
    if (playMode && playContainerRef.current) {
      if (playContainerRef.current.requestFullscreen) {
        playContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else if (!playMode && document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [playMode]);

  // Listen for fullscreen exit from ESC key via browser
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setPlayMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Update scale for Play Mode dynamically
  useEffect(() => {
    if (!playMode) return;
    
    const updateScale = () => {
      setPlayScale(Math.min(window.innerWidth / 960, window.innerHeight / 540));
    };
    
    updateScale(); // Initial
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [playMode]);

  // Global Keyboard Navigation (Play mode, Normal mode, Grid mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 正在输入时，不要拦截键盘事件
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (playMode) {
        if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentSlide < deck.slides.length - 1) setCurrentSlide(p => p + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentSlide > 0) setCurrentSlide(p => p - 1);
        }
      } else {
        // 普通视图或宫格视图下的快捷键导航
        if (viewMode === 'grid') {
          let cols = 1;
          const container = document.querySelector('.grid-view-container');
          if (container) {
            const gridStyle = window.getComputedStyle(container);
            const columnsStr = gridStyle.getPropertyValue('grid-template-columns');
            if (columnsStr) {
              cols = columnsStr.trim().split(/\s+/).length;
            }
          }

          if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentSlide < deck.slides.length - 1) setCurrentSlide(p => p + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSlide > 0) setCurrentSlide(p => p - 1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentSlide + cols < deck.slides.length) {
              setCurrentSlide(p => p + cols);
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSlide - cols >= 0) {
              setCurrentSlide(p => p - cols);
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            setViewMode('normal');
          }
        } else {
          // 普通视图
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentSlide < deck.slides.length - 1) setCurrentSlide(p => p + 1);
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSlide > 0) setCurrentSlide(p => p - 1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playMode, currentSlide, deck.slides.length, viewMode]);

  // 自动滚动选中的缩略图到可视区域
  useEffect(() => {
    if (!playMode) {
      setTimeout(() => {
        const activeItem = document.querySelector('.thumbnail-wrapper.active') || document.querySelector('.grid-thumbnail-wrapper.active');
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [currentSlide, viewMode, playMode]);

  const handleUpdateComponent = (slideId: string, compId: string, fieldPath: string, value: string) => {
    setDeck(prev => {
      const newDeck = { ...prev };
      const slide = newDeck.slides.find(s => s.id === slideId);
      if (!slide) return prev;
      
      const comp = slide.components.find(c => c.id === compId);
      if (!comp) return prev;

      if (fieldPath.startsWith('cards.')) {
        const parts = fieldPath.split('.');
        const idx = parseInt(parts[1]);
        const key = parts[2];
        if (comp.type === 'CardGrid') {
          const cgc = comp as CardGridComponent;
          (cgc.cards[idx] as any)[key] = value;
        }
      } else {
        (comp as any)[fieldPath] = value;
      }
      return newDeck;
    });
  };

  const handleUpdateNotes = (notes: string) => {
    setDeck(prev => {
      const newDeck = { ...prev };
      newDeck.slides[currentSlide].notes = notes;
      return newDeck;
    });
  };

  // Play mode renderer
  if (playMode) {
    return (
      <div className="play-mode-root" ref={playContainerRef}>
        <div style={{ transform: `scale(${playScale})`, transformOrigin: 'center center' }}>
          <SlideRenderer slide={deck.slides[currentSlide]} isThumbnail={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <header className="navbar">
        <div className="logo-container">
          <img src="/logo-Prena.jpeg" alt="Prena Logo" style={{ height: 32, borderRadius: 4 }} />
          Prena | 轻呈
          <span style={{ fontSize: 14, color: 'var(--ui-text-muted)', marginLeft: 8, fontWeight: 'normal' }}>复杂内容，轻松呈现</span>
        </div>
        <div className="nav-actions">
          
          {/* 视图切换 */}
          <div className="theme-toggle" style={{ marginRight: 16 }}>
            <button className={`theme-toggle-btn ${viewMode === 'normal' ? 'active' : ''}`} onClick={() => setViewMode('normal')} title="普通视图">
              <Sidebar size={14} />
            </button>
            <button className={`theme-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="宫格视图">
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* App UI Theme Toggle */}
          <div className="theme-toggle">
            <button className={`theme-toggle-btn ${appTheme === 'light' ? 'active' : ''}`} onClick={() => setAppTheme('light')} title="浅色模式">
              <Sun size={14} />
            </button>
            <button className={`theme-toggle-btn ${appTheme === 'dark' ? 'active' : ''}`} onClick={() => setAppTheme('dark')} title="深色模式">
              <Moon size={14} />
            </button>
            <button className={`theme-toggle-btn ${appTheme === 'system' ? 'active' : ''}`} onClick={() => setAppTheme('system')} title="跟随系统">
              <Laptop size={14} />
            </button>
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--ui-border)', margin: '0 8px' }}></div>

          {/* 色卡选择 */}
          <div className="color-swatch-container">
            {THEME_COLORS.map(color => (
              <div 
                key={color} 
                className={`color-swatch ${deck.meta.primaryColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setDeck(prev => ({ ...prev, meta: { ...prev.meta, primaryColor: color } }))}
                title="幻灯片主题色"
              />
            ))}
          </div>

          <button className="btn" onClick={() => setPlayMode(true)} title="播放演示">
            <Projector size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => exportDeckToPPTX(deck)} title="导出完整 PPTX">
            <Download size={18} />
          </button>
        </div>
      </header>

      <div className="app-body">
        {viewMode === 'normal' ? (
          <>
            {/* 左侧缩略图导航 */}
            <aside className="sidebar">
              {deck.slides.map((slide, idx) => (
                <div 
                  key={slide.id} 
                  className={`thumbnail-wrapper ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  style={{ width: 206, height: 116 }}
                >
                  <div className="thumbnail-number">{idx + 1}</div>
                  <div className="thumbnail-scale">
                    <SlideRenderer slide={slide} isThumbnail={true} />
                  </div>
                </div>
              ))}
            </aside>

            {/* 主编辑区 */}
            <main className="main-editor">
              <div className="slide-view-container">
                <div style={{ transform: 'scale(1)', transition: 'transform 0.2s' }}>
                  <SlideRenderer 
                    slide={deck.slides[currentSlide]} 
                    onUpdateComponent={(compId, field, val) => handleUpdateComponent(deck.slides[currentSlide].id, compId, field, val)} 
                  />
                </div>
              </div>
              
              {/* 演讲稿 */}
              <div className="notes-container" style={{ height: notesHeight > 0 ? notesHeight : 0 }}>
                <button 
                  className="notes-toggle" 
                  onClick={() => setNotesHeight(h => h === 0 ? 80 : 0)}
                  title="演讲稿"
                >
                  {notesHeight === 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {notesHeight > 0 && (
                  <>
                    <div className="notes-resizer" onMouseDown={(e) => {
                      const startY = e.clientY;
                      const startH = notesHeight;
                      const onMove = (ev: MouseEvent) => {
                        const newH = startH + (startY - ev.clientY);
                        setNotesHeight(Math.max(40, Math.min(newH, 400)));
                      };
                      const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                      };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }} />
                    <textarea 
                      className="notes-editor"
                      value={deck.slides[currentSlide].notes || ''}
                      onChange={(e) => handleUpdateNotes(e.target.value)}
                      placeholder="在此输入本页的演讲备注..."
                    />
                  </>
                )}
              </div>
            </main>
          </>
        ) : (
          /* 宫格视图 */
          <div className="grid-view-container">
            {deck.slides.map((slide, idx) => (
              <div 
                key={slide.id} 
                className={`grid-thumbnail-wrapper ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => {
                  setCurrentSlide(idx);
                  setViewMode('normal');
                }}
              >
                <div className="thumbnail-number">{idx + 1}</div>
                <div className="grid-thumbnail-scale">
                  <SlideRenderer slide={slide} isThumbnail={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 隐藏导出区 */}
      <div className="export-hidden-area">
        {deck.slides.map(slide => (
          <SlideRenderer key={`export-${slide.id}`} slide={slide} isThumbnail={true} />
        ))}
      </div>
    </div>
  );
}

export default App;
