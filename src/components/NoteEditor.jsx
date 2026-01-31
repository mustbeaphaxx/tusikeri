import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, List, Image as ImageIcon, BookOpen, Highlighter, PlusCircle, Maximize2, Menu } from 'lucide-react';
import { ImageGallery } from './ImageGallery';

export function NoteEditor({ activeNote, folders = [], explanations = {}, images = [], onUpdateContent, onFileUpload, onAddExplanation, onUploadImage, isMobile, onToggleSidebar }) {
    const fileInputRef = useRef(null);
    const contentRef = useRef(null);
    const [targetFolderId, setTargetFolderId] = useState(activeNote?.folderId || (folders[0]?.id));
    const lastNoteIdRef = useRef(activeNote?.id);

    // ... (rest of code) ...

    return (
        <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-content)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Toolbar */}
            <div style={{
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Changed for Menu button
                padding: '0 20px',
                borderBottom: '1px solid var(--border-color)',
            }}>

                {/* Left Side: Menu Button (Mobile Only) */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isMobile && (
                        <button
                            onClick={onToggleSidebar}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                marginRight: '10px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Menu size={24} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)' }}>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleCommand('bold')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} title="Bold"><b>B</b></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleCommand('italic')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} title="Italic"><i>I</i></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleCommand('underline')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} title="Underline"><u>U</u></button>
                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleCommand('insertUnorderedList')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} title="Bullet List">• List</button>

                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={startAddExplanation}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                        title="Add Text Definition"
                    >
                        <BookOpen size={18} />
                    </button>

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={startAddImageExplanation}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                        title="Add Image Definition"
                    >
                        <ImageIcon size={18} />
                    </button>

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleHighlight}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                        title="Highlight"
                    >
                        <Highlighter size={18} />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
                    {activeNote.title}
                </h1>

                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onMouseUp={handleMouseUp}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onBlur={applyHighlighting}
                    style={{
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        outline: 'none',
                        minHeight: '200px'
                    }}
                />
            </div>

            {/* AMBOSS Style Popup */}
            {popup && (
                <div style={{
                    position: 'fixed',
                    top: popup.y,
                    left: popup.x,
                    backgroundColor: '#ffffff',
                    color: '#333333',
                    borderRadius: '8px',
                    padding: '0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                    width: '320px',
                    maxWidth: '90vw',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    border: '1px solid #e0e0e0',
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={(e) => e.stopPropagation()}>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>

                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#fafafa',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
                    }}>
                        <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px' }}>{popup.term}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                            {pinnedPopup && (
                                <button
                                    onClick={() => { setPopup(null); setPinnedPopup(false); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#999',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 0,
                                        lineHeight: 1
                                    }}
                                    title="Close"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '16px', lineHeight: '1.5', maxHeight: '300px', overflowY: 'auto' }}>
                        {popup.explanation ? (
                            Array.isArray(popup.explanation) ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {popup.explanation.map((item, index) => {
                                        let isImage = false;
                                        let content = item.text;
                                        // Check if text is actually an image wrapper
                                        if (typeof content === 'object' && content !== null && content.type === 'image') {
                                            isImage = true;
                                        }

                                        return (
                                            <div key={item.id || index} style={{ borderBottom: index < popup.explanation.length - 1 ? '1px solid #eee' : 'none', paddingBottom: index < popup.explanation.length - 1 ? '12px' : '0' }}>
                                                {isImage ? (
                                                    <div
                                                        style={{ marginTop: '4px', marginBottom: '4px', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent triggering other clicks
                                                            setLightboxImage(content.url);
                                                        }}
                                                        title="Click to expand"
                                                    >
                                                        <img src={content.url} alt="Reference" style={{ width: '100%', borderRadius: '4px', border: '1px solid #eee' }} />
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>{content}</div>
                                                )}
                                                <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ddd' }}></span>
                                                    Source: {item.source}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div>{popup.explanation}</div>
                            )
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={startAddExplanation}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#3b82f6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    + Add Text
                                </button>
                                <button
                                    onClick={startAddImageExplanation}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f59e0b',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <ImageIcon size={18} /> Add Image
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox Modal for Popup Images */}
            {lightboxImage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 12000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setLightboxImage(null)}>
                    <img
                        src={lightboxImage}
                        alt="Full View"
                        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxImage(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '30px',
                            cursor: 'pointer'
                        }}
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Selection Mode Overlay (Text) */}
            {isSelectingExplanation && (
                <div style={{
                    position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#fff', color: '#333', padding: '10px 20px', borderRadius: '12px',
                    fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee'
                }}>
                    <span style={{ fontSize: '14px' }}>Select definition text for <b style={{ color: '#3b82f6' }}>{pendingTerm}</b></span>
                    <button onMouseDown={e => e.preventDefault()} onClick={confirmExplanationSelection} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
                    <button onMouseDown={e => e.preventDefault()} onClick={() => { setIsSelectingExplanation(false); setPendingTerm(null); }} style={{ backgroundColor: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                </div>
            )}

            {/* Selection Mode Overlay (Image) */}
            {isSelectingImage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 11000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    <div style={{
                        width: '80%',
                        height: '80%',
                        backgroundColor: '#1E1E1E',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#fff' }}>Select Image for "{pendingTerm}"</h3>
                            <button onClick={() => setIsSelectingImage(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <ImageGallery
                            images={images}
                            onUploadImage={onUploadImage}
                            onSelectImage={handleSelectImageForTerm}
                            onDeleteImage={() => { }} // Disable delete in selection mode
                        />
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".docx"
                onChange={(e) => onFileUpload(e, targetFolderId)}
            />

            <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <select
                    value={targetFolderId}
                    onChange={e => setTargetFolderId(e.target.value)}
                    style={{
                        padding: '8px',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                    title="Upload Target Folder"
                >
                    {folders.filter(f => f.id !== 'all' && f.id !== 'deleted').map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                </select>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        backgroundColor: 'var(--accent-color)',
                        color: '#000',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Upload DOCX"
                >
                    <span style={{ fontSize: '24px', fontWeight: 300 }}>+</span>
                </div>
            </div>
        </div>
    );
}
