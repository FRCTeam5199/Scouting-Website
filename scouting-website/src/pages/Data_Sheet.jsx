import { useEffect, useRef } from "react";

const SHEET_ID = "1KyjH_SyzJegqQYT-1vBswwTQ-Ch--jAYR1ezyWvW5zI";

function Data_Sheet() {
  const embedUrl = `https://docs.google.com/spreadsheets/d/1KyjH_SyzJegqQYT-1vBswwTQ-Ch--jAYR1ezyWvW5zI/edit?usp=sharing`;
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const lockScroll = () => {
      document.body.style.overflow = "hidden";
    };
    const unlockScroll = () => {
      document.body.style.overflow = "";
    };

    iframe.addEventListener("mouseenter", lockScroll);
    iframe.addEventListener("mouseleave", unlockScroll);

    // Unlock if user navigates away while hovering
    return () => {
      iframe.removeEventListener("mouseenter", lockScroll);
      iframe.removeEventListener("mouseleave", unlockScroll);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      <h1 className="text-center my-3">Data Sheet</h1>
      <div style={{ flex: 1, padding: "0 1rem 1rem" }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
          title="Scouting Data Sheet"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default Data_Sheet;