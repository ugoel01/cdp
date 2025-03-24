import React from 'react';
import WidgetBase from './WidgetBase';
import { ListGroup } from 'react-bootstrap';
import { FaCircle, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const TimelineItem = ({ date, title, description, status }) => {
  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <FaCheckCircle className="text-success" />;
      case 'rejected':
      case 'failed':
        return <FaTimesCircle className="text-danger" />;
      case 'pending':
      case 'in progress':
        return <FaSpinner className="text-warning" />;
      default:
        return <FaCircle className="text-primary" />;
    }
  };

  return (
    <ListGroup.Item className="border-0 ps-0">
      <div className="d-flex">
        <div className="timeline-icon me-3 mt-1">
          {getStatusIcon()}
        </div>
        <div className="timeline-content w-100">
          <div className="d-flex justify-content-between">
            <h6 className="fw-bold mb-0">{title}</h6>
            <small className="text-muted">{new Date(date).toLocaleDateString()}</small>
          </div>
          <p className="mb-0 text-secondary">{description}</p>
        </div>
      </div>
    </ListGroup.Item>
  );
};

const TimelineWidget = ({ id, title, events = [], onRemove }) => {
  return (
    <WidgetBase id={id} title={title || "Recent Activity"} onRemove={onRemove}>
      {events.length === 0 ? (
        <div className="text-center text-muted py-3">No recent activity</div>
      ) : (
        <ListGroup variant="flush" className="timeline-list">
          {events.map((event, index) => (
            <TimelineItem 
              key={index}
              date={event.date}
              title={event.title}
              description={event.description}
              status={event.status}
            />
          ))}
        </ListGroup>
      )}
    </WidgetBase>
  );
};

export default TimelineWidget;
