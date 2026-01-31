import React, { useState } from 'react';
import { Book, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';

export function TermManager({ explanations, onUpdateExplanations }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTerms, setExpandedTerms] = useState({});

    const terms = Object.keys(explanations).sort();
    const filteredTerms = terms.filter(term =>
        term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        explanations[term].some(def => def.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleExpand = (term) => {
        setExpandedTerms(prev => ({ ...prev, [term]: !prev[term] }));
    };

    const deleteDefinition = (term, defId) => {
        if (!window.confirm("Delete this definition?")) return;

        const currentDefs = explanations[term];
        const newDefs = currentDefs.filter(d => d.id !== defId);

        if (newDefs.length === 0) {
            // Remove term entirely if no definitions left
            const newExplanations = { ...explanations };
            delete newExplanations[term];
            onUpdateExplanations(newExplanations);
        } else {
            onUpdateExplanations({
                ...explanations,
                [term]: newDefs
            });
        }
    };

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-content)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Book size={20} color="var(--accent-color)" />
                    Term Dictionary
                </h2>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search terms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 10px 8px 32px',
                            borderRadius: '6px',
                            border: '1px solid #444',
                            backgroundColor: '#333',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '13px',
                            width: '200px'
                        }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {filteredTerms.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                        No terms found. Start adding definitions in your notes!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredTerms.map(term => {
                            const definitions = explanations[term];
                            const isExpanded = expandedTerms[term];

                            return (
                                <div key={term} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div
                                        onClick={() => toggleExpand(term)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {isExpanded ? <ChevronDown size={14} color="#888" /> : <ChevronRight size={14} color="#888" />}
                                            <span style={{ fontWeight: 600, fontSize: '15px' }}>{term}</span>
                                            <span style={{ fontSize: '12px', color: '#666', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                                                {definitions.length}
                                            </span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            {definitions.map((def, idx) => (
                                                <div key={def.id || idx} style={{ padding: '12px 16px', borderBottom: idx < definitions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', display: 'flex', gap: '10px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#ddd' }}>{def.text}</div>
                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>Source: {def.source}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteDefinition(term, def.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px', height: 'fit-content' }}
                                                        title="Delete Definition"
                                                    >
                                                        <Trash2 size={14} className="trash-icon" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
                .trash-icon:hover { color: #ff453a; }
            `}</style>
        </div>
    );
}
