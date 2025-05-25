"use client";

import { cn, getTechLogosSync } from '@/lib/utils';
import Image from 'next/image';
import React, { useState } from 'react';

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
    const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());
    
    const techIcons = getTechLogosSync(techStack);

    const handleImageError = (tech: string) => {
        setFailedIcons(prev => new Set(prev).add(tech));
    };

    return (
        <div className='flex flex-row'>
            {techIcons.slice(0, 3).map(({ tech, url }, index) => (
                <div key={tech} className={cn("relative group bg-muted/50 dark:bg-muted/30 rounded-full p-2 flex items-center justify-center border border-border/20", index >= 1 && '-ml-3')}>
                    <span className='absolute bottom-full mb-1 hidden group-hover:flex px-2 py-1 text-xs text-foreground bg-popover border border-border rounded-md shadow-md'>
                        {tech}
                    </span>
                    <Image 
                        src={failedIcons.has(tech) ? "/tech.svg" : url} 
                        alt={tech} 
                        width={100} 
                        height={100} 
                        className='size-5'
                        onError={() => handleImageError(tech)}
                    />
                </div>
            ))}
        </div>
    );
};

export default DisplayTechIcons;