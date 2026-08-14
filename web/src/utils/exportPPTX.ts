import PptxGenJS from 'pptxgenjs';
import type { Presentation } from '../types/dsl';

const PX_TO_INCH = 1 / 96; // 96 DPI 

function pxToInch(px: number) {
  return px * PX_TO_INCH;
}

function hexToRgb(hex: string) {
  if (hex.startsWith('#')) return hex.substring(1);
  return hex;
}

export async function exportDeckToPPTX(deck: Presentation) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches

  // 寻找所有被标记为幻灯片的容器（在隐藏的 export-hidden-area 中）
  const slideNodes = document.querySelectorAll('.export-hidden-area .deck-container');
  
  if (slideNodes.length === 0) {
    alert("无法找到幻灯片节点，导出失败");
    return;
  }

  slideNodes.forEach((container, index) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };
    
    // 如果有演讲稿，写入到 PPTX 的备注中
    if (deck.slides[index] && deck.slides[index].notes) {
      slide.addNotes(deck.slides[index].notes);
    }
    
    // 我们不能直接用 getBoundingClientRect() 因为隐藏元素的坐标可能是负的
    // 但是只要我们取相对当前容器 container 的相对坐标，依然是准确的
    const containerRect = container.getBoundingClientRect();
    
    const elements = container.querySelectorAll('[data-pptx-id]');
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      
      const x = pxToInch(rect.left - containerRect.left);
      const y = pxToInch(rect.top - containerRect.top);
      const w = pxToInch(rect.width);
      const h = pxToInch(rect.height);
      
      const isCard = el.classList.contains('comp-card');
      if (isCard) {
        slide.addShape(pres.ShapeType.rect, {
          x, y, w, h,
          fill: { color: 'FFFFFF' },
          line: { color: style.borderColor !== 'rgba(0, 0, 0, 0)' && style.borderWidth !== '0px' ? hexToRgb(deck.meta.primaryColor || '#000000') : 'E5E7EB', width: 1 },
          rectRadius: parseFloat(style.borderRadius) * PX_TO_INCH
        });
        return; 
      }

      const text = (el as HTMLElement).innerText;
      if (text) {
        const fontSize = parseFloat(style.fontSize) * 0.75; 
        const color = style.color.match(/\d+/g); 
        let hexColor = '000000';
        if (color && color.length >= 3) {
          hexColor = ((1 << 24) + (parseInt(color[0]) << 16) + (parseInt(color[1]) << 8) + parseInt(color[2])).toString(16).slice(1).toUpperCase();
        }

        slide.addText(text, {
          x, y, w, h,
          fontSize,
          color: hexColor,
          bold: parseInt(style.fontWeight) >= 600,
          align: style.textAlign as any,
          margin: 0,
          valign: 'top'
        });
      }
    });
  });

  await pres.writeFile({ fileName: `${deck.meta.title || 'SlideFlow'}.pptx` });
}
