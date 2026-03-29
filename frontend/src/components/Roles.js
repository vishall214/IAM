/**
 * Roles Visualization Component
 */

import React from 'react';

const Roles = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No role data</div>;
  }

  return (
    <div className="roles-section">
      <h2>Generated Optimal Roles</h2>
      <div className="roles-grid">
        {data.map((role) => (
          <div key={role.role_id} className="role-card">
            <div className="card-header">
              <h3>{role.role_name}</h3>
              <span className="badge coverage">Coverage: {role.coverage}</span>
            </div>
            <div className="card-body">
              <p><strong>Users:</strong> {role.user_count}</p>
              <p><strong>Permissions:</strong></p>
              <div className="permission-list">
                {role.permissions.map((perm) => (
                  <div key={perm} className="permission-item">
                    <span className="checkbox">✓</span>
                    {perm}
                  </div>
                ))}
              </div>
              <p className="notes">{role.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roles;
