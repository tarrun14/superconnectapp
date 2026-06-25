import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import SkeletonLoader from "../components/SkeletonLoader";
import BackgroundParticles from "../components/BackgroundParticles";

const styles = `
  :root {
    --bg: #0F0F11;
    --surface: #1A1A1F;
    --border: #2A2A2F;
    --ink: #F4F4F5;
    --ink-muted: #A1A1AA;
    --accent: #7C3AED;
    --accent-hover: #6D28D9;
    --shadow: 0 4px 12px rgba(0,0,0,0.2);
    --radius: 12px;
    --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pp-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    padding-bottom: 80px;
    position: relative;
    z-index: 1;
  }

  /* ── Banner ── */
  .project-banner {
    position: relative;
    width: 100%;
    background: #1A1A1F;
  }
  
  .project-banner img, .project-banner .placeholder-banner {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    display: block;
  }
  
  .banner-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(to bottom, transparent, #0F0F11);
  }

  .pp-inner {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 2;
    background: #0F0F1180;
  }
  
  .pp-inner::before, .pp-inner::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 80px;
    pointer-events: none;
    z-index: -1;
  }
  
  .pp-inner::before {
    left: 0;
    background: linear-gradient(to right, #0F0F11, transparent);
  }
  
  .pp-inner::after {
    right: 0;
    background: linear-gradient(to left, #0F0F11, transparent);
  }

  /* ── Project header ── */
  .pp-header {
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 36px;
    position: relative;
  }

  .project-title {
    font-family: 'Inter', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin-top: -60px;
    position: relative;
    z-index: 10;
    margin-bottom: 16px;
  }

  .project-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .status-badge {
    background: rgba(124, 58, 237, 0.15);
    color: var(--accent);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .creator-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--ink-muted);
  }

  .creator-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  .pp-header p {
    font-size: 1rem;
    color: var(--ink-muted);
    font-weight: 400;
    line-height: 1.6;
  }

  .btn-follow {
    background: var(--surface);
    color: var(--ink);
    border: 1px solid var(--border);
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }

  .btn-follow:hover {
    background: rgba(124, 58, 237, 0.1);
    border-color: var(--accent);
    color: var(--accent);
  }
  
  .btn-follow.following {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  /* ── Section label ── */
  .section-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 16px;
  }

  /* ── Community card ── */
  .community-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  /* ── Messages feed ── */
  .messages-feed {
    height: 400px;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    scroll-behavior: smooth;
  }

  .messages-feed::-webkit-scrollbar { width: 6px; }
  .messages-feed::-webkit-scrollbar-track { background: transparent; }
  .messages-feed::-webkit-scrollbar-thumb { background: #3A3A3F; border-radius: 4px; }

  /* ── Message item ── */
  .message-item {
    display: flex;
    gap: 16px;
    background: #151518;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
  }

  .message-author-col {
    flex-shrink: 0;
  }
  
  .message-content-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message-author {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--ink);
  }

  .message-timestamp {
    font-size: 0.75rem;
    color: var(--ink-muted);
  }

  .message-text {
    font-size: 0.95rem;
    color: var(--ink);
    font-weight: 400;
    line-height: 1.5;
  }

  .message-img {
    width: 100%;
    max-width: 320px;
    border-radius: 8px;
    border: 1px solid var(--border);
    display: block;
    object-fit: cover;
  }

  /* ── Empty feed ── */
  .feed-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: var(--ink-muted);
  }

  .feed-empty .empty-icon { font-size: 2rem; opacity: 0.3; margin-bottom: 8px; }
  .feed-empty p { font-size: 0.95rem; font-weight: 400; }

  /* ── Composer ── */
  .composer {
    border-top: 1px solid #2A2A2F;
    background: #111114;
  }

  .composer-text-row {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 16px;
  }

  .composer-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    color: var(--ink);
    font-weight: 400;
  }

  .composer-input::placeholder {
    color: var(--ink-muted);
    opacity: 0.7;
  }

  .btn-post {
    flex-shrink: 0;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0 28px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background var(--transition);
    display: flex;
    align-items: center;
    gap: 8px;
    align-self: stretch;
  }

  .btn-post:hover { background: var(--accent-hover); }
  .btn-post:active { background: #5B21B6; }

  .btn-post svg {
    width: 16px;
    height: 16px;
    transform: rotate(-35deg);
    margin-bottom: 1px;
  }

  /* ── Attach row ── */
  .composer-attach-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px 16px;
  }

  .file-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    transition: all var(--transition);
    user-select: none;
  }

  .file-label:hover {
    color: #fff;
    border-color: var(--accent);
    background: rgba(124, 58, 237, 0.1);
  }

  .file-label svg { width: 14px; height: 14px; flex-shrink: 0; }

  .file-input-hidden { display: none; }

  /* ── Image preview ── */
  .image-preview-wrap {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
  }

  .image-preview {
    height: 48px;
    width: 48px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid var(--border);
    display: block;
  }

  .preview-remove {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #EF4444;
    color: #fff;
    border: none;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: background var(--transition);
  }

  .preview-remove:hover {
    background: #DC2626;
  }

  /* ── Loading ── */
  .pp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-family: 'Inter', sans-serif;
    font-size: 1.1rem;
    color: var(--ink-muted);
    letter-spacing: 0.04em;
  }
`;

export default function ProjectPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const feedRef = useRef(null);
  const fileInputRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init(); }, [id]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      fetchProject();
      fetchMessages();
    } catch(err) {
      console.error(err);
    }
  };

  const fetchProject = async () => {
    const { data } = await supabase
      .from("projects").select("*, profiles(name, avatar_url)").eq("id", id).single();
    setProject(data);
    
    // Check follow status (optional, fails gracefully)
    if (user) {
      const { data: followData } = await supabase
        .from("project_followers")
        .select("*")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .single();
      if (followData) setIsFollowing(true);
    }
  };

  const toggleFollow = async () => {
    if (!user) return;
    try {
      if (isFollowing) {
        await supabase.from("project_followers").delete().eq("project_id", id).eq("user_id", user.id);
        setIsFollowing(false);
      } else {
        await supabase.from("project_followers").insert([{ project_id: id, user_id: user.id }]);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("project_messages")
      .select("*, profiles(name, avatar_url)")
      .eq("project_id", id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    if (!msgText.trim() && !image) return;
    if (!user) return;

    let imageUrl = null;

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, image);

      if (uploadError) { console.log(uploadError); return; }

      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    await supabase.from("project_messages").insert([{
      project_id: id,
      user_id: user.id,
      message: msgText,
      image_url: imageUrl,
    }]);

    setMsgText("");
    clearImage();
    fetchMessages();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pp-root">
        <BackgroundParticles variant="split" />
        
        {project ? (
          <>
            <div className="project-banner">
              {project.image_url ? (
                <img src={project.image_url} alt="cover" />
              ) : (
                <div className="placeholder-banner"></div>
              )}
              <div className="banner-overlay"></div>
            </div>

            <div className="pp-inner">
              <div className="pp-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 className="project-title">{project.title}</h2>
                  {project.user_id !== user?.id && (
                    <button className={`btn-follow ${isFollowing ? 'following' : ''}`} onClick={toggleFollow}>
                      {isFollowing ? 'Following' : 'Follow Project'}
                    </button>
                  )}
                </div>
                
                <div className="project-meta">
                  {project.status && <span className="status-badge">{project.status}</span>}
                  <div className="creator-info">
                    {project.profiles?.avatar_url ? (
                      <img src={project.profiles.avatar_url} alt="creator" className="creator-avatar" />
                    ) : (
                      <div className="creator-avatar" style={{ background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {project.profiles?.name ? project.profiles.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <span>{project.profiles?.name || 'Unknown User'}</span>
                  </div>
                </div>

                {project.description && <p>{project.description}</p>}
              </div>

              <p className="section-label">Community</p>

              <div className="community-section">
                {/* Feed */}
                <div className="messages-feed" ref={feedRef}>
                  {messages.length === 0 ? (
                    <div className="feed-empty">
                      <div className="empty-icon">◻</div>
                      <p>No activity yet — be the first to post.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="message-item">
                        <div className="message-author-col">
                          {m.profiles?.avatar_url ? (
                            <img src={m.profiles.avatar_url} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                              {m.profiles?.name ? m.profiles.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                        </div>
                        <div className="message-content-col">
                          <div className="message-header">
                            <span className="message-author">{m.profiles?.name || "User"}</span>
                            <span className="message-timestamp">
                              {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {m.message && (
                            <span className="message-text">{m.message}</span>
                          )}
                          {m.image_url && (
                            <img src={m.image_url} alt="post" className="message-img" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Composer */}
                <div className="composer">
                  <div className="composer-text-row">
                    <input
                      className="composer-input"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Share an update or message…"
                    />
                    <button className="btn-post" onClick={sendMessage}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Post
                    </button>
                  </div>

                  <div className="composer-attach-row">
                    <label className="file-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Attach image
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="file-input-hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {imagePreview && (
                      <div className="image-preview-wrap">
                        <img src={imagePreview} alt="preview" className="image-preview" />
                        <button className="preview-remove" onClick={clearImage}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="pp-inner">
            <SkeletonLoader type="page" />
          </div>
        )}
      </div>
    </>
  );
}