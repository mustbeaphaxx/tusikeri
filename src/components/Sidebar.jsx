import React, { useState } from 'react';
import { Folder, FileText, Trash2, Inbox, Plus, Edit2, ChevronDown, ChevronRight, FolderInput, Book, Camera } from 'lucide-react';

const iconMap = {
    Inbox,
    FileText,
    Folder,
    Trash2,
    Book,
    Camera
};

export function Sidebar({ folders, notes, activeFolderId, activeNoteId, onFolderSelect, onNoteSelect, onAddFolder, onRenameFolder, onDeleteFolder, onRenameNote, onDeleteNote, onMoveNote }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [expandedFolders, setExpandedFolders] = useState({
        'all': true,
        'notes': true,
        'study': true,
        'cell': true,
        'deleted': false
    });
    const [movingNoteId, setMovingNoteId] = useState(null);

    const toggleFolder = (folderId, e) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    const handleStartEdit = (item, type) => {
        if (type === 'folder' && item.type !== 'custom') return;
        setEditingId(item.id);
        setEditName(item.name || item.title);
    };

    const handleSaveEdit = (type) => {
        if (editingId) {
            if (type === 'folder') {
                onRenameFolder(editingId, editName);
            } else { // type === 'note'
                onRenameNote(editingId, editName);
            }
            setEditingId(null);
        }
    };

    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') handleSaveEdit(type);
        if (e.key === 'Escape') setEditingId(null);
    };

    return (
        <div style={{
            width: '100%',
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: '1px solid #000',
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            color: 'var(--text-secondary)',
            overflowY: 'auto'
        }}>
            <div style={{ padding: '10px 8px', fontSize: '11px', fontWeight: 600, opacity: 0.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Folders</span>
                <div
                    onClick={onAddFolder}
                    style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}
                    title="New Folder"
                >
                    <Plus size={14} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {folders.map(folder => {
                    const isActive = activeFolderId === folder.id;
                    const Icon = iconMap[folder.icon] || Folder;
                    const isEditing = editingId === folder.id;
                    const isExpanded = expandedFolders[folder.id];

                    const folderNotes = folder.id === 'all'
                        ? notes.filter(n => n.folderId !== 'deleted')
                        : notes.filter(n => n.folderId === folder.id);

                    return (
                        <div key={folder.id}>
                            {/* Folder Row */}
                            <div
                                onClick={() => {
                                    if (!isEditing) {
                                        onFolderSelect(folder.id);
                                        setExpandedFolders(prev => ({ ...prev, [folder.id]: true }));
                                    }
                                }}
                                className="row-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: isActive ? 'var(--text-primary)' : 'inherit',
                                    position: 'relative'
                                }}
                            >
                                {/* Expand Toggle */}
                                <div
                                    onClick={(e) => toggleFolder(folder.id, e)}
                                    style={{ marginRight: '4px', cursor: 'pointer', opacity: 0.7, display: folderNotes.length > 0 ? 'block' : 'none' }}
                                >
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                {folderNotes.length === 0 && <div style={{ width: '18px' }}></div>}

                                <Icon size={16} style={{ marginRight: '8px', color: isActive ? 'var(--accent-color)' : 'inherit' }} />

                                {isEditing ? (
                                    <input
                                        autoFocus
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onBlur={() => handleSaveEdit('folder')}
                                        onKeyDown={(e) => handleKeyDown(e, 'folder')}
                                        style={{
                                            backgroundColor: '#333',
                                            border: '1px solid var(--accent-color)',
                                            color: '#fff',
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            width: '100%',
                                            outline: 'none',
                                            fontSize: 'inherit'
                                        }}
                                    />
                                ) : (
                                    <span style={{ flex: 1, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</span>
                                )}

                                {/* Persistent Actions for Custom Folders */}
                                {folder.type === 'custom' && !isEditing && (
                                    <div className="item-actions" style={{ display: 'flex', gap: '4px' }}>
                                        <Edit2
                                            size={14}
                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                            onClick={(e) => { e.stopPropagation(); handleStartEdit(folder, 'folder'); }}
                                            title="Rename"
                                        />
                                        <Trash2
                                            size={14}
                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                            className="trash-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Delete folder "${folder.name}"?`)) onDeleteFolder(folder.id);
                                            }}
                                            title="Delete"
                                        />
                                    </div>
                                )}
                                <span style={{ opacity: 0.5, fontSize: '11px', marginLeft: '6px', minWidth: '15px', textAlign: 'right' }}>{folderNotes.length || ''}</span>
                            </div>

                            {/* Notes Children */}
                            {isExpanded && (
                                <div style={{ marginLeft: '26px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                                    {folderNotes.map(note => {
                                        const isNoteActive = activeNoteId === note.id;
                                        const isNoteEditing = editingId === note.id;
                                        return (
                                            <div
                                                key={note.id}
                                                onClick={(e) => {
                                                    if (!isNoteEditing && !movingNoteId) {
                                                        e.stopPropagation(); onNoteSelect(note.id);
                                                    }
                                                }}
                                                onDoubleClick={(e) => { e.stopPropagation(); handleStartEdit(note, 'note'); }}
                                                className="row-item"
                                                style={{
                                                    padding: '6px 10px',
                                                    fontSize: '13px',
                                                    color: isNoteActive ? 'var(--text-primary)' : 'rgba(255,255,255,0.6)',
                                                    cursor: 'pointer',
                                                    backgroundColor: isNoteActive ? 'var(--accent-color-dim)' : 'transparent',
                                                    borderRadius: '4px',
                                                    marginBottom: '1px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    position: 'relative'
                                                }}
                                            >
                                                <FileText size={14} style={{ marginRight: '8px', opacity: 0.7 }} />

                                                {isNoteEditing ? (
                                                    <input
                                                        autoFocus
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        onBlur={() => handleSaveEdit('note')}
                                                        onKeyDown={(e) => handleKeyDown(e, 'note')}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{
                                                            backgroundColor: '#333',
                                                            border: '1px solid var(--accent-color)',
                                                            color: '#fff',
                                                            borderRadius: '4px',
                                                            padding: '2px 4px',
                                                            width: '100%',
                                                            outline: 'none',
                                                            fontSize: 'inherit'
                                                        }}
                                                    />
                                                ) : movingNoteId === note.id ? (
                                                    <select
                                                        autoFocus
                                                        value=""
                                                        onChange={(e) => {
                                                            onMoveNote(note.id, e.target.value);
                                                            setMovingNoteId(null);
                                                        }}
                                                        onBlur={() => setMovingNoteId(null)}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{
                                                            backgroundColor: '#333',
                                                            color: '#fff',
                                                            borderRadius: '4px',
                                                            width: '100%',
                                                            fontSize: 'inherit'
                                                        }}
                                                    >
                                                        <option value="" disabled>Move to...</option>
                                                        {folders.filter(f => f.type !== 'system' && f.id !== 'deleted').map(f => (
                                                            <option key={f.id} value={f.id}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title}</span>
                                                )}

                                                {!isNoteEditing && !movingNoteId && (
                                                    <div className="item-actions" style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                                        <FolderInput
                                                            size={14}
                                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                                            onClick={(e) => { e.stopPropagation(); setMovingNoteId(note.id); }}
                                                            title="Move Note"
                                                        />
                                                        <Trash2
                                                            size={14}
                                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                                            className="trash-icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`Delete note "${note.title}"?`)) onDeleteNote(note.id);
                                                            }}
                                                            title="Delete Note"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <style>{`
        .item-actions { visibility: hidden; }
        .row-item:hover .item-actions { visibility: visible; }
        .trash-icon:hover { color: #ff453a; opacity: 1 !important; }
      `}</style>
        </div>
    );
}
