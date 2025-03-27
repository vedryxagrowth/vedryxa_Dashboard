import React, { useState, useEffect } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { PictureOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { message } from "antd"; // Assuming Ant Design is used
import moment from "moment";
import { useTokenContext } from "./parent";

// Your image upload API (you provided this)


const fixedColor = "#fffec8";

const StickyNotes = ({ userEmail, userdetails, setOpen }) => {
  
  const { apiClient } = useTokenContext();

  const [notes, setNotes] = useState([]);
  const [openNote, setOpenNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleMultipleFileUpload = async (files, userdetails) => {
    if (!files.length || !userdetails?.userName) {
      message.error("No files or user details!");
      return [];
    }
    const uploadDate = moment().format("YYYY-MM-DD");
    const uploadedUrls = [];
    for (const file of files) {
      const extension = file.name.split(".").pop();
      const uniqueFilename = `${uuidv4()}.${extension}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadDate", uploadDate);
      formData.append("filename", uniqueFilename);
      try {
        const response = await axios.post("https://prodapis.adsgoat.in/uploadUserFiles", formData, {
          headers: {
            Authorization: localStorage.getItem("token"),
            // username: userdetails.userName,
          },
        });
        const imageUrl = response.data?.imageUrl;
        if (imageUrl) {
          uploadedUrls.push(imageUrl);
          // message.success(`${file.name} uploaded as ${uniqueFilename}`);
        } else {
          message.error(`No URL returned for ${file.name}`);
        }
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error.response?.data || error.message);
        message.error(`Failed to upload ${file.name}`);
      }
    }
    return uploadedUrls;
  };

  useEffect(() => {
    apiClient.get(`/notes/${userEmail}`)
      .then(res => setNotes(res.data))
      .catch(err => console.error("Failed to fetch notes", err));
  }, [userEmail]);

  const saveToDB = (updated) => {
    setNotes(updated);
    apiClient.post("/notes", { email: userEmail, notes: updated })
      .catch(err => console.error("Failed to save", err));
  };

  const addNote = () => {
    const newNote = {
      id: uuidv4(),
      text: "",
      images: [],
      timestamp: dayjs().format("YYYY-MM-DD HH:mm"),
      color: fixedColor,
    };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    setOpenNote(newNote);
    saveToDB(newNotes);
  };

  const updateText = (id, newText) => {
    if (openNote?.id === id) {
      setOpenNote({ ...openNote, text: newText });
    }
    const updated = notes.map(n => n.id === id ? { ...n, text: newText } : n);
    saveToDB(updated);
  };

  const updateImage = async (id, files) => {
    const uploadedUrls = await handleMultipleFileUpload(files, userdetails);
    if (!uploadedUrls.length) return;

    if (openNote?.id === id) {
      setOpenNote({ ...openNote, images: [...(openNote.images || []), ...uploadedUrls] });
    }
    const updated = notes.map(n =>
      n.id === id ? { ...n, images: [...(n.images || []), ...uploadedUrls] } : n
    );
    saveToDB(updated);
  };

  const deleteImage = (noteId, imgIndex) => {
    if (openNote?.id === noteId) {
      const copyImgs = [...openNote.images];
      copyImgs.splice(imgIndex, 1);
      setOpenNote({ ...openNote, images: copyImgs });
    }
    const updated = notes.map(n => {
      if (n.id !== noteId) return n;
      const imgs = [...n.images];
      imgs.splice(imgIndex, 1);
      return { ...n, images: imgs };
    });
    saveToDB(updated);
  };

  const deleteNote = (id) => {
    apiClient.delete(`/notes/${userEmail}/${id}`)
      .then(() => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        if (openNote?.id === id) setOpenNote(null);
        saveToDB(updated);
      })
      .catch(err => console.error("Delete failed", err));
  };

  const openItem = (note) => setOpenNote(note);
  const closeCurrentNote = () => setOpenNote(null);

  return (
    <>
      {/* Fullscreen Image Overlay */}
      {selectedImage && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100000,
        }}>
          <img src={selectedImage} alt="fullscreen-img" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }} />
          <button onClick={() => setSelectedImage(null)} style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "2px solid #fff",
            color: "#fff",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "18px",
            padding: "5px 10px"
          }}>✖</button>
        </div>
      )}

      {/* Notes Container */}
      <Draggable>
        <div style={{ position: "absolute", top: "50px", right: "50px", minHeight: "340px", width: "350px", padding: "10px", borderRadius: "8px", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", zIndex: selectedImage ? -1 : 9999 }}>
          <div className="notes-header" style={{ cursor: "grab", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
            <button onClick={addNote} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}><PlusOutlined /></button>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>✖</button>
          </div>
          <h3 style={{ margin: "0 0 10px 0" }}>Sticky Notes</h3>
          <input type="text" placeholder="Search..." style={{ width: "100%", marginBottom: "10px", padding: "5px", borderRadius: "5px", border: "none", backgroundColor: "#F0F0F0" }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
            {notes.filter(n => n.text.toLowerCase().includes(searchTerm.toLowerCase())).map(note => (
              <div key={note.id} onClick={() => openItem(note)} style={{ background: "#fff6c1", marginBottom: "5px", padding: "5px", cursor: "pointer", borderRadius: "5px" }}>
                {note.text.substring(0, 20) || "New Note"}
                <span style={{ float: "right", fontSize: "12px", color: "gray" }}>{note.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </Draggable>

      {openNote && (
        <Draggable defaultPosition={{ x: -800, y: 50 }}>
          <div style={{ position: "absolute", backgroundColor: openNote.color, width: "350px", height: "340px", borderRadius: "8px", boxShadow: "0 1px 5px rgba(0,0,0,0.2)", zIndex: 9998, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <span style={{ fontSize: "12px", color: "#555" }}>{openNote.timestamp}</span>
              <button onClick={closeCurrentNote} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>✖</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              <textarea value={openNote.text} onChange={(e) => updateText(openNote.id, e.target.value)} placeholder="Take a note..." style={{ width: "100%", height: "60px", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: "14px", marginBottom: "6px", color: "#000" }} />
              {openNote.images?.map((imgSrc, idx) => (
                <div key={idx} style={{ position: "relative", marginBottom: "6px" }}>
                  <img src={imgSrc} alt={`note-img-${idx}`} onClick={() => setSelectedImage(imgSrc)} style={{ width: "100%", maxHeight: "80px", objectFit: "cover", borderRadius: "4px", cursor: "pointer" }} />
                  <button onClick={() => deleteImage(openNote.id, idx)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(255,0,0,0.7)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "50%", width: "20px", height: "20px", fontSize: "12px", lineHeight: "20px", textAlign: "center" }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "10px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              <label title="Insert image" style={{ background: "none", border: "none", cursor: "pointer" }}>
                <PictureOutlined />
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => updateImage(openNote.id, e.target.files)} />
              </label>
              <button title="Delete Note" style={{ background: "none", border: "none", cursor: "pointer", color: "red", marginLeft: "10px" }} onClick={() => deleteNote(openNote.id)}><DeleteOutlined /></button>
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default StickyNotes;