import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const modalStyles = `
  .pcm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(5px);
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.18s ease;
  }
  .pcm-card {
    background: #1A1A1F;
    border: 1px solid #2A2A2F;
    border-radius: 20px;
    padding: 28px;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: slideUp 0.2s ease;
    max-height: 90vh;
    overflow-y: auto;
  }
  .pcm-card::-webkit-scrollbar { width: 4px; }
  .pcm-card::-webkit-scrollbar-thumb { background: #2A2A2F; border-radius: 4px; }
  .pcm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .pcm-title {
    font-size: 20px;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0;
  }
  .pcm-close-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
  }
  .pcm-close-btn:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
  .pcm-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pcm-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .pcm-input {
    background: #0F0F11;
    border: 1px solid #2A2A2F;
    border-radius: 10px;
    padding: 12px 14px;
    color: var(--text-primary);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .pcm-input:focus {
    border-color: #7C3AED;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }
  .pcm-select {
    background: #0F0F11;
    border: 1px solid #2A2A2F;
    border-radius: 10px;
    padding: 12px 14px;
    color: var(--text-primary);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    appearance: none;
    transition: border-color 0.2s;
  }
  .pcm-select:focus { border-color: #7C3AED; }
  .pcm-select option { background: #1A1A1F; }
  .pcm-textarea {
    background: #0F0F11;
    border: 1px solid #2A2A2F;
    border-radius: 10px;
    padding: 12px 14px;
    color: var(--text-primary);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    resize: none;
    min-height: 110px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .pcm-textarea:focus {
    border-color: #7C3AED;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }
  .pcm-textarea::placeholder, .pcm-input::placeholder { color: #4A4A5A; }
  .pcm-char-counter {
    font-size: 11px;
    color: var(--text-secondary);
    text-align: right;
  }
  .pcm-char-counter.warn { color: #F59E0B; }
  .pcm-skills-input-row {
    display: flex;
    gap: 8px;
  }
  .pcm-add-skill-btn {
    background: rgba(124,58,237,0.15);
    color: #A855F7;
    border: 1px solid rgba(168,85,247,0.3);
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .pcm-add-skill-btn:hover { background: rgba(124,58,237,0.25); }
  .pcm-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .pcm-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(124,58,237,0.12);
    color: #A855F7;
    border: 1px solid rgba(168,85,247,0.2);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .pcm-tag-remove {
    background: none;
    border: none;
    color: #A855F7;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .pcm-tag-remove:hover { opacity: 1; }
  .pcm-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 4px;
  }
  .btn-pcm-cancel {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid #2A2A2F;
    padding: 11px 22px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.2s;
  }
  .btn-pcm-cancel:hover { background: rgba(255,255,255,0.05); }
  .btn-pcm-submit {
    background: #7C3AED;
    color: white;
    border: none;
    padding: 11px 26px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-pcm-submit:hover:not(:disabled) { opacity: 0.85; }
  .btn-pcm-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .pcm-error {
    font-size: 12px;
    color: #F87171;
    padding: 8px 12px;
    background: rgba(239,68,68,0.08);
    border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.18);
  }
  .pcm-select-wrapper {
    position: relative;
  }
  .pcm-select-wrapper::after {
    content: '▾';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    pointer-events: none;
    font-size: 12px;
  }
`;

const MAX_DESC = 500;
const MAX_SKILLS = 8;

export default function PostCollabModal({ currentUser, preselectedProjectId = null, onClose, onSuccess }) {
  const [role, setRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [commitment, setCommitment] = useState('Part-time');
  const [projectId, setProjectId] = useState(preselectedProjectId || '');
  const [description, setDescription] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyProjects = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('projects')
      .select('id, title')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    setMyProjects(data || []);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim().replace(/^#/, '');
    if (!trimmed || skills.includes(trimmed) || skills.length >= MAX_SKILLS) return;
    setSkills(prev => [...prev, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
    if (e.key === 'Backspace' && skillInput === '' && skills.length > 0) {
      setSkills(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (!role.trim()) { setError('Please specify the role you need.'); return; }
    if (!commitment) { setError('Please select a commitment level.'); return; }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('collab_requests')
      .insert({
        creator_id: currentUser.id,
        role: role.trim(),
        skills,
        commitment,
        project_id: projectId || null,
        description: description.trim() || null,
        status: 'open'
      });

    if (insertError) {
      setError('Failed to post collab request. Please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const descRemaining = MAX_DESC - description.length;

  return (
    <>
      <style>{modalStyles}</style>
      <div className="pcm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="pcm-card">
          {/* HEADER */}
          <div className="pcm-header">
            <h2 className="pcm-title">Post Collab Request</h2>
            <button className="pcm-close-btn" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* ROLE */}
          <div className="pcm-field">
            <label className="pcm-label">Role Needed *</label>
            <input
              className="pcm-input"
              placeholder="e.g. Frontend Developer, UI Designer..."
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>

          {/* SKILLS */}
          <div className="pcm-field">
            <label className="pcm-label">Skills Required ({skills.length}/{MAX_SKILLS})</label>
            <div className="pcm-skills-input-row">
              <input
                className="pcm-input"
                placeholder="Type a skill and press Enter (e.g. React)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
              <button className="pcm-add-skill-btn" onClick={addSkill} disabled={skills.length >= MAX_SKILLS}>
                + Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="pcm-tags">
                {skills.map(skill => (
                  <span key={skill} className="pcm-tag">
                    #{skill}
                    <button className="pcm-tag-remove" onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* COMMITMENT */}
          <div className="pcm-field">
            <label className="pcm-label">Commitment *</label>
            <div className="pcm-select-wrapper">
              <select
                className="pcm-select"
                value={commitment}
                onChange={e => setCommitment(e.target.value)}
              >
                <option value="Part-time">Part-time</option>
                <option value="Full-time">Full-time</option>
                <option value="Weekends">Weekends</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* LINK TO PROJECT */}
          <div className="pcm-field">
            <label className="pcm-label">Link to Project (optional)</label>
            <div className="pcm-select-wrapper">
              <select
                className="pcm-select"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
              >
                <option value="">— None —</option>
                {myProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="pcm-field">
            <label className="pcm-label">Description</label>
            <textarea
              className="pcm-textarea"
              placeholder="Describe what you're building, what the collaborator will do, and what makes a good fit..."
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, MAX_DESC))}
              maxLength={MAX_DESC}
            />
            <div className={`pcm-char-counter${descRemaining <= 50 ? ' warn' : ''}`}>
              {descRemaining} chars remaining
            </div>
          </div>

          {error && <div className="pcm-error">{error}</div>}

          {/* ACTIONS */}
          <div className="pcm-actions">
            <button className="btn-pcm-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-pcm-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  Posting...
                </>
              ) : '🚀 Post Request'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
