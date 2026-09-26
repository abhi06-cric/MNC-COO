import { useState } from "react";

function ManageMeetings() {
  const [meetings, setMeetings] = useState([
    {
      id: "m-1",
      title: "Q4 Global Tech Ecosystem Review",
      company: "Microsoft & Google Partnerships",
      date: "2026-10-12",
      time: "14:00 EST",
      status: "Scheduled",
      host: "Satya Nadella / Executive Office",
      platform: "Secure Executive Telepresence"
    },
    {
      id: "m-2",
      title: "Enterprise AI Infrastructure Summit",
      company: "AWS & NVIDIA Strategic Alliance",
      date: "2026-10-18",
      time: "10:30 PST",
      status: "Confirmed",
      host: "Jensen Huang / AWS Cloud Leadership",
      platform: "Boardroom Alpha, Seattle"
    },
    {
      id: "m-3",
      title: "International Capital Allocation Committee",
      company: "JPMorgan Chase & Goldman Sachs",
      date: "2026-10-25",
      time: "16:00 GMT",
      status: "Scheduled",
      host: "Executive Risk & Capital Board",
      platform: "Global Financial Portal Room 01"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    date: "",
    time: "",
    host: "",
    platform: "Virtual Executive Portal"
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return;

    const newMeeting = {
      ...formData,
      id: `m-${Date.now()}`,
      status: "Scheduled"
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setIsModalOpen(false);
    setFormData({
      title: "",
      company: "",
      date: "",
      time: "",
      host: "",
      platform: "Virtual Executive Portal"
    });
  };

  const handleCancel = (id, title) => {
    if (window.confirm(`Cancel meeting "${title}"?`)) {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Corporate Meeting Management</h1>
          <p>Supervise executive briefings, strategic partnership summits, and committee sessions.</p>
        </div>

        <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Schedule Executive Meeting
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", color: "var(--color-primary)" }}>
            Upcoming Executive Meetings ({meetings.length})
          </h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Meeting Title</th>
              <th>Participating Entities</th>
              <th>Date & Time</th>
              <th>Host / Chair</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => (
              <tr key={m.id}>
                <td>
                  <strong>{m.title}</strong>
                </td>
                <td>{m.company}</td>
                <td>{m.date} at {m.time}</td>
                <td>{m.host}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      background: "#ecfdf5",
                      color: "#047857"
                    }}
                  >
                    ● {m.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-action-delete"
                    onClick={() => handleCancel(m.id, m.title)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Executive Meeting</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Meeting Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Q1 Global Strategy Review"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Participating Organizations *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Apple & Goldman Sachs Leadership"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label>Meeting Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Meeting Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 15:00 EST"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Chairperson / Host</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Chief Executive Office"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid var(--color-border)" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageMeetings;
