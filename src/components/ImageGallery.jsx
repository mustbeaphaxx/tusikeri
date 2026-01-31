import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Maximize2 } from 'lucide-react';

export function ImageGallery({ images = [], onUploadImage, onDeleteImage, onSelectImage, selectedImageId }) {
    const fileInputRef = useRef(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUploadImage(file);
        }
    };

    const isSelectionMode = !!onSelectImage;

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-content)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Camera size={20} color="var(--accent-color)" />
                    {isSelectionMode ? 'Select an Image' : 'Image Gallery'}
                </h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        backgroundColor: 'var(--accent-color)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Upload size={14} /> Upload Image
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {images.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                        No images yet. Upload one to get started!
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        {images.map(img => (
                            <div key={img.id}
                                onClick={() => isSelectionMode && onSelectImage(img)}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '16/9',
                                    backgroundColor: '#222',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: selectedImageId === img.id ? '3px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: isSelectionMode ? 'pointer' : 'default',
                                    group: 'group' // pseudo for hover logic
                                }} className="gallery-item">
                                <img
                                    src={img.url}
                                    alt="Uploaded"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {!isSelectionMode && (
                                    <div className="overlay" style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        gap: '10px'
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setLightboxImage(img); }}
                                            title="View Full Size"
                                            style={{ background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Maximize2 size={16} color="#000" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete image?')) onDeleteImage(img.id) }}
                                            title="Delete"
                                            style={{ background: '#ff453a', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Trash2 size={16} color="#fff" />
                                        </button>
                                    </div>
                                )}

                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '8px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                    color: '#fff',
                                    fontSize: '11px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {new Date(img.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px'
                }} onClick={() => setLightboxImage(null)}>
                    <img
                        src={lightboxImage.url}
                        alt="Full View"
                        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        onClick={e => e.stopPropagation()} // Prevent close when clicking image
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

            <style>{`
                .gallery-item:hover .overlay { opacity: 1 !important; }
            `}</style>
        </div>
    );
}
