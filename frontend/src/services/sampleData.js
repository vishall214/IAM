/**
 * Sample Data Service
 */

export const getSampleData = () => {
  return {
    users: [
      { user_id: "U1", department: "Engineering" },
      { user_id: "U2", department: "Engineering" },
      { user_id: "U3", department: "Finance" },
      { user_id: "U4", department: "HR" }
    ],
    permissions: [
      { permission_id: "read_code", sensitivity_level: "low" },
      { permission_id: "write_code", sensitivity_level: "medium" },
      { permission_id: "deploy_service", sensitivity_level: "high" },
      { permission_id: "view_salary", sensitivity_level: "high" },
      { permission_id: "edit_employee", sensitivity_level: "medium" },
      { permission_id: "admin_access", sensitivity_level: "critical" }
    ],
    access_logs: [
      { user_id: "U1", permission_id: "read_code", timestamp: "2026-03-01", frequency: 50 },
      { user_id: "U1", permission_id: "write_code", timestamp: "2026-03-01", frequency: 30 },
      { user_id: "U1", permission_id: "deploy_service", timestamp: "2026-02-20", frequency: 5 },
      { user_id: "U2", permission_id: "read_code", timestamp: "2026-03-01", frequency: 45 },
      { user_id: "U2", permission_id: "write_code", timestamp: "2026-03-01", frequency: 25 },
      { user_id: "U3", permission_id: "view_salary", timestamp: "2026-03-01", frequency: 40 },
      { user_id: "U3", permission_id: "admin_access", timestamp: "2025-12-01", frequency: 1 },
      { user_id: "U4", permission_id: "edit_employee", timestamp: "2026-03-01", frequency: 35 },
      { user_id: "U4", permission_id: "view_salary", timestamp: "2026-02-28", frequency: 20 }
    ]
  };
};
