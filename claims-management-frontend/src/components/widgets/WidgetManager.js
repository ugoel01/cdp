import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

// Widget components
import StatisticsWidget from './StatisticsWidget';
import RecentClaimsWidget from './RecentClaimsWidget';
import PolicyListWidget from './PolicyListWidget';
import ChartWidget from './ChartWidget';
import TimelineWidget from './TimelineWidget';

// Draggable Widget Wrapper
const DraggableWidget = ({ id, index, widget, moveWidget, onRemoveWidget }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'WIDGET',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover(item, monitor) {
      if (!drag) {
        return;
      }
      if (item.index === index) {
        return;
      }
      moveWidget(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="mb-4"
    >
      {React.cloneElement(widget, { 
        id, 
        onRemove: onRemoveWidget,
      })}
    </div>
  );
};

// Widget options for adding
const WIDGET_TYPES = {
  STATISTICS: 'statistics',
  RECENT_CLAIMS: 'recentClaims',
  POLICY_LIST: 'policyList',
  CHART_PIE: 'chartPie',
  CHART_BAR: 'chartBar',
  CHART_LINE: 'chartLine',
  TIMELINE: 'timeline',
};

// Widget titles
const WIDGET_TITLES = {
  [WIDGET_TYPES.STATISTICS]: 'Statistics Overview',
  [WIDGET_TYPES.RECENT_CLAIMS]: 'Recent Claims',
  [WIDGET_TYPES.POLICY_LIST]: 'Policy List',
  [WIDGET_TYPES.CHART_PIE]: 'Distribution Chart',
  [WIDGET_TYPES.CHART_BAR]: 'Comparison Chart',
  [WIDGET_TYPES.CHART_LINE]: 'Trend Analysis',
  [WIDGET_TYPES.TIMELINE]: 'Recent Activity',
};

const WidgetManager = ({ 
  userRole = 'User', 
  userData = {}, 
  policyData = [], 
  claimData = [], 
  statisticsData = {},
  activityData = [],
  onViewDetails 
}) => {
  const [widgets, setWidgets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState('');
  const [layout, setLayout] = useState({});

  // Ensure data is always an array even if API returns null or undefined
  const safeArrayData = {
    policyData: Array.isArray(policyData) ? policyData : [],
    claimData: Array.isArray(claimData) ? claimData : [],
    activityData: Array.isArray(activityData) ? activityData : []
  };

  // Ensure statisticsData has default values if missing
  const safeStatisticsData = {
    stats: statisticsData?.stats || [],
    pieChartData: statisticsData?.pieChartData || {
      labels: ['No Data'],
      datasets: [{ data: [1], backgroundColor: ['#e0e0e0'] }]
    },
    barChartData: statisticsData?.barChartData || {
      labels: ['No Data'],
      datasets: [{ label: 'No Data', data: [0], backgroundColor: ['#e0e0e0'] }]
    },
    lineChartData: statisticsData?.lineChartData || {
      labels: ['No Data'],
      datasets: [{ label: 'No Data', data: [0], backgroundColor: '#e0e0e0', borderColor: '#e0e0e0' }]
    }
  };

  // Load saved widget layout from localStorage on component mount
  useEffect(() => {
    const savedLayout = localStorage.getItem(`dashboard-layout-${userRole}`);
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setWidgets(parsedLayout.widgets || []);
        setLayout(parsedLayout.layout || {});
      } catch (error) {
        console.error('Error loading saved dashboard layout:', error);
      }
    } else {
      // Set default widgets based on user role
      setDefaultWidgets();
    }
  }, [userRole]);

  // Save widget layout to localStorage when it changes
  useEffect(() => {
    if (widgets.length > 0) {
      const layoutToSave = {
        widgets,
        layout
      };
      localStorage.setItem(`dashboard-layout-${userRole}`, JSON.stringify(layoutToSave));
    }
  }, [widgets, layout, userRole]);

  // Set default widgets based on user role
  const setDefaultWidgets = () => {
    const defaultWidgets = [];
    
    // Add statistics widget for both roles
    defaultWidgets.push({
      id: uuidv4(),
      type: WIDGET_TYPES.STATISTICS,
      title: WIDGET_TITLES[WIDGET_TYPES.STATISTICS],
    });
    
    if (userRole === 'Admin') {
      // Admin default widgets
      defaultWidgets.push({
        id: uuidv4(),
        type: WIDGET_TYPES.RECENT_CLAIMS,
        title: WIDGET_TITLES[WIDGET_TYPES.RECENT_CLAIMS],
      });
      defaultWidgets.push({
        id: uuidv4(),
        type: WIDGET_TYPES.CHART_PIE,
        title: 'Policy Distribution',
      });
    } else {
      // User default widgets
      defaultWidgets.push({
        id: uuidv4(),
        type: WIDGET_TYPES.POLICY_LIST,
        title: 'My Policies',
      });
      defaultWidgets.push({
        id: uuidv4(),
        type: WIDGET_TYPES.TIMELINE,
        title: 'My Recent Activity',
      });
    }
    
    setWidgets(defaultWidgets);
  };

  // Handle adding a new widget
  const handleAddWidget = () => {
    if (!selectedWidgetType) return;
    
    const newWidget = {
      id: uuidv4(),
      type: selectedWidgetType,
      title: WIDGET_TITLES[selectedWidgetType] || 'New Widget',
    };
    
    setWidgets([...widgets, newWidget]);
    setShowAddModal(false);
    setSelectedWidgetType('');
  };

  // Handle removing a widget
  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };

  // Handle reordering widgets
  const moveWidget = (fromIndex, toIndex) => {
    const updatedWidgets = [...widgets];
    const [movedWidget] = updatedWidgets.splice(fromIndex, 1);
    updatedWidgets.splice(toIndex, 0, movedWidget);
    setWidgets(updatedWidgets);
  };

  // Render the appropriate widget based on type
  const renderWidget = (widget) => {
    const { type, id, title } = widget;
    
    switch (type) {
      case WIDGET_TYPES.STATISTICS:
        return (
          <StatisticsWidget 
            title={title} 
            stats={safeStatisticsData.stats} 
          />
        );
      case WIDGET_TYPES.RECENT_CLAIMS:
        return (
          <RecentClaimsWidget 
            title={title} 
            claims={safeArrayData.claimData} 
            onViewDetails={(claimId) => onViewDetails && onViewDetails('claim', claimId)}
          />
        );
      case WIDGET_TYPES.POLICY_LIST:
        return (
          <PolicyListWidget 
            title={title} 
            policies={safeArrayData.policyData} 
            onViewDetails={(policyId) => onViewDetails && onViewDetails('policy', policyId)}
          />
        );
      case WIDGET_TYPES.CHART_PIE:
        return (
          <ChartWidget 
            title={title} 
            chartType="pie" 
            data={safeStatisticsData.pieChartData}
          />
        );
      case WIDGET_TYPES.CHART_BAR:
        return (
          <ChartWidget 
            title={title} 
            chartType="bar" 
            data={safeStatisticsData.barChartData}
          />
        );
      case WIDGET_TYPES.CHART_LINE:
        return (
          <ChartWidget 
            title={title} 
            chartType="line" 
            data={safeStatisticsData.lineChartData}
          />
        );
      case WIDGET_TYPES.TIMELINE:
        return (
          <TimelineWidget 
            title={title} 
            events={safeArrayData.activityData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">{userRole === 'Admin' ? 'Admin Dashboard' : 'My Dashboard'}</h4>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add Widget
          </Button>
        </div>
        
        <Row>
          {widgets.map((widget, index) => (
            <Col key={widget.id} lg={6} className="mb-4">
              <DraggableWidget
                id={widget.id}
                index={index}
                widget={renderWidget(widget)}
                moveWidget={moveWidget}
                onRemoveWidget={handleRemoveWidget}
              />
            </Col>
          ))}
        </Row>
        
        {/* Add Widget Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Widget</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Widget Type</Form.Label>
                <Form.Select 
                  value={selectedWidgetType} 
                  onChange={(e) => setSelectedWidgetType(e.target.value)}
                >
                  <option value="">Select a widget type</option>
                  <option value={WIDGET_TYPES.STATISTICS}>Statistics Overview</option>
                  <option value={WIDGET_TYPES.RECENT_CLAIMS}>Recent Claims</option>
                  <option value={WIDGET_TYPES.POLICY_LIST}>Policy List</option>
                  <option value={WIDGET_TYPES.CHART_PIE}>Pie Chart</option>
                  <option value={WIDGET_TYPES.CHART_BAR}>Bar Chart</option>
                  <option value={WIDGET_TYPES.CHART_LINE}>Line Chart</option>
                  <option value={WIDGET_TYPES.TIMELINE}>Activity Timeline</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddWidget}
              disabled={!selectedWidgetType}
            >
              Add Widget
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </DndProvider>
  );
};

export default WidgetManager;
