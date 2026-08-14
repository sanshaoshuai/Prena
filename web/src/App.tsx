import { useState, useEffect } from 'react';
import sampleDeck from './sample-deck.json';
import { SlideRenderer } from './components/SlideRenderer';
import { exportDeckToPPTX } from './utils/exportPPTX';
import type { Presentation, CardGridComponent } from './types/dsl';
import { Monitor, Download, Play, Layout } from 'lucide-react';

const THEME_COLORS = [
  '#0A7CFF', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#1F2937'  // Dark
];

function App() {
  const [deck, setDeck] = useState<Presentation>(sampleDeck as Presentation);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playMode, setPlayMode] = useState(false);

  // 全局注入主题色
  document.documentElement.style.setProperty('--primary-color', deck.meta.primaryColor || '#0A7CFF');

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

  const handleColorChange = (color: string) => {
    setDeck(prev => ({
      ...prev,
      meta: { ...prev.meta, primaryColor: color }
    }));
  };

  // Keyboard navigation for play mode
  useEffect(() => {
    if (!playMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (currentSlide < deck.slides.length - 1) setCurrentSlide(p => p + 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentSlide > 0) setCurrentSlide(p => p - 1);
      } else if (e.key === 'Escape') {
        setPlayMode(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playMode, currentSlide, deck.slides.length]);

  // If in play mode, render full screen
  if (playMode) {
    return (
      <div className="play-mode">
        <div style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}>
          <SlideRenderer slide={deck.slides[currentSlide]} isThumbnail={true} />
        </div>
        <div style={{ position: 'fixed', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          按 ⬅️ ➡️ 切换，按 Esc 退出播放
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <header className="navbar">
        <div className="logo-container">
          <Layout size={24} color="var(--primary-color)" />
          SlideFlow
        </div>
        <div className="nav-actions">
          {/* 色卡选择 */}
          <div className="color-swatch-container">
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>主题色:</span>
            {THEME_COLORS.map(color => (
              <div 
                key={color} 
                className={`color-swatch ${deck.meta.primaryColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>

          <button className="btn" onClick={() => setPlayMode(true)}>
            <Play size={16} />
            播放演示
          </button>
          <button className="btn btn-primary" onClick={() => exportDeckToPPTX(deck)}>
            <Download size={16} />
            导出完整 PPTX
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* 左侧缩略图导航 */}
        <aside className="sidebar">
          {deck.slides.map((slide, idx) => (
            <div 
              key={slide.id} 
              className={`thumbnail-wrapper ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              style={{ width: 206, height: 116, overflow: 'hidden' }}
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
            <SlideRenderer 
              slide={deck.slides[currentSlide]} 
              onUpdateComponent={(compId, field, val) => handleUpdateComponent(deck.slides[currentSlide].id, compId, field, val)} 
            />
          </div>
          
          {/* 演讲稿 */}
          <div className="notes-container">
            <h3>演讲稿 (Speaker Notes)</h3>
            <textarea 
              className="notes-editor"
              value={deck.slides[currentSlide].notes || ''}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              placeholder="在此输入本页的演讲备注，它会被导出到 PPTX 的备注区域..."
            />
          </div>
        </main>
      </div>

      {/* 隐藏区域：为了导出完整文件，在此处将所有 Slide 并排渲染（对用户不可见） */}
      <div className="export-hidden-area">
        {deck.slides.map(slide => (
          <SlideRenderer key={`export-${slide.id}`} slide={slide} isThumbnail={true} />
        ))}
      </div>
    </div>
  );
}

export default App;
