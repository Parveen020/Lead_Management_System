import React, { useContext } from "react";
import "./Leads.css";
import { AdminContext } from "../../Context/AdminContext";

const Leads = () => {
  const {
    csvRecords,
    uploadedFile,
    isVerifying,
    progress,
    showConfirm,
    isModalOpen,
    getRootProps,
    getInputProps,
    setIsModalOpen,
    simulateVerification,
    handleUpload,
    resetModal,
    error,
    searchQuery,
  } = useContext(AdminContext);

  const filteredRecords = csvRecords.filter((record) => {
    const query = searchQuery.trim().toLowerCase();
    const formattedDate = new Date(record.uploadedAt)
      .toLocaleDateString()
      .toLowerCase();

    return (
      record.fileName.toLowerCase().includes(query) ||
      formattedDate.includes(query) ||
      record.totalLeads.toString().includes(query) ||
      record.assignedLeads.toString().includes(query) ||
      record.unassignedLeads.toString().includes(query) ||
      record.closedLeads.toString().includes(query)
    );
  });

  return (
    <div className="leads-container">
      <div className="leads-header">
        <div className="breadcrumb">Home &gt; Leads</div>
        <button
          className="add-leads-button"
          onClick={() => setIsModalOpen(true)}
        >
          Add Leads
        </button>
      </div>

      <div className="leads-table-wrapper">
        <div className="leads-table">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Date</th>
                <th>No. of Leads</th>
                <th>Assigned Leads</th>
                <th>Unassigned Leads</th>
                <th>Closed Leads</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length ? (
                filteredRecords.map((record, index) => (
                  <tr key={record._id}>
                    <td>{index + 1}</td>
                    <td>{record.fileName}</td>
                    <td>{new Date(record.uploadedAt).toLocaleDateString()}</td>
                    <td>{record.totalLeads}</td>
                    <td>{record.assignedLeads}</td>
                    <td>{record.unassignedLeads}</td>
                    <td>{record.closedLeads}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No CSV records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay")) {
              resetModal();
            }
          }}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={resetModal}>
              ✕
            </button>
            <h3 className="modal-title">CSV Upload</h3>
            <p className="modal-subtitle">Add your documents here</p>

            <div {...getRootProps()} className="upload-box">
              <input {...getInputProps()} />
              {!uploadedFile ? (
                <>
                  <div className="upload-icon">📄</div>
                  <p>Drag your file(s) to start uploading</p>
                  <p className="upload-or">OR</p>
                  <button className="button button-gray">Browse files</button>
                </>
              ) : (
                <p className="upload-file-name">{uploadedFile.name}</p>
              )}
            </div>

            {error && <p className="error-text">{error}</p>}

            {isVerifying && (
              <div className="verification-progress">
                <div className="verifying-text">Verifying...</div>
                <div className="verification-circle">
                  <svg>
                    <circle
                      className="verification-bg"
                      strokeWidth="5"
                      r="25"
                      cx="32"
                      cy="32"
                      fill="transparent"
                    />
                    <circle
                      className="verification-fg"
                      strokeWidth="5"
                      strokeDasharray="157"
                      strokeDashoffset={157 - (progress / 100) * 157}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="25"
                      cx="32"
                      cy="32"
                    />
                  </svg>
                  <div className="verification-percent">{progress}%</div>
                </div>
              </div>
            )}

            {showConfirm && (
              <div className="confirm-box">
                <p>
                  All the leads will be distributed among employees. Continue?
                </p>
                <div className="confirm-box-buttons">
                  <button className="button button-gray" onClick={resetModal}>
                    Cancel
                  </button>
                  <button className="button button-dark" onClick={handleUpload}>
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {!isVerifying && !showConfirm && (
              <div className="modal-actions">
                <button className="button button-gray" onClick={resetModal}>
                  Cancel
                </button>
                <button
                  className="button button-dark"
                  disabled={!uploadedFile}
                  onClick={simulateVerification}
                >
                  Next
                </button>
              </div>
            )}

            {isVerifying && (
              <div className="modal-cancel">
                <button className="modal-cancel-link" onClick={resetModal}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
