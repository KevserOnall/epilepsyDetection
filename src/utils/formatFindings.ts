export const formatFindings = (rawFindings: any[]): { [key: string]: any } => {
  const sections: { [key: string]: any } = {
    'Zemin Aktivitesi': { content: '', type: 'text', description: '' },
    'Anormal Bulgular': { items: [], type: 'list', content: '' },
    'Artefaktlar': { items: [], type: 'list', content: '' },
    'Sonuç ve Öneriler': { content: '', type: 'text', description: '' }
  };

  let currentSection = '';
  let lastItem: any = null;
  let conclusionDescriptions: string[] = [];
  let inConclusionSection = false;

  rawFindings.forEach(item => {
    const rawTitle = item.description?.trim() || '';
    if (rawTitle.startsWith('**')) {
      const title = rawTitle.replace(/\*\*/g, '').trim();
      if (title in sections) {
        currentSection = title;
        lastItem = null;
        inConclusionSection = (title === 'Sonuç ve Öneriler');
      }
      return;
    }
    if (!currentSection) return;
    if (rawTitle.startsWith('-')) {
      const description = rawTitle.substring(1).trim();
      if (inConclusionSection) {
        conclusionDescriptions.push(description);
      } else if (lastItem) {
        lastItem.description = description;
      } else if (sections[currentSection].type === 'text') {
        sections[currentSection].description = description;
      }
      return;
    }
    if (sections[currentSection].type === 'text') {
      if (!rawTitle.startsWith('-')) {
        sections[currentSection].content = rawTitle;
      }
    } else if (sections[currentSection].type === 'list') {
      if (item.location !== 'Belirtilmemis' && !rawTitle.startsWith('-') && !rawTitle.startsWith('**')) {
        const title = rawTitle.replace(/^\d+\.?\s*/, '').trim();
        const newItem = {
          id: item.id,
          title: title,
          description: '',
          location: item.location,
          coordinates: item.coordinates
        };
        sections[currentSection].items?.push(newItem);
        lastItem = newItem;
      }
    }
  });
  if (conclusionDescriptions.length > 0) {
    sections['Sonuç ve Öneriler'].description = conclusionDescriptions.join(' ');
  }
  return sections;
}; 