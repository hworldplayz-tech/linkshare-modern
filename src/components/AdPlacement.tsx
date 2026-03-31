import React, { useEffect, useRef } from 'react';
import { SiteSettings } from '../types';

interface AdPlacementProps {
  id: string;
  settings: SiteSettings;
  className?: string;
}

export default function AdPlacement({ id, settings, className = '' }: AdPlacementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const placement = settings.adPlacements?.find(p => p.id === id);

  useEffect(() => {
    if (!settings.globalAdsEnabled || !placement?.enabled || !placement.script || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous content

    // Create a temporary element to parse the script
    const temp = document.createElement('div');
    temp.innerHTML = placement.script;

    // Extract and execute scripts
    const scripts = temp.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const oldScript = scripts[i];
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content
      newScript.textContent = oldScript.textContent;
      
      // Append to container
      container.appendChild(newScript);
    }

    // Append non-script elements
    const others = Array.from(temp.childNodes).filter(node => node.nodeName !== 'SCRIPT');
    others.forEach(node => {
      container.appendChild(node.cloneNode(true));
    });

  }, [id, settings.globalAdsEnabled, placement?.enabled, placement?.script]);

  if (!settings.globalAdsEnabled || !placement?.enabled || !placement.script) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className={`ad-container flex justify-center items-center overflow-hidden my-4 min-h-[50px] ${className}`}
      data-ad-id={id}
    />
  );
}
