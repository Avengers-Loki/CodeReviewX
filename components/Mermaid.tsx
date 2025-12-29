
'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'inherit',
        });

        if (mermaidRef.current) {
            mermaidRef.current.innerHTML = ''; // Clear previous
            const renderChart = async () => {
                try {
                    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
                    const { svg } = await mermaid.render(id, chart);
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = svg;
                    }
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    if (mermaidRef.current) {
                        mermaidRef.current.innerText = 'Failed to render flowchart.';
                    }
                }
            };
            renderChart();
        }
    }, [chart]);

    return (
        <div className="mermaid-container bg-[#0d1117] p-4 rounded-lg overflow-x-auto my-4 border border-[var(--border)]">
            <div ref={mermaidRef} className="flex justify-center" />
        </div>
    );
};

export default Mermaid;
