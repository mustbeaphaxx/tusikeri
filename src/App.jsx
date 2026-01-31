import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { TermManager } from './components/TermManager';
import { ImageGallery } from './components/ImageGallery';
import { db } from './firebase';
import { ref, onValue, set } from "firebase/database";

function App() {
  const [activeFolderId, setActiveFolderId] = useState('study');
  const [activeNoteId, setActiveNoteId] = useState(null);

  // Initialize with empty state (loaded from FB)
  const [notes, setNotes] = useState([]);
  const [images, setImages] = useState([]); // New images state
  const [folders, setFolders] = useState([
    { id: 'notes', name: 'Notes', type: 'system', icon: 'FileText' },
    { id: 'study', name: '..study', type: 'custom', icon: 'Folder' },
    { id: 'terms', name: 'Terms', type: 'system', icon: 'Book' },
    { id: 'images', name: 'Images', type: 'system', icon: 'Camera' },
    { id: 'deleted', name: 'Recently Deleted', type: 'system', icon: 'Trash2' },
  ]);
  const [explanations, setExplanations] = useState({});

  // -------------------------------------------------------------------------
  // FIREBASE SYNC: LISTENERS (Downstream: Cloud -> Local)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const notesRef = ref(db, 'notes');
    const foldersRef = ref(db, 'folders');
    const explanationsRef = ref(db, 'explanations');
    const imagesRef = ref(db, 'images');

    const unsubNotes = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setNotes(data);
    });

    const unsubFolders = onValue(foldersRef, (snapshot) => {
      const data = snapshot.val();
      // Ensure system folders always exist, even if DB doesn't have them
      const systemFolders = [
        { id: 'notes', name: 'Notes', type: 'system', icon: 'FileText' },
        { id: 'terms', name: 'Terms', type: 'system', icon: 'Book' },
        { id: 'images', name: 'Images', type: 'system', icon: 'Camera' },
        { id: 'deleted', name: 'Recently Deleted', type: 'system', icon: 'Trash2' }
      ];

      if (data) {
        // Merge DB folders with forced system folders
        // 1. Keep all custom folders from DB
        const customFolders = data.filter(f => f.type === 'custom');
        // 2. Reconstruct list: Notes -> Custom -> Terms -> Images -> Deleted
        const newFolderList = [
          systemFolders[0], // Notes
          ...customFolders,
          systemFolders[1], // Terms
          systemFolders[2], // Images
          systemFolders[3]  // Deleted
        ];
        setFolders(newFolderList);
      } else {
        // Initial seed if DB empty with just system folders + default study
        const initialFolders = [
          systemFolders[0],
          { id: 'study', name: '..study', type: 'custom', icon: 'Folder' },
          systemFolders[1],
          systemFolders[2],
          systemFolders[3]
        ];
        set(foldersRef, initialFolders);
        setFolders(initialFolders);
      }
    });

    const unsubExplanations = onValue(explanationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setExplanations(data);
    });

    const unsubImages = onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setImages(data);
    });

    return () => {
      unsubNotes();
      unsubFolders();
      unsubExplanations();
      unsubImages();
    };
  }, []);

  // Sync helpers (Upstream: Local -> Cloud)
  const saveNotes = (newNotes) => set(ref(db, 'notes'), newNotes);
  const saveFolders = (newFolders) => set(ref(db, 'folders'), newFolders);
  const saveExplanations = (newExplanations) => set(ref(db, 'explanations'), newExplanations);
  const saveImages = (newImages) => set(ref(db, 'images'), newImages);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------

  const addFolder = () => {
    const newFolder = {
      id: Date.now().toString(),
      name: 'New Folder',
      type: 'custom',
      icon: 'Folder'
    };

    // Logic: Insert before 'Recently Deleted' (last item)
    setFolders(prev => {
      const newFolders = [
        ...prev.slice(0, prev.length - 1),
        newFolder,
        prev[prev.length - 1]
      ];
      saveFolders(newFolders);
      return newFolders;
    });
    setActiveFolderId(newFolder.id);
  };

  const renameFolder = (id, newName) => {
    setFolders(prev => {
      const newFolders = prev.map(f => f.id === id ? { ...f, name: newName } : f);
      saveFolders(newFolders);
      return newFolders;
    });
  };

  const deleteFolder = (id) => {
    // 1. Remove folder
    setFolders(prev => {
      const newFolders = prev.filter(f => f.id !== id);
      saveFolders(newFolders);
      return newFolders;
    });

    // 2. Move notes to Trash
    setNotes(prev => {
      const newNotes = prev.map(n => n.folderId === id ? { ...n, folderId: 'deleted' } : n);
      saveNotes(newNotes);
      return newNotes;
    });

    if (activeFolderId === id) setActiveFolderId('notes');
  };

  const updateNoteContent = (id, newContent) => {
    setNotes(prev => {
      const newNotes = prev.map(n => n.id === id ? { ...n, content: newContent } : n);
      saveNotes(newNotes);
      return newNotes;
    });
  };

  const renameNote = (id, newTitle) => {
    setNotes(prev => {
      const newNotes = prev.map(n => n.id === id ? { ...n, title: newTitle } : n);
      saveNotes(newNotes);
      return newNotes;
    });
  };

  const deleteNote = (id) => {
    setNotes(prev => {
      const noteToDelete = prev.find(n => n.id === id);
      if (noteToDelete && noteToDelete.folderId === 'deleted') {
        // Permanent delete
        const newNotes = prev.filter(n => n.id !== id);
        saveNotes(newNotes);
        return newNotes;
      } else {
        // Soft delete (move to trash)
        const newNotes = prev.map(n => n.id === id ? { ...n, folderId: 'deleted' } : n);
        saveNotes(newNotes);
        return newNotes;
      }
    });
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const moveNote = (id, targetFolderId) => {
    setNotes(prev => {
      const newNotes = prev.map(n => n.id === id ? { ...n, folderId: targetFolderId } : n);
      saveNotes(newNotes);
      return newNotes;
    });
  };

  const handleFileUpload = async (event, targetFolderId) => {
    const file = event.target.files[0];
    if (!file) return;

    const folderIdToUse = targetFolderId || activeFolderId;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const newNote = {
          id: Date.now(),
          title: file.name.replace('.docx', ''),
          content: result.value,
          preview: result.value.substring(0, 50).replace(/<[^>]*>?/gm, '') + '...',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          folderId: folderIdToUse
        };

        setNotes(prev => {
          const newNotes = [newNote, ...prev];
          saveNotes(newNotes);
          return newNotes;
        });

        setActiveNoteId(newNote.id);
        if (activeFolderId !== folderIdToUse) {
          setActiveFolderId(folderIdToUse);
        }
      } catch (error) {
        console.error("Error parsing DOCX:", error);
        alert("Failed to parse DOCX file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  const addExplanation = (term, explanation) => {
    const lowerTerm = term.toLowerCase();
    const newEntry = {
      id: Date.now(),
      text: explanation,
      source: activeNote ? activeNote.title : 'Unknown Note'
    };

    setExplanations(prev => {
      const existing = prev[lowerTerm] || [];
      const newExplanations = { ...prev, [lowerTerm]: [...existing, newEntry] };
      saveExplanations(newExplanations);
      return newExplanations;
    });
  };

  // Wrapper for TermManager updates
  const handleUpdateExplanations = (newExplanations) => {
    setExplanations(newExplanations);
    saveExplanations(newExplanations);
  };

  const handleUploadImage = async (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const newImage = {
        id: Date.now(),
        url: base64String,
        timestamp: Date.now()
      };

      setImages(prev => {
        const newImages = [newImage, ...prev];
        saveImages(newImages);
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (id) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      saveImages(newImages);
      return newImages;
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        folders={folders}
        notes={notes}
        activeFolderId={activeFolderId}
        activeNoteId={activeNoteId}
        onFolderSelect={setActiveFolderId}
        onNoteSelect={setActiveNoteId}
        onAddFolder={addFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
        onRenameNote={renameNote}
        onDeleteNote={deleteNote}
        onMoveNote={moveNote}
      />
      {activeFolderId === 'terms' ? (
        <TermManager
          explanations={explanations}
          onUpdateExplanations={handleUpdateExplanations}
        />
      ) : activeFolderId === 'images' ? (
        <ImageGallery
          images={images}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
        />
      ) : (
        <NoteEditor
          activeNote={activeNote}
          folders={folders}
          explanations={explanations}
          images={images}
          onUpdateContent={updateNoteContent}
          onFileUpload={handleFileUpload}
          onAddExplanation={addExplanation}
          onUploadImage={handleUploadImage}
        />
      )}
    </div>
  );
}

export default App;
