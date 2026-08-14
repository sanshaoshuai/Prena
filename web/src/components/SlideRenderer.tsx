import React from 'react';
import type { Slide, SlideComponent, CardGridComponent } from '../types/dsl';
import * as Icons from 'lucide-react';

interface Props {
  slide: Slide;
  onUpdateComponent?: (compId: string, field: string, value: string) => void;
  isThumbnail?: boolean;
}

export const SlideRenderer: React.FC<Props> = ({ slide, onUpdateComponent, isThumbnail = false }) => {
  
  const handleEdit = (id: string, field: string, e: React.FormEvent<HTMLElement>) => {
    if (onUpdateComponent) {
      onUpdateComponent(id, field, (e.target as HTMLElement).innerText);
    }
  };

  const renderComponent = (comp: SlideComponent) => {
    switch (comp.type) {
      case 'Heading':
        const HTag = `h${comp.level}` as keyof JSX.IntrinsicElements;
        return (
          <HTag 
            key={comp.id} 
            data-pptx-id={comp.id} 
            className={`comp-heading-${comp.level}`} 
            style={{ textAlign: comp.align || 'left' }}
            contentEditable={!isThumbnail}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleEdit(comp.id, 'text', e)}
          >
            {comp.text}
          </HTag>
        );
      case 'Paragraph':
        return (
          <p 
            key={comp.id} 
            data-pptx-id={comp.id} 
            className="comp-paragraph" 
            style={{ textAlign: comp.align || 'left' }}
            contentEditable={!isThumbnail}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleEdit(comp.id, 'text', e)}
          >
            {comp.text}
          </p>
        );
      case 'CardGrid':
        const cg = comp as CardGridComponent;
        return (
          <div key={comp.id} className="comp-card-grid" style={{ gridTemplateColumns: `repeat(${cg.columns}, 1fr)` }}>
            {cg.cards.map((card, idx) => {
              const Icon = card.icon && (Icons as any)[card.icon] ? (Icons as any)[card.icon] : null;
              return (
                <div key={idx} data-pptx-id={`${comp.id}-card-${idx}`} className="comp-card" style={card.highlight ? { borderColor: 'var(--primary-color)', borderWidth: 2 } : {}}>
                  {Icon && <Icon size={24} color="var(--primary-color)" />}
                  <div 
                    data-pptx-id={`${comp.id}-cardtitle-${idx}`} 
                    className="card-title"
                    contentEditable={!isThumbnail}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                       // Update nested array logic (simplified for prototype, we just pass the path)
                       if (onUpdateComponent) onUpdateComponent(comp.id, `cards.${idx}.title`, (e.target as HTMLElement).innerText);
                    }}
                  >
                    {card.title}
                  </div>
                  <div 
                    data-pptx-id={`${comp.id}-cardcontent-${idx}`} 
                    className="card-content"
                    contentEditable={!isThumbnail}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                       if (onUpdateComponent) onUpdateComponent(comp.id, `cards.${idx}.content`, (e.target as HTMLElement).innerText);
                    }}
                  >
                    {card.content}
                  </div>
                </div>
              );
            })}
          </div>
        );
      default:
        return <div key={comp.id}>Unsupported component: {comp.type}</div>;
    }
  };

  return (
    <div className={`deck-container layout-${slide.layout}`}>
      {slide.components.map(renderComponent)}
    </div>
  );
};
