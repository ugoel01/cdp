import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import WidgetBase from './WidgetBase';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Approved':
      return <Badge bg="success">Approved</Badge>;
    case 'Rejected':
      return <Badge bg="danger">Rejected</Badge>;
    case 'Pending':
    default:
      return <Badge bg="warning">Pending</Badge>;
  }
};

const RecentClaimsWidget = ({ id, title, claims = [], onRemove, onViewDetails }) => {
  return (
    <WidgetBase id={id} title={title || "Recent Claims"} onRemove={onRemove}>
      {claims.length === 0 ? (
        <div className="text-center text-muted py-3">No claims to display</div>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Policy Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Filed</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} onClick={() => onViewDetails && onViewDetails(claim._id)} style={{cursor: 'pointer'}}>
                  <td>{claim._id.slice(-8).toUpperCase()}</td>
                  <td>{claim.policyId?.type || 'N/A'}</td>
                  <td>${claim.amount.toLocaleString()}</td>
                  <td>{getStatusBadge(claim.status)}</td>
                  <td>{new Date(claim.dateFiled).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </WidgetBase>
  );
};

export default RecentClaimsWidget;
