function Home() {
  return (
    <div className="home container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4 text-center">Welcome to 5199's Scouting App!</h1>
          
          <div className="text-center">
            <p><u>Important!!!</u></p>
            <p>The website is functional even if the user goes offline while filling out the form. However, once the form is submitted, be sure to reconnect to Wi-Fi so that data can be sent to the google sheet for compilation.</p>
            
            <br />
            <br />
            <br />
            <br />
            <br />
            
            <p>This website is used for scouting to determine the best robots and teams to choose during Alliance Selection. Currently we only have stand scouting available on the app, but pit scouting will be added in the future.</p>
            
            <br />
            <br />
            
            <p>Stand scouting is the main type of scouting done in FRC. Stand scouting is done by scouters in the stands collecting data on the performance of robots during matches. The stand scouting form can be found in the menu bar.</p>
            
            <br />
            <br />
            
            <p>Pit scouting done by scouters in the pits collecting robot data, such as dimensions and weight of the robot. Pit scouters also upload an image of the robot. Pit scouting has not yet been created on this website.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;



// AI generated home page
// import { Link } from "react-router-dom";

// const Dolphin_IMAGE =
//   "/public/icons/5199_Robot_Dolphins_image.jpg";

// const ROBOT_IMAGE =
//   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/FIRST_Robotics_Competition_Logo.svg/800px-FIRST_Robotics_Competition_Logo.svg.png";

// export default function Home() {
//   return (
//     <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0a0f1e", minHeight: "100vh", color: "#fff" }}>

//       {/* ── Hero ── */}
//       <div style={{ position: "relative", height: "92vh", minHeight: 520, overflow: "hidden", display: "flex", alignItems: "center" }}>
//         {/* Background image */}
//         <img
//           src={Dolphin_IMAGE}
//           alt="FRC Competition"
//           style={{
//             position: "absolute", inset: 0, width: "100%", height: "100%",
//             objectFit: "cover", objectPosition: "center",
//             filter: "brightness(0.32) saturate(1.2)",
//           }}
//         />

//         {/* Gradient overlay */}
//         <div style={{
//           position: "absolute", inset: 0,
//           background: "linear-gradient(135deg, rgba(0,60,180,0.55) 0%, rgba(0,180,255,0.18) 60%, transparent 100%)",
//         }} />

//         {/* Animated grid lines */}
//         <div style={{
//           position: "absolute", inset: 0,
//           backgroundImage: "linear-gradient(rgba(0,150,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,255,0.07) 1px, transparent 1px)",
//           backgroundSize: "60px 60px",
//         }} />

//         {/* Hero content */}
//         <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "0 2rem", textAlign: "center", width: "100%" }}>

//           {/* Team badge */}
//           <div style={{
//             display: "inline-flex", alignItems: "center", gap: "0.6rem",
//             background: "rgba(0,150,255,0.18)", border: "1px solid rgba(0,180,255,0.4)",
//             borderRadius: "100px", padding: "0.45rem 1.2rem", marginBottom: "1.8rem",
//             backdropFilter: "blur(8px)", fontSize: "0.85rem", letterSpacing: "0.12em",
//             textTransform: "uppercase", color: "#7dd3fc",
//           }}>
//             <span style={{ fontSize: "1.1rem" }}>🐬</span>
//             FRC Team 5199 · Robot Dolphins from Outer Space
//           </div>

//           <h1 style={{
//             fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 900,
//             lineHeight: 1.05, marginBottom: "1.2rem",
//             textShadow: "0 4px 40px rgba(0,150,255,0.4)",
//             letterSpacing: "-0.02em",
//           }}>
//             <span style={{ color: "#fff" }}>Scout </span>
//             <span style={{
//               background: "linear-gradient(90deg, #38bdf8, #60a5fa, #a78bfa)",
//               WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//             }}>Smarter.</span>
//             <br />
//             <span style={{ color: "#fff" }}>Win </span>
//             <span style={{
//               background: "linear-gradient(90deg, #34d399, #38bdf8)",
//               WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//             }}>Together.</span>
//           </h1>

//           <p style={{
//             fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "#94a3b8",
//             maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.7,
//           }}>
//             The official scouting platform for Team 5199. Collect match data,
//             scout the pits, and dominate alliance selection — online or offline.
//           </p>

//           <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
//             <Link to="/stand-scouting" style={{
//               background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
//               color: "#fff", textDecoration: "none", padding: "0.85rem 2.2rem",
//               borderRadius: "0.6rem", fontWeight: 700, fontSize: "1rem",
//               boxShadow: "0 8px 32px rgba(37,99,235,0.45)",
//               transition: "transform 0.15s, box-shadow 0.15s",
//               display: "inline-flex", alignItems: "center", gap: "0.5rem",
//             }}
//               onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(37,99,235,0.6)"; }}
//               onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.45)"; }}
//             >
//               🎯 Start Stand Scouting
//             </Link>
//             <Link to="/pit-scouting" style={{
//               background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)",
//               color: "#fff", textDecoration: "none", padding: "0.85rem 2.2rem",
//               borderRadius: "0.6rem", fontWeight: 700, fontSize: "1rem",
//               backdropFilter: "blur(8px)",
//               transition: "transform 0.15s, background 0.15s",
//               display: "inline-flex", alignItems: "center", gap: "0.5rem",
//             }}
//               onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "rgba(255,255,255,0.13)"; }}
//               onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
//             >
//               🔧 Pit Scouting
//             </Link>
//           </div>
//         </div>

//         {/* Scroll indicator */}
//         <div style={{
//           position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
//           display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
//           color: "#475569", fontSize: "0.75rem", letterSpacing: "0.1em",
//           animation: "bounce 2s infinite",
//         }}>
//           <span>SCROLL</span>
//           <span style={{ fontSize: "1.2rem" }}>↓</span>
//         </div>
//       </div>

//       {/* ── Offline notice banner ── */}
//       <div style={{
//         background: "linear-gradient(90deg, #1e3a5f, #1e4d3f)",
//         borderTop: "1px solid rgba(56,189,248,0.2)",
//         borderBottom: "1px solid rgba(52,211,153,0.2)",
//         padding: "1rem 2rem",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         gap: "1rem", flexWrap: "wrap", textAlign: "center",
//       }}>
//         <span style={{ fontSize: "1.3rem" }}>📡</span>
//         <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem", maxWidth: 680 }}>
//           <strong style={{ color: "#38bdf8" }}>Works offline.</strong>{" "}
//           Fill out forms without Wi-Fi — data is saved locally and automatically
//           syncs to Google Sheets the moment you reconnect.
//         </p>
//       </div>

//       {/* ── Feature cards ── */}
//       <div style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem" }}>
//         <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
//           <p style={{ color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
//             What We Scout
//           </p>
//           <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, margin: 0 }}>
//             Everything you need for Alliance Selection
//           </h2>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
//           {[
//             {
//               icon: "🏟️",
//               title: "Stand Scouting",
//               color: "#2563eb",
//               glow: "rgba(37,99,235,0.3)",
//               desc: "Track robot performance match-by-match from the stands. Record autonomous paths, fuel scored, climb results, defense ratings, and more.",
//               link: "/stand-scouting",
//               cta: "Open Form →",
//             },
//             {
//               icon: "🔩",
//               title: "Pit Scouting",
//               color: "#059669",
//               glow: "rgba(5,150,105,0.3)",
//               desc: "Collect robot specs directly in the pits — dimensions, drive motors, vision systems, shooter type, and upload a photo of each robot.",
//               link: "/pit-scouting",
//               cta: "Open Form →",
//             },
//             {
//               icon: "📊",
//               title: "Data Review",
//               color: "#7c3aed",
//               glow: "rgba(124,58,237,0.3)",
//               desc: "Review all submitted stand and pit scouting entries. Verify data quality before alliance selection to make the best picks.",
//               link: "/statistics",
//               cta: "View Data →",
//             },
//           ].map((card) => (
//             <Link
//               key={card.title}
//               to={card.link}
//               style={{ textDecoration: "none" }}
//             >
//               <div style={{
//                 background: "rgba(255,255,255,0.04)",
//                 border: `1px solid rgba(255,255,255,0.09)`,
//                 borderRadius: "1rem", padding: "2rem",
//                 height: "100%", cursor: "pointer",
//                 transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
//                 display: "flex", flexDirection: "column", gap: "1rem",
//               }}
//                 onMouseEnter={e => {
//                   e.currentTarget.style.transform = "translateY(-4px)";
//                   e.currentTarget.style.boxShadow = `0 20px 60px ${card.glow}`;
//                   e.currentTarget.style.borderColor = card.color;
//                 }}
//                 onMouseLeave={e => {
//                   e.currentTarget.style.transform = "";
//                   e.currentTarget.style.boxShadow = "";
//                   e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
//                 }}
//               >
//                 <div style={{
//                   width: 52, height: 52, borderRadius: "0.75rem",
//                   background: `${card.color}22`, border: `1px solid ${card.color}44`,
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   fontSize: "1.6rem",
//                 }}>
//                   {card.icon}
//                 </div>
//                 <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>
//                   {card.title}
//                 </h3>
//                 <p style={{ margin: 0, color: "#64748b", fontSize: "0.93rem", lineHeight: 1.65, flex: 1 }}>
//                   {card.desc}
//                 </p>
//                 <span style={{ color: card.color, fontWeight: 600, fontSize: "0.9rem" }}>
//                   {card.cta}
//                 </span>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* ── Tips section ── */}
//       <div style={{
//         background: "rgba(255,255,255,0.025)",
//         borderTop: "1px solid rgba(255,255,255,0.07)",
//         borderBottom: "1px solid rgba(255,255,255,0.07)",
//         padding: "4rem 2rem",
//       }}>
//         <div style={{ maxWidth: 860, margin: "0 auto" }}>
//           <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, marginBottom: "2.5rem" }}>
//             ⚠️ Important Notes
//           </h2>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
//             {[
//               { icon: "📶", title: "Reconnect After Submitting", text: "After submitting a form, reconnect to Wi-Fi so your data syncs to Google Sheets automatically." },
//               { icon: "💾", title: "Auto-Saved Offline", text: "Forms are saved locally as you type. You will never lose data even if the app closes unexpectedly." },
//               { icon: "🤝", title: "Shared Scouting Data", text: "Data from all scouters is compiled together in the sheet to give the most accurate picture of each team." },
//             ].map((tip) => (
//               <div key={tip.title} style={{
//                 background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem",
//                 padding: "1.5rem", border: "1px solid rgba(255,255,255,0.07)",
//                 display: "flex", flexDirection: "column", gap: "0.6rem",
//               }}>
//                 <span style={{ fontSize: "1.8rem" }}>{tip.icon}</span>
//                 <h4 style={{ margin: 0, color: "#e2e8f0", fontWeight: 700 }}>{tip.title}</h4>
//                 <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>{tip.text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Footer ── */}
//       <div style={{
//         textAlign: "center", padding: "2.5rem 1rem",
//         color: "#334155", fontSize: "0.85rem",
//         borderTop: "1px solid rgba(255,255,255,0.05)",
//       }}>
//         <span style={{ fontSize: "1.2rem" }}>🐬</span>
//         <br />
//         Built by <strong style={{ color: "#475569" }}>FRC Team 5199</strong> · Robot Dolphins from Outer Space
//         <br />
//         <span style={{ color: "#1e3a5f" }}>Scouting App · {new Date().getFullYear()}</span>
//       </div>

//       <style>{`
//         @keyframes bounce {
//           0%, 100% { transform: translateX(-50%) translateY(0); }
//           50% { transform: translateX(-50%) translateY(6px); }
//         }
//       `}</style>
//     </div>
//   );
// }