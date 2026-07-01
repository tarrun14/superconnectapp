import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';

let InterestModal = null;
let InterestedUsersModal = null;

const cardStyles = `
  .collab-card {
    background: #1A1A1F;
    border: 1px solid #2A2A2F;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .collab-card:hover {
    border-color: rgba(124, 58, 237, 0.4);
    box-shadow: 0 4px 24px rgba(124, 58, 237, 0.08);
  }
  .collab-card.compact {
    padding: 16px;
    gap: 10px;
  }
  .collab-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .collab-creator {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    text-decoration: none;
  }
  .collab-creator-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    overflow: hidden;
  }
  .collab-creator-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .collab-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .collab-status-open {
    background: rgba(34, 197, 94, 0.12);
    color: #4ADE80;
    border: 1px solid rgba(74, 222, 128, 0.25);
  }
  .collab-status-closed {
    background: rgba(100, 116, 139, 0.12);
    color: #94A3B8;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }
  .collab-role {
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.3;
  }
  .collab-card.compact .collab-role {
    font-size: 15px;
  }
  .collab-project-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }
  .collab-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .collab-skill-pill {
    background: rgba(124, 58, 237, 0.15);
    color: #A855F7;
    border: 1px solid rgba(168, 85, 247, 0.25);
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .collab-commitment-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    background: transparent;
  }
  .collab-description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .collab-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid #2A2A2F;
    padding-top: 14px;
    margin-top: 2px;
  }
  .collab-interest-count {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  .collab-actions {
    display: flex;
    gap: 8px;
  }
  .btn-interested {
    background: #7C3AED;
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, background 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .btn-interested:hover:not(:disabled) { opacity: 0.85; }
  .btn-interested:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-interest-sent {
    background: transparent;
    color: #94A3B8;
    border: 1px solid #3A3A4F;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: not-allowed;
    font-family: 'Inter', sans-serif;
  }
  .btn-collab-edit {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .btn-collab-edit:hover { background: var(--accent); color: white; }
  .btn-collab-close {
    background: transparent;
    color: #94A3B8;
    border: 1px solid #3A3A4F;
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .btn-collab-close:hover { background: rgba(100,116,139,0.15); }
  .btn-view-interested {
    background: rgba(124, 58, 237, 0.1);
    color: #A855F7;
    border: 1px solid rgba(168,85,247,0.25);
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .btn-view-interested:hover { background: rgba(124, 58, 237, 0.2); }
`;

export default function CollabCard({
  collab,
  currentUser,
  onInterestSent,
  onCloseRequest,
  onEditRequest,
  compact = false,
  refreshKey = 0
}) {
  const navigate = useNavigate();
  const [interestSent, setInterestSent] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showInterestedUsersModal, setShowInterestedUsersModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isCreator = currentUser && currentUser.id === collab.creator_id;
  const isOpen = collab.status === 'open';

  useEffect(() => {
    fetchInterestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collab.id, currentUser?.id, refreshKey]);

  const fetchInterestData = async () => {
    // Get interest count
    const { count } = await supabase
      .from('collab_interests')
      .select('*', { count: 'exact', head: true })
      .eq('collab_request_id', collab.id);
    setInterestCount(count || 0);

    // Check if current user already expressed interest
    if (currentUser && !isCreator) {
      const { data } = await supabase
        .from('collab_interests')
        .select('id')
        .eq('collab_request_id', collab.id)
        .eq('user_id', currentUser.id);
      setInterestSent(data?.length > 0);
    }
  };

  const handleCloseRequest = async () => {
    if (!isCreator) return;
    setIsClosing(true);
    await supabase
      .from('collab_requests')
      .update({ status: 'closed' })
      .eq('id', collab.id);
    setIsClosing(false);
    if (onCloseRequest) onCloseRequest(collab.id);
  };

  const handleInterestSent = () => {
    setInterestSent(true);
    setInterestCount(prev => prev + 1);
    setShowInterestModal(false);
    if (onInterestSent) onInterestSent(collab.id);
  };

  const creatorProfile = collab.creator || collab.profiles;
  const creatorName = creatorProfile?.name || 'User';
  const creatorAvatar = creatorProfile?.avatar_url;
  const creatorUsername = creatorProfile?.username;

  // Lazy load modals to avoid circular deps
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (showInterestModal && !InterestModal) {
      import('./InterestModal').then(m => {
        InterestModal = m.default;
        forceRender(prev => prev + 1);
      });
    }
  }, [showInterestModal]);

  useEffect(() => {
    if (showInterestedUsersModal && !InterestedUsersModal) {
      import('./InterestedUsersModal').then(m => {
        InterestedUsersModal = m.default;
        forceRender(prev => prev + 1);
      });
    }
  }, [showInterestedUsersModal]);

  return (
    <>
      <style>{cardStyles}</style>
      <div className={`collab-card${compact ? ' compact' : ''}`}>
        {/* TOP ROW */}
        <div className="collab-card-top">
          <div
            className="collab-creator"
            onClick={() => navigate(`/profile/${creatorUsername || collab.creator_id}`)}
          >
            <div className="collab-creator-avatar">
              {creatorAvatar ? (
                <img src={creatorAvatar} alt={creatorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                creatorName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="collab-creator-name">{creatorName}</span>
          </div>
          <span className={`collab-status-badge ${isOpen ? 'collab-status-open' : 'collab-status-closed'}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* ROLE */}
        <div>
          <div className="collab-role">Looking for {collab.role}</div>
          {collab.project_id && collab.project && (
            <div className="collab-project-link">
              🚀 {collab.project.title}
            </div>
          )}
        </div>

        {/* SKILLS */}
        {collab.skills && collab.skills.length > 0 && (
          <div className="collab-skills">
            {collab.skills.map(skill => (
              <span key={skill} className="collab-skill-pill">#{skill}</span>
            ))}
          </div>
        )}

        {/* COMMITMENT */}
        <div>
          <span className="collab-commitment-pill">⏱ {collab.commitment}</span>
        </div>

        {/* DESCRIPTION */}
        {collab.description && (
          <p className="collab-description">{collab.description}</p>
        )}

        {/* BOTTOM ROW */}
        <div className="collab-card-bottom">
          <span className="collab-interest-count">
            {interestCount} {interestCount === 1 ? 'interested' : 'interested'}
          </span>

          <div className="collab-actions">
            {isCreator ? (
              <>
                <button
                  className="btn-view-interested"
                  onClick={() => setShowInterestedUsersModal(true)}
                >
                  👥 View Interested
                </button>
                {isOpen && (
                  <>
                    <button
                      className="btn-collab-edit"
                      onClick={() => onEditRequest && onEditRequest(collab)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-collab-close"
                      onClick={handleCloseRequest}
                      disabled={isClosing}
                    >
                      {isClosing ? '...' : 'Close'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {interestSent ? (
                  <button className="btn-interest-sent" disabled>
                    ✓ Interest Sent
                  </button>
                ) : (
                  <button
                    className="btn-interested"
                    onClick={() => setShowInterestModal(true)}
                    disabled={!currentUser || !isOpen}
                  >
                    I'm Interested
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* INTEREST MODAL */}
      {showInterestModal && InterestModal && (
        <InterestModal
          collab={collab}
          currentUser={currentUser}
          onClose={() => setShowInterestModal(false)}
          onSuccess={handleInterestSent}
        />
      )}

      {/* INTERESTED USERS MODAL */}
      {showInterestedUsersModal && InterestedUsersModal && (
        <InterestedUsersModal
          collab={collab}
          onClose={() => setShowInterestedUsersModal(false)}
          onCloseRequest={() => {
            setShowInterestedUsersModal(false);
            handleCloseRequest();
          }}
        />
      )}
    </>
  );
}
