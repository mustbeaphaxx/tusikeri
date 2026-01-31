
import React from 'react';

export function NoteList({ activeFolderId, activeNoteId, onNoteSelect, notes }) {
    // Use passed notes

    return (
        <div style={{
            width: '250px',
            backgroundColor: 'var(--bg-list)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{ padding: '20px 15px 10px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Sort by Title ▾
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
                {notes.map(note => {
                    const isActive = activeNoteId === note.id;
                    return (
                        <div
                            key={note.id}
                            onClick={() => onNoteSelect(note.id)}
                            style={{
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : '#2a2a2a',
                                borderRadius: '8px',
                                padding: '12px 15px',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                border: isActive ? '1px solid var(--accent-color-dim)' : 'none'
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>{note.title}</div>
                            <div style={{ display: 'flex', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <span style={{ marginRight: '8px' }}>{note.time}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.preview}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
