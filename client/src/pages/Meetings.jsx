import { useState, useEffect } from "react";
import microsoft from "../assets/image/microsoft.jpg";
import google from "../assets/image/google.jpg";
import amazon from "../assets/image/amazon.jpg";

const INITIAL_MEETINGS = [
  {
    id: "m-1",
    title: "Candidate Technical Screen: Silicon Architecture",
    company: "Silicon Switch Tech",
    date: "2026-09-22",
    time: "10:00 AM - 11:00 AM",
    type: "Technical Interview",
    host: "Shiv Kumar (CEO)",
    attendees: "Shiv Kumar, Candidate, HR Lead",
    status: "live"
  },
  {
    id: "m-2",
    title: "Enterprise Azure AI Integration Briefing",
    company: "Microsoft",
    date: "2026-09-23",
    time: "02:00 PM - 03:00 PM",
    type: "Executive Briefing",
    host: "Enterprise Solutions Team",
    attendees: "Director of IT, Solutions Architect",
    status: "upcoming"
  },
  {
    id: "m-3",
    title: "Global Cloud Partnership & Recruitment Sync",
    company: "Google",
    date: "2026-09-24",
    time: "11:30 AM - 12:30 PM",
    type: "Partnership Review",
    host: "Cloud Alliances Lead",
    attendees: "Strategic Partners, Talent Acquisition",
    status: "upcoming"
  },
  {
    id: "m-4",
    title: "Quarterly Supply Chain Infrastructure Alignment",
    company: "Amazon",
    date: "2026-09-26",
    time: "04:00 PM - 05:00 PM",
    type: "Quarterly Review",
    host: "AWS Enterprise Strategist",
    attendees: "VP Engineering, Principal Architect",
    status: "upcoming"
  }
];

function Meetings() {
  const [meetings, setMeetings] = useState(() => {
    try {
      const stored = localStorage.getItem("mnc_meetings");
      return stored ? JSON.parse(stored) : INITIAL_MEETINGS;
    } catch {
      return INITIAL_MEETINGS;
    }
  });

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    company: "",
    date: "",
    time: "",
    type: "Technical Interview",
    host: "",
    attendees: ""
  });

  // Room Simulator Modal
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomTime, setRoomTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Save meetings to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem("mnc_meetings", JSON.stringify(meetings));
    } catch (err) {
      console.error("Failed to save meetings to localStorage:", err);
    }
  }, [meetings]);

  // Call timer effect
  useEffect(() => {
    if (!activeRoom) return;

    const interval = setInterval(() => {
      setRoomTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim() || !scheduleForm.company.trim()) {
      alert("Title and Company are required.");
      return;
    }

    const newMeeting = {
      id: `m-${Date.now()}`,
      title: scheduleForm.title.trim(),
      company: scheduleForm.company.trim(),
      date: scheduleForm.date || new Date().toISOString().split("T")[0],
      time: scheduleForm.time || "10:00 AM - 11:00 AM",
      type: scheduleForm.type || "Technical Interview",
      host: scheduleForm.host.trim() || "Corporate Coordinator",
      attendees: scheduleForm.attendees.trim() || "Invited Participants",
      status: "upcoming"
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setScheduleForm({
      title: "",
      company: "",
      date: "",
      time: "",
      type: "Technical Interview",
      host: "",
      attendees: ""
    });
    setIsScheduleModalOpen(false);
  };

  const handleDeleteMeeting = (id, title) => {
    if (window.confirm(`Cancel and remove meeting "${title}"?`)) {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const renderCompanyIcon = (name) => {
    const n = (name || "").toLowerCase().trim();
    if (n.includes("microsoft")) return <img src={microsoft} alt="MS" style={{ width: "26px", height: "26px", objectFit: "contain" }} />;
    if (n.includes("google")) return <img src={google} alt="G" style={{ width: "26px", height: "26px", objectFit: "contain" }} />;
    if (n.includes("amazon")) return <img src={amazon} alt="A" style={{ width: "26px", height: "26px", objectFit: "contain" }} />;
    return <span style={{ fontWeight: "800", fontSize: "15px", color: "#000000" }}>{name ? name.charAt(0).toUpperCase() : "M"}</span>;
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase()) ||
      m.host.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "live") return matchesSearch && m.status === "live";
    if (activeTab === "interviews") return matchesSearch && m.type.toLowerCase().includes("interview");
    if (activeTab === "executive") return matchesSearch && !m.type.toLowerCase().includes("interview");
    return matchesSearch;
  });

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="page-header-row">
        <div className="page-header-title">
          <p className="section-tag" style={{ margin: 0, marginBottom: "6px" }}>
            COLLABORATION & BRIEFINGS
          </p>
          <h1>Corporate Meetings</h1>
          <p>
            Schedule, manage, and join executive sessions, candidate technical screens, and partner reviews.
          </p>
        </div>

        <div className="page-actions">
          <div className="search-bar-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search meetings, hosts, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="btn-add-company"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", borderBottom: "2px solid var(--color-border)", paddingBottom: "12px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: `All Meetings (${meetings.length})` },
          { id: "live", label: "Live Now" },
          { id: "interviews", label: "Interviews" },
          { id: "executive", label: "Executive Briefings" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "7px 18px",
              borderRadius: "6px",
              border: "1.5px solid var(--color-primary)",
              background: activeTab === tab.id ? "var(--color-primary)" : "#ffffff",
              color: activeTab === tab.id ? "#ffffff" : "var(--color-primary)",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              transition: "all 0.18s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <div className="empty-state">
          <h3>No Meetings Found</h3>
          <p>There are no meetings matching your current filter criteria.</p>
          <button
            className="btn-add-company"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            + Schedule New Session
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="glass-card meeting-card-item"
            >
              <div className="meeting-card-details">
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "8px",
                    border: "2px solid var(--color-primary)",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {renderCompanyIcon(m.company)}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span className={`badge-status ${m.status === "live" ? "live" : "upcoming"}`}>
                      {m.status === "live" ? "● Live In Room" : "Scheduled"}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", border: "1px solid var(--color-border)", padding: "2px 8px", borderRadius: "4px", color: "var(--color-primary)" }}>
                      {m.type}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "22px", margin: "0 0 6px 0", color: "var(--color-primary)", fontFamily: "var(--font-serif)" }}>{m.title}</h2>
                  <p style={{ color: "var(--color-slate-600)", fontSize: "14px", margin: 0, wordBreak: "break-word" }}>
                    <strong>Enterprise:</strong> {m.company} &nbsp;|&nbsp; <strong>Host:</strong> {m.host} &nbsp;|&nbsp; <strong>Attendees:</strong> {m.attendees}
                  </p>
                </div>
              </div>

              <div className="meeting-card-actions">
                <div className="meeting-time-box">
                  <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--color-primary)" }}>{m.date}</div>
                  <div style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>{m.time}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    className="btn-primary"
                    style={{
                      padding: "9px 20px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13.5px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    onClick={() => {
                      setRoomTime(0);
                      setActiveRoom(m);
                      setIsMuted(false);
                      setIsVideoOff(false);
                      setIsSharing(false);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Join Room
                  </button>

                  <button
                    onClick={() => handleDeleteMeeting(m.id, m.title)}
                    style={{
                      background: "transparent",
                      border: "1px solid #000000",
                      borderRadius: "50%",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontWeight: "700",
                      color: "#000000",
                      flexShrink: 0
                    }}
                    title="Cancel meeting"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal Dialog */}
      {isScheduleModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Corporate Meeting</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group">
                <label htmlFor="m-title">Meeting Title / Subject <span>*</span></label>
                <input
                  id="m-title"
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Senior Cloud Architect Technical Screen"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-company">Associated Enterprise / Company <span>*</span></label>
                <input
                  id="m-company"
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Microsoft, Google, Amazon, Silicon Switch"
                  value={scheduleForm.company}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, company: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="m-date">Date</label>
                  <input
                    id="m-date"
                    type="date"
                    className="glass-input"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="m-time">Time</label>
                  <input
                    id="m-time"
                    type="text"
                    className="glass-input"
                    placeholder="10:00 AM - 11:00 AM"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="m-type">Meeting Classification</label>
                <select
                  id="m-type"
                  className="glass-select"
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                >
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="Executive Briefing">Executive Briefing</option>
                  <option value="Partnership Review">Partnership Review</option>
                  <option value="Board Alignment">Board Alignment</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="m-host">Session Host / Lead</label>
                <input
                  id="m-host"
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Director of Engineering"
                  value={scheduleForm.host}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, host: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Virtual Room Simulator Modal */}
      {activeRoom && (
        <div className="modal-backdrop" onClick={() => { setActiveRoom(null); setRoomTime(0); }}>
          <div
            className="glass-modal room-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span className="badge-status live">● Live Connection</span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>{formatTimer(roomTime)}</span>
                </div>
                <h2 style={{ fontSize: "22px", margin: 0 }}>{activeRoom.title}</h2>
                <p style={{ fontSize: "13px", color: "#52525b", margin: "2px 0 0" }}>
                  Room: {activeRoom.company} Enterprise Room &nbsp;|&nbsp; Host: {activeRoom.host}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => { setActiveRoom(null); setRoomTime(0); }}
                title="Leave Meeting"
              >
                ✕
              </button>
            </div>

            {/* Video Streams Simulator */}
            <div className="meeting-video-grid">
              {/* Tile 1: Enterprise Representative */}
              <div
                style={{
                  background: "#f9f9fb",
                  border: "2px solid #000000",
                  borderRadius: "10px",
                  height: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    border: "2px solid #000000",
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    marginBottom: "10px"
                  }}
                >
                  {renderCompanyIcon(activeRoom.company)}
                </div>
                <span style={{ fontWeight: "700", fontSize: "15px" }}>{activeRoom.company} Executive</span>
                <span style={{ fontSize: "12px", color: "#52525b" }}>Speaking ●</span>

                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "12px",
                    background: "#000000",
                    color: "#ffffff",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: "700"
                  }}
                >
                  Lead Presenter
                </div>
              </div>

              {/* Tile 2: User / Local Camera Feed */}
              <div
                style={{
                  background: isVideoOff ? "#000000" : "#f4f4f5",
                  border: "2px solid #000000",
                  borderRadius: "10px",
                  height: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  color: isVideoOff ? "#ffffff" : "#000000"
                }}
              >
                {isVideoOff ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>📷</div>
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>Camera Off</span>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        border: "2px solid #000000",
                        borderRadius: "50%",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "800",
                        marginBottom: "10px",
                        color: "#000000"
                      }}
                    >
                      YOU
                    </div>
                    <span style={{ fontWeight: "700", fontSize: "15px" }}>Participant (You)</span>
                    <span style={{ fontSize: "12px", color: "#52525b" }}>
                      {isMuted ? "Muted 🔇" : "Audio Active 🎙️"}
                    </span>
                  </>
                )}

                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "12px",
                    background: isVideoOff ? "#ffffff" : "#000000",
                    color: isVideoOff ? "#000000" : "#ffffff",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: "700"
                  }}
                >
                  Local Device
                </div>
              </div>
            </div>

            {/* Room Control Bar */}
            <div className="room-control-bar">
              <button
                className="btn-secondary"
                style={{
                  background: isMuted ? "#000000" : "#ffffff",
                  color: isMuted ? "#ffffff" : "#000000"
                }}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? "Unmute Mic" : "Mute Mic"}
              </button>

              <button
                className="btn-secondary"
                style={{
                  background: isVideoOff ? "#000000" : "#ffffff",
                  color: isVideoOff ? "#ffffff" : "#000000"
                }}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              </button>

              <button
                className="btn-secondary"
                style={{
                  background: isSharing ? "#000000" : "#ffffff",
                  color: isSharing ? "#ffffff" : "#000000"
                }}
                onClick={() => setIsSharing(!isSharing)}
              >
                {isSharing ? "Stop Screen Share" : "Share Screen"}
              </button>

              <button
                style={{
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "1.5px solid #ef4444",
                  padding: "9px 20px",
                  borderRadius: "9999px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
                onClick={() => { setActiveRoom(null); setRoomTime(0); }}
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Meetings;
