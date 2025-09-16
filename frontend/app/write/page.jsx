"use client";
import { useState, useEffect } from "react";
import './page.css';

export default function Write() {
  const [poet, setPoet] = useState("");
  const [mode, setMode] = useState("topic"); // "topic" or "image"
  const [topic, setTopic] = useState("");
  const [image, setImage] = useState(null);
  const [fullPoem, setFullPoem] = useState(""); // complete poem from backend
  const [poem, setPoem] = useState("");         // animated display
  const [loading, setLoading] = useState(false);

  // Typing effect using useEffect
  useEffect(() => {
    if (!fullPoem) return;

    setPoem(""); // reset displayed poem
    let index = 0;
    const interval = setInterval(() => {
      setPoem((prev) => prev + fullPoem[index]);
      index++;
      if (index == fullPoem.length-1) clearInterval(interval);
    }, 30); // 30ms per character

    return () => clearInterval(interval); // cleanup if fullPoem changes
  }, [fullPoem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "topic" && !topic) {
      alert("Please enter a topic.");
      return;
    }
    if (mode === "image" && !image) {
      alert("Please upload an image.");
      return;
    }

    setLoading(true);
    setPoem("");
    setFullPoem("");

    try {
      let res;
      if (mode === "image") {
        const formData = new FormData();
        formData.append("poet", poet);
        formData.append("image", image);

        res = await fetch("http://127.0.0.1:5000/write-image", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("http://127.0.0.1:5000/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poet, topic }),
        });
      }

      const data = await res.json();
      setFullPoem(data.poem); // trigger typing effect
    } catch (err) {
      console.error(err);
      setPoem("⚠️ Error: Could not fetch poem.");
    }

    setLoading(false);
  };

  return (
    <div className="write-container">
      <h1>Write a Poem 🎭</h1>

      {/* Poet input */}
      <input
        type="text"
        placeholder="Enter poet's name (e.g., Robert Frost)"
        value={poet}
        onChange={(e) => setPoet(e.target.value)}
        className="poet-input"
        required
      />

      {/* Mode selection buttons */}
      <div className="mode-buttons">
        <button
          type="button"
          className={mode === "topic" ? "active" : ""}
          onClick={() => setMode("topic")}
        >
          Enter Topic
        </button>
        <button
          type="button"
          className={mode === "image" ? "active" : ""}
          onClick={() => setMode("image")}
        >
          Upload Image
        </button>
      </div>

      {/* Conditional inputs */}
      <form onSubmit={handleSubmit} className="write-form">
        {mode === "topic" && (
          <input
            type="text"
            placeholder="Enter topic (e.g., friendship)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        )}

        {mode === "image" && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
            {image && (
              <div className="image-preview">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                />
              </div>
            )}
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Poem"}
        </button>
      </form>

      {poem && (
        <div className="write-poemBox">
          <h2>Your Poem</h2>
          <pre>{poem}</pre>
        </div>
      )}
    </div>
  );
}
