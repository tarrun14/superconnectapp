import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SkeletonLoader from "../components/SkeletonLoader";

const styles = `
  :root {
    --bg: #0F0F11;
    --surface: #1A1A1F;
    --border: #2A2A2F;
    --ink: #F4F4F5;
    --ink-muted: #A1A1AA;
    --accent: #7C3AED;
  }

  .page-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    padding: 80px 24px 80px;
  }

  .page-inner {
    max-width: 1200px; /* Wider for 3 column grid */
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .page-header h2 {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
  }

  .page-header .dot {
    display: none; /* Removed the dot */
  }

  /* 🔥 3 Column Grid for Project Cards */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  @media (max-width: 900px) {
    .projects-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }

  .project-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 0; /* Removing bottom margin as grid handles gap */
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .project-card.clickable {
    cursor: pointer;
  }

  .project-card:hover {
    border-color: #7C3AED;
    transform: scale(1.02);
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }

  .project-cover {
    width: 100%;
    height: 180px;
    object-fit: cover;
    background: var(--bg);
  }
  
  .project-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .project-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
  }
  .tag-idea { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
  .tag-in-progress { background: rgba(16, 185, 129, 0.15); color: #10B981; }
  .tag-live { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }

  .project-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .project-desc {
    font-size: 0.9rem;
    color: var(--ink-muted);
    margin-bottom: 16px;
    line-height: 1.5;
    flex: 1;
  }

  .project-owner {
    font-size: 13px; /* As requested */
    color: var(--ink-muted);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-follow {
    background: transparent;
    border: 1.5px solid var(--accent);
    color: var(--accent);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: auto;
  }

  .btn-follow:hover {
    background: var(--accent);
    color: #fff;
  }

  .btn-follow.active {
    background: var(--accent);
    color: #fff;
  }

  .empty-msg {
    color: var(--ink-muted);
    font-size: 0.9rem;
    font-style: italic;
  }
`;

export default function ProjectHub() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUser(user);
      if (user) {
        fetchProjects(user);
      } else {
        setLoading(false);
      }
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ✅ SINGLE fetchProjects (removed duplicate)
  const fetchProjects = async (currentUser) => {
    const { data: projectsData } = await supabase
      .from("projects")
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    const { data: follows } = await supabase
      .from("project_followers")
      .select("project_id")
      .eq("user_id", currentUser.id);

    const followedIds = follows?.map((f) => f.project_id) || [];

    const merged = (projectsData || []).map((proj) => ({
      ...proj,
      isFollowing: followedIds.includes(proj.id),
    }));

    setProjects(merged);
    setLoading(false);
  };

  const followProject = async (e, projectId) => {
    if (e) e.stopPropagation();
    if (!user) return;

    const proj = projects.find((p) => p.id === projectId);
    if (!proj || proj.user_id === user.id) return;

    if (proj.isFollowing) return;

    const { error } = await supabase.from("project_followers").insert([
      {
        user_id: user.id,
        project_id: projectId,
      },
    ]);

    if (!error) {
      fetchProjects(user);
    }
  };

  const handleProjectClick = (proj) => {
    if (proj.isFollowing || proj.user_id === user?.id) {
      navigate(`/project/${proj.id}`);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <div className="page-inner">
          <div className="page-header">
            <h2>Project Hub</h2>
            <div className="dot" />
          </div>

          {loading ? (
             <SkeletonLoader type="page" />
          ) : projects.length === 0 ? (
            <p className="empty-msg">No projects yet</p>
          ) : (
            <div className="projects-grid">
            {projects.map((proj) => {
              const canEnter = proj.isFollowing || proj.user_id === user?.id;
              return (
              <div 
                key={proj.id} 
                className={`project-card ${canEnter ? "clickable" : ""}`}
                onClick={() => handleProjectClick(proj)}
              >
                {proj.image_url && (
                  <img src={proj.image_url} alt="Cover" className="project-cover" />
                )}
                <div className="project-content">
                  <div>
                    <span className={`project-tag tag-${(proj.status || 'idea').replace(' ', '-')}`}>
                      {proj.status || 'idea'}
                    </span>
                  </div>
                <div className="project-title">
                  🚀 {proj.title}
                </div>
                
                <p className="project-desc">{proj.description}</p>

                <div className="project-owner" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '16px' }} onClick={(e) => { e.stopPropagation(); navigate(`/user/${proj.user_id}`); }}>
                  {proj.profiles?.avatar_url ? (
                    <img src={proj.profiles.avatar_url} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {proj.profiles?.name ? proj.profiles.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  {proj.profiles?.name || "User"}
                </div>

                {proj.user_id !== user?.id && (
                  <button
                    className={`btn-follow ${proj.isFollowing ? "active" : ""}`}
                    onClick={(e) => followProject(e, proj.id)}
                  >
                    {proj.isFollowing ? "Following" : "Follow Project"}
                  </button>
                )}
                </div>
              </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}