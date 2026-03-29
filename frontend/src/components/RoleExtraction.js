import React from 'react';

function RoleExtraction({ roles }) {
  return (
    <div className="role-ext">
      <h2>🎭 Extracted Roles</h2>
      <p className="subtitle">Minimal, optimized permission sets from clusters</p>

      <div className="roles-grid">
        {roles.map((role, idx) => (
          <div key={idx} className="role-card">
            <div className="role-header">
              <h3>{role.role_name}</h3>
              <span className="role-id">{role.role_id}</span>
            </div>

            <div className="role-meta">
              <span className="meta-item">
                <strong>Cluster:</strong> {role.source_cluster}
              </span>
              <span className="meta-item">
                <strong>Users:</strong> {role.user_count}
              </span>
              <span className="meta-item">
                <strong>Coverage:</strong> {role.coverage}
              </span>
            </div>

            <div className="permissions-section">
              <h4>Permissions</h4>
              <div className="permissions-list">
                {role.permissions.map((perm, i) => (
                  <div key={i} className="permission-item">
                    <div className="perm-name">
                      {perm.permission_id}
                      <span className={`sensitivity ${perm.sensitivity}`}>
                        {perm.sensitivity}
                      </span>
                    </div>
                    <div className="perm-justification">
                      {perm.justification}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="role-notes">{role.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
.role-ext {
  padding: 2rem;
}

.role-ext h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.role-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #764ba2;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.role-header h3 {
  color: #764ba2;
  font-size: 1.3rem;
  margin: 0;
}

.role-id {
  background: #f3e5f5;
  color: #764ba2;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.role-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  color: #666;
  font-size: 0.95rem;
}

.meta-item strong {
  color: #333;
  margin-right: 0.5rem;
}

.permissions-section h4 {
  color: #333;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.permission-item {
  background: #f5f5f5;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #764ba2;
}

.perm-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-family: monospace;
}

.sensitivity {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-weight: 500;
  font-family: sans-serif;
}

.sensitivity.low {
  background: #c8e6c9;
  color: #1b5e20;
}

.sensitivity.medium {
  background: #fff9c4;
  color: #f57f17;
}

.sensitivity.high {
  background: #ffccbc;
  color: #d84315;
}

.sensitivity.critical {
  background: #ffcdd2;
  color: #b71c1c;
}

.perm-justification {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.role-notes {
  color: #999;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}
`;

export default RoleExtraction;
