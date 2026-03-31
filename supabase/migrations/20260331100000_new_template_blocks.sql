-- Insert template_blocks for the 30 new templates
-- Run this AFTER the templates have been seeded into the templates table

-- crisis-communication-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Crisis Communication Deck"}'::jsonb, '{"level": 1, "text": "Crisis Communication Deck"}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Empathy-first structure for layoffs, incidents, outages, and regulatory announcements. Lead with empathy, state facts, explain actions, give next update."}'::jsonb, '{"text": "Purpose: Empathy-first structure for layoffs, incidents, outages, and regulatory announcements. Lead with empathy, state facts, explain actions, give next update."}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Phase", "Action", "Owner", "Timeline"], "rows": [["Immediate", "Acknowledge the situation", "CEO / Comms Lead", "Within 2 hours"], ["24 hours", "Publish detailed statement with facts", "PR Team", "Day 1"], ["Week 1", "Employee town hall Q&A", "Leadership", "Within 5 days"], ["Ongoing", "Weekly status updates until resolved", "Ops Lead", "Weekly"]]}'::jsonb, '{"headers": ["Phase", "Action", "Owner", "Timeline"], "rows": [["Immediate", "Acknowledge the situation", "CEO / Comms Lead", "Within 2 hours"], ["24 hours", "Publish detailed statement with facts", "PR Team", "Day 1"], ["Week 1", "Employee town hall Q&A", "Leadership", "Within 5 days"], ["Ongoing", "Weekly status updates until resolved", "Ops Lead", "Weekly"]]}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Lead with empathy before facts. State what you know, what you don''t, and when the next update will come. Never speculate."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Lead with empathy before facts. State what you know, what you don''t, and when the next update will come. Never speculate."}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'crisis-communication-deck'
ON CONFLICT DO NOTHING;

-- succession-planning
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Succession Planning Brief"}'::jsonb, '{"level": 1, "text": "Succession Planning Brief"}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Leadership pipeline review with readiness assessments, development plans, and timeline for key role transitions."}'::jsonb, '{"text": "Purpose: Leadership pipeline review with readiness assessments, development plans, and timeline for key role transitions."}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Role", "Current Holder", "Readiness", "Successor"], "rows": [["CEO", "[Name]", "Planned retirement 2027", "[Candidate A, B]"], ["CTO", "[Name]", "High risk (single point)", "[Candidate]"], ["VP Sales", "[Name]", "Stable", "[Internal + External search]"]]}'::jsonb, '{"headers": ["Role", "Current Holder", "Readiness", "Successor"], "rows": [["CEO", "[Name]", "Planned retirement 2027", "[Candidate A, B]"], ["CTO", "[Name]", "High risk (single point)", "[Candidate]"], ["VP Sales", "[Name]", "Stable", "[Internal + External search]"]]}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Identify single points of failure now. Every critical role should have at least one ready-now candidate and one developing candidate."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Identify single points of failure now. Every critical role should have at least one ready-now candidate and one developing candidate."}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'succession-planning'
ON CONFLICT DO NOTHING;

-- company-vision-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Company Vision and Mission"}'::jsonb, '{"level": 1, "text": "Company Vision and Mission"}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Articulate where the company is going. Vision, mission, values, strategic pillars, and 3-year horizon. For all-hands and town halls."}'::jsonb, '{"text": "Purpose: Articulate where the company is going. Vision, mission, values, strategic pillars, and 3-year horizon. For all-hands and town halls."}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Pillar", "2024 Status", "2027 Target", "Key Initiative"], "rows": [["Revenue", "$X M ARR", "$Y M ARR", "Enterprise expansion"], ["Product", "V2 launched", "Platform play", "API + marketplace"], ["Team", "X employees", "Y employees", "Engineering + Sales hires"]]}'::jsonb, '{"headers": ["Pillar", "2024 Status", "2027 Target", "Key Initiative"], "rows": [["Revenue", "$X M ARR", "$Y M ARR", "Enterprise expansion"], ["Product", "V2 launched", "Platform play", "API + marketplace"], ["Team", "X employees", "Y employees", "Engineering + Sales hires"]]}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "A vision without a timeline is a wish. Tie every pillar to a measurable 3-year target and review quarterly."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "A vision without a timeline is a wish. Tie every pillar to a measurable 3-year target and review quarterly."}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'company-vision-deck'
ON CONFLICT DO NOTHING;

-- budget-approval-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Budget Approval Deck"}'::jsonb, '{"level": 1, "text": "Budget Approval Deck"}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Present your budget request with ROI projections, resource allocation, risk analysis, and phased spending plan."}'::jsonb, '{"text": "Purpose: Present your budget request with ROI projections, resource allocation, risk analysis, and phased spending plan."}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Category", "Requested", "Last Year", "ROI Estimate"], "rows": [["Engineering", "$X", "$Y", "3.2x"], ["Marketing", "$X", "$Y", "2.8x"], ["Operations", "$X", "$Y", "1.5x"], ["Total", "$X", "$Y", "2.5x blended"]]}'::jsonb, '{"headers": ["Category", "Requested", "Last Year", "ROI Estimate"], "rows": [["Engineering", "$X", "$Y", "3.2x"], ["Marketing", "$X", "$Y", "2.8x"], ["Operations", "$X", "$Y", "1.5x"], ["Total", "$X", "$Y", "2.5x blended"]]}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Lead with ROI, not cost. Show what the investment returns before showing what it costs."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Lead with ROI, not cost. Show what the investment returns before showing what it costs."}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'budget-approval-deck'
ON CONFLICT DO NOTHING;

-- diversity-inclusion-report
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "DEI Progress Report"}'::jsonb, '{"level": 1, "text": "DEI Progress Report"}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Diversity, equity, and inclusion metrics with year-over-year trends, initiatives, and action items."}'::jsonb, '{"text": "Purpose: Diversity, equity, and inclusion metrics with year-over-year trends, initiatives, and action items."}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Metric", "Last Year", "This Year", "Target"], "rows": [["Women in leadership", "28%", "33%", "40%"], ["Underrepresented minorities", "18%", "22%", "30%"], ["Pay equity gap", "4.2%", "2.1%", "<1%"], ["Inclusion score (survey)", "72", "78", "85"]]}'::jsonb, '{"headers": ["Metric", "Last Year", "This Year", "Target"], "rows": [["Women in leadership", "28%", "33%", "40%"], ["Underrepresented minorities", "18%", "22%", "30%"], ["Pay equity gap", "4.2%", "2.1%", "<1%"], ["Inclusion score (survey)", "72", "78", "85"]]}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Progress requires accountability. Tie DEI metrics to leadership performance reviews and publish results transparently."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Progress requires accountability. Tie DEI metrics to leadership performance reviews and publish results transparently."}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'diversity-inclusion-report'
ON CONFLICT DO NOTHING;

-- series-a-pitch-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Series A Pitch Deck"}'::jsonb, '{"level": 1, "text": "Series A Pitch Deck"}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Post-seed pitch deck with product-market fit evidence, unit economics, growth metrics, and use of funds. 12-slide Sequoia format."}'::jsonb, '{"text": "Purpose: Post-seed pitch deck with product-market fit evidence, unit economics, growth metrics, and use of funds. 12-slide Sequoia format."}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Metric", "Current", "12-Mo Target", "Benchmark"], "rows": [["ARR", "$1.2M", "$5M", ">$3M for Series A"], ["MoM Growth", "18%", "15%+", ">10%"], ["Net Revenue Retention", "125%", "130%", ">120%"], ["CAC Payback", "8 months", "6 months", "<12 months"]]}'::jsonb, '{"headers": ["Metric", "Current", "12-Mo Target", "Benchmark"], "rows": [["ARR", "$1.2M", "$5M", ">$3M for Series A"], ["MoM Growth", "18%", "15%+", ">10%"], ["Net Revenue Retention", "125%", "130%", ">120%"], ["CAC Payback", "8 months", "6 months", "<12 months"]]}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Series A investors buy the growth story. Lead with traction, then explain what more capital unlocks."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Series A investors buy the growth story. Lead with traction, then explain what more capital unlocks."}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'series-a-pitch-deck'
ON CONFLICT DO NOTHING;

-- series-b-growth-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Series B Growth Deck"}'::jsonb, '{"level": 1, "text": "Series B Growth Deck"}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Growth-stage pitch with scaled metrics, expansion strategy, competitive moat, and path to profitability."}'::jsonb, '{"text": "Purpose: Growth-stage pitch with scaled metrics, expansion strategy, competitive moat, and path to profitability."}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Metric", "Series A", "Current", "Series B Target"], "rows": [["ARR", "$3M", "$12M", "$30M"], ["Headcount", "25", "80", "150"], ["Markets", "1", "3", "5+"], ["Gross Margin", "65%", "72%", "75%+"]]}'::jsonb, '{"headers": ["Metric", "Series A", "Current", "Series B Target"], "rows": [["ARR", "$3M", "$12M", "$30M"], ["Headcount", "25", "80", "150"], ["Markets", "1", "3", "5+"], ["Gross Margin", "65%", "72%", "75%+"]]}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "At Series B, prove you can scale what works. Show unit economics improving with volume, not just revenue growing."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "At Series B, prove you can scale what works. Show unit economics improving with volume, not just revenue growing."}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'series-b-growth-deck'
ON CONFLICT DO NOTHING;

-- angel-investor-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Angel Investor Deck"}'::jsonb, '{"level": 1, "text": "Angel Investor Deck"}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Early-stage pitch for angel investors. Problem, solution, team, early traction, and ask. Concise 10-slide format."}'::jsonb, '{"text": "Purpose: Early-stage pitch for angel investors. Problem, solution, team, early traction, and ask. Concise 10-slide format."}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Milestone", "Status", "Timeline", "Funding Need"], "rows": [["MVP", "Complete", "Done", "$0"], ["First 10 customers", "In progress", "3 months", "$200K"], ["Product-market fit", "Planned", "6 months", "$500K"]]}'::jsonb, '{"headers": ["Milestone", "Status", "Timeline", "Funding Need"], "rows": [["MVP", "Complete", "Done", "$0"], ["First 10 customers", "In progress", "3 months", "$200K"], ["Product-market fit", "Planned", "6 months", "$500K"]]}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Angels invest in founders first. Lead with your unfair advantage and why you are the team to solve this problem."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Angels invest in founders first. Lead with your unfair advantage and why you are the team to solve this problem."}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'angel-investor-deck'
ON CONFLICT DO NOTHING;

-- ycombinator-application-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "YC Application Deck"}'::jsonb, '{"level": 1, "text": "YC Application Deck"}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Y Combinator style application deck. What you do, why now, team, traction, and what you need."}'::jsonb, '{"text": "Purpose: Y Combinator style application deck. What you do, why now, team, traction, and what you need."}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Question", "Answer"], "rows": [["What do you make?", "[One sentence]"], ["Why now?", "[Market timing]"], ["How do you make money?", "[Revenue model]"], ["What''s your unfair advantage?", "[Moat]"]]}'::jsonb, '{"headers": ["Question", "Answer"], "rows": [["What do you make?", "[One sentence]"], ["Why now?", "[Market timing]"], ["How do you make money?", "[Revenue model]"], ["What''s your unfair advantage?", "[Moat]"]]}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "YC values speed and clarity. Answer every question in one sentence. If you need two sentences, the first one is wrong."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "YC values speed and clarity. Answer every question in one sentence. If you need two sentences, the first one is wrong."}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'ycombinator-application-deck'
ON CONFLICT DO NOTHING;

-- exit-strategy-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Exit Strategy Deck"}'::jsonb, '{"level": 1, "text": "Exit Strategy Deck"}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: M&A or IPO readiness deck with valuation, comparable analysis, strategic fit, and transaction timeline."}'::jsonb, '{"text": "Purpose: M&A or IPO readiness deck with valuation, comparable analysis, strategic fit, and transaction timeline."}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Scenario", "Valuation Range", "Timeline", "Probability"], "rows": [["Strategic Acquisition", "$X-Y M", "12-18 months", "High"], ["IPO", "$X-Y M", "24-36 months", "Medium"], ["Secondary Sale", "$X-Y M", "6-12 months", "Low"]]}'::jsonb, '{"headers": ["Scenario", "Valuation Range", "Timeline", "Probability"], "rows": [["Strategic Acquisition", "$X-Y M", "12-18 months", "High"], ["IPO", "$X-Y M", "24-36 months", "Medium"], ["Secondary Sale", "$X-Y M", "6-12 months", "Low"]]}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Model multiple exit scenarios with realistic timelines. Investors want to see you have thought about their return path."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Model multiple exit scenarios with realistic timelines. Investors want to see you have thought about their return path."}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'exit-strategy-deck'
ON CONFLICT DO NOTHING;

-- product-launch-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Product Launch Deck"}'::jsonb, '{"level": 1, "text": "Product Launch Deck"}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Launch plan with positioning, messaging, channel strategy, timeline, and success metrics."}'::jsonb, '{"text": "Purpose: Launch plan with positioning, messaging, channel strategy, timeline, and success metrics."}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Channel", "Audience", "Budget", "Expected Reach"], "rows": [["Email", "Existing customers", "$X", "Y,000"], ["Social", "Target personas", "$X", "Y,000"], ["PR", "Industry press", "$X", "Y,000"], ["Events", "Key accounts", "$X", "Y00"]]}'::jsonb, '{"headers": ["Channel", "Audience", "Budget", "Expected Reach"], "rows": [["Email", "Existing customers", "$X", "Y,000"], ["Social", "Target personas", "$X", "Y,000"], ["PR", "Industry press", "$X", "Y,000"], ["Events", "Key accounts", "$X", "Y00"]]}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "A launch is not a single event. Plan pre-launch (build anticipation), launch day (maximize reach), and post-launch (capture feedback)."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "A launch is not a single event. Plan pre-launch (build anticipation), launch day (maximize reach), and post-launch (capture feedback)."}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'product-launch-deck'
ON CONFLICT DO NOTHING;

-- brand-strategy-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Brand Strategy Deck"}'::jsonb, '{"level": 1, "text": "Brand Strategy Deck"}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Brand positioning, visual identity guidelines, tone of voice, audience segmentation, and competitive differentiation."}'::jsonb, '{"text": "Purpose: Brand positioning, visual identity guidelines, tone of voice, audience segmentation, and competitive differentiation."}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Element", "Current", "Target", "Action"], "rows": [["Brand voice", "Technical", "Confident + approachable", "Messaging guide"], ["Visual identity", "Dated", "Modern, clean", "Rebrand Q2"], ["Market position", "Feature-led", "Outcome-led", "Website rewrite"]]}'::jsonb, '{"headers": ["Element", "Current", "Target", "Action"], "rows": [["Brand voice", "Technical", "Confident + approachable", "Messaging guide"], ["Visual identity", "Dated", "Modern, clean", "Rebrand Q2"], ["Market position", "Feature-led", "Outcome-led", "Website rewrite"]]}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Your brand is not your logo. It is what people say about you when you are not in the room. Define that first."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Your brand is not your logo. It is what people say about you when you are not in the room. Define that first."}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'brand-strategy-deck'
ON CONFLICT DO NOTHING;

-- customer-onboarding-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Customer Onboarding Deck"}'::jsonb, '{"level": 1, "text": "Customer Onboarding Deck"}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Welcome new customers. Product overview, getting started steps, key contacts, timeline to value, and support resources."}'::jsonb, '{"text": "Purpose: Welcome new customers. Product overview, getting started steps, key contacts, timeline to value, and support resources."}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Week", "Milestone", "Owner", "Success Metric"], "rows": [["Week 1", "Account setup + first login", "CSM", "100% activation"], ["Week 2", "Core workflow configured", "CSM + User", "First value delivered"], ["Week 4", "Team rollout", "Champion", "5+ active users"], ["Week 8", "Business review", "CSM", "ROI documented"]]}'::jsonb, '{"headers": ["Week", "Milestone", "Owner", "Success Metric"], "rows": [["Week 1", "Account setup + first login", "CSM", "100% activation"], ["Week 2", "Core workflow configured", "CSM + User", "First value delivered"], ["Week 4", "Team rollout", "Champion", "5+ active users"], ["Week 8", "Business review", "CSM", "ROI documented"]]}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Time to first value determines retention. Shorten the path from signup to ''aha moment'' to under 5 minutes."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Time to first value determines retention. Shorten the path from signup to ''aha moment'' to under 5 minutes."}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'customer-onboarding-deck'
ON CONFLICT DO NOTHING;

-- annual-marketing-plan
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Annual Marketing Plan"}'::jsonb, '{"level": 1, "text": "Annual Marketing Plan"}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Full-year marketing strategy with budget allocation, channel mix, campaign calendar, KPIs, and team structure."}'::jsonb, '{"text": "Purpose: Full-year marketing strategy with budget allocation, channel mix, campaign calendar, KPIs, and team structure."}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Quarter", "Focus", "Budget", "Key Campaign"], "rows": [["Q1", "Awareness", "$X", "Brand launch"], ["Q2", "Demand gen", "$X", "Webinar series"], ["Q3", "Pipeline", "$X", "Account-based"], ["Q4", "Retention", "$X", "Customer conference"]]}'::jsonb, '{"headers": ["Quarter", "Focus", "Budget", "Key Campaign"], "rows": [["Q1", "Awareness", "$X", "Brand launch"], ["Q2", "Demand gen", "$X", "Webinar series"], ["Q3", "Pipeline", "$X", "Account-based"], ["Q4", "Retention", "$X", "Customer conference"]]}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Allocate 70% to proven channels, 20% to scaling experiments, 10% to bold bets. Review allocation quarterly."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Allocate 70% to proven channels, 20% to scaling experiments, 10% to bold bets. Review allocation quarterly."}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'annual-marketing-plan'
ON CONFLICT DO NOTHING;

-- sales-enablement-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Sales Enablement Deck"}'::jsonb, '{"level": 1, "text": "Sales Enablement Deck"}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Arm your sales team. Ideal customer profile, objection handling, competitive positioning, pricing guide, and demo script."}'::jsonb, '{"text": "Purpose: Arm your sales team. Ideal customer profile, objection handling, competitive positioning, pricing guide, and demo script."}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Objection", "Response", "Proof Point"], "rows": [["Too expensive", "ROI payback in X months", "Case study: Company A"], ["Already have a solution", "We integrate, not replace", "Integration demo"], ["Not a priority", "Cost of inaction is $X/month", "Industry benchmark"]]}'::jsonb, '{"headers": ["Objection", "Response", "Proof Point"], "rows": [["Too expensive", "ROI payback in X months", "Case study: Company A"], ["Already have a solution", "We integrate, not replace", "Integration demo"], ["Not a priority", "Cost of inaction is $X/month", "Industry benchmark"]]}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "The best objection handling is anticipation. Address the top 3 objections before the prospect raises them."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "The best objection handling is anticipation. Address the top 3 objections before the prospect raises them."}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'sales-enablement-deck'
ON CONFLICT DO NOTHING;

-- design-review-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Design Review Deck"}'::jsonb, '{"level": 1, "text": "Design Review Deck"}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: UX/UI design review with user research findings, wireframes, design decisions, accessibility notes, and next steps."}'::jsonb, '{"text": "Purpose: UX/UI design review with user research findings, wireframes, design decisions, accessibility notes, and next steps."}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Screen", "Status", "Feedback", "Next Step"], "rows": [["Dashboard", "Final", "Approved", "Ship"], ["Onboarding", "In review", "Simplify step 3", "Revision"], ["Settings", "Draft", "Needs user testing", "Research"]]}'::jsonb, '{"headers": ["Screen", "Status", "Feedback", "Next Step"], "rows": [["Dashboard", "Final", "Approved", "Ship"], ["Onboarding", "In review", "Simplify step 3", "Revision"], ["Settings", "Draft", "Needs user testing", "Research"]]}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Good design is invisible. If the user notices the UI, something is wrong. Measure success by task completion, not beauty."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Good design is invisible. If the user notices the UI, something is wrong. Measure success by task completion, not beauty."}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'design-review-deck'
ON CONFLICT DO NOTHING;

-- api-documentation-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "API Documentation Deck"}'::jsonb, '{"level": 1, "text": "API Documentation Deck"}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Developer-facing API overview. Endpoints, authentication, rate limits, code examples, and integration guide."}'::jsonb, '{"text": "Purpose: Developer-facing API overview. Endpoints, authentication, rate limits, code examples, and integration guide."}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Endpoint", "Method", "Auth", "Description"], "rows": [["/api/v1/users", "GET", "Bearer token", "List all users"], ["/api/v1/projects", "POST", "Bearer token", "Create a project"], ["/api/v1/blocks", "PUT", "Bearer token", "Update block content"]]}'::jsonb, '{"headers": ["Endpoint", "Method", "Auth", "Description"], "rows": [["/api/v1/users", "GET", "Bearer token", "List all users"], ["/api/v1/projects", "POST", "Bearer token", "Create a project"], ["/api/v1/blocks", "PUT", "Bearer token", "Update block content"]]}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Developers judge your product in 5 minutes. If they cannot make a successful API call in that time, you have lost them."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Developers judge your product in 5 minutes. If they cannot make a successful API call in that time, you have lost them."}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'api-documentation-deck'
ON CONFLICT DO NOTHING;

-- system-migration-plan
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "System Migration Plan"}'::jsonb, '{"level": 1, "text": "System Migration Plan"}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Legacy to modern system migration. Current state, target architecture, migration phases, risk mitigation, and rollback plan."}'::jsonb, '{"text": "Purpose: Legacy to modern system migration. Current state, target architecture, migration phases, risk mitigation, and rollback plan."}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Phase", "Duration", "Risk", "Rollback Plan"], "rows": [["Assessment", "2 weeks", "Low", "N/A"], ["Data migration", "4 weeks", "High", "Snapshot restore"], ["Cutover", "1 weekend", "Critical", "DNS rollback"], ["Validation", "2 weeks", "Medium", "Parallel running"]]}'::jsonb, '{"headers": ["Phase", "Duration", "Risk", "Rollback Plan"], "rows": [["Assessment", "2 weeks", "Low", "N/A"], ["Data migration", "4 weeks", "High", "Snapshot restore"], ["Cutover", "1 weekend", "Critical", "DNS rollback"], ["Validation", "2 weeks", "Medium", "Parallel running"]]}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Every migration needs a rollback plan tested before go-live. Hope is not a strategy for critical infrastructure."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Every migration needs a rollback plan tested before go-live. Hope is not a strategy for critical infrastructure."}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'system-migration-plan'
ON CONFLICT DO NOTHING;

-- incident-response-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Incident Response Deck"}'::jsonb, '{"level": 1, "text": "Incident Response Deck"}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Post-incident review with timeline, root cause, impact assessment, remediation steps, and prevention measures."}'::jsonb, '{"text": "Purpose: Post-incident review with timeline, root cause, impact assessment, remediation steps, and prevention measures."}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Time", "Event", "Action Taken", "Impact"], "rows": [["14:02", "Alert triggered", "On-call paged", "None yet"], ["14:15", "Root cause identified", "Fix deployed", "API latency 5x"], ["14:32", "Service restored", "Monitoring confirmed", "Recovery complete"], ["15:00", "Postmortem started", "Timeline documented", "N/A"]]}'::jsonb, '{"headers": ["Time", "Event", "Action Taken", "Impact"], "rows": [["14:02", "Alert triggered", "On-call paged", "None yet"], ["14:15", "Root cause identified", "Fix deployed", "API latency 5x"], ["14:32", "Service restored", "Monitoring confirmed", "Recovery complete"], ["15:00", "Postmortem started", "Timeline documented", "N/A"]]}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Transparency builds trust. Share what happened, why, what you fixed, and what you changed to prevent recurrence."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Transparency builds trust. Share what happened, why, what you fixed, and what you changed to prevent recurrence."}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'incident-response-deck'
ON CONFLICT DO NOTHING;

-- performance-benchmark-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Performance Benchmark Deck"}'::jsonb, '{"level": 1, "text": "Performance Benchmark Deck"}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: System performance metrics. Latency, throughput, uptime, error rates, compared against SLAs and industry benchmarks."}'::jsonb, '{"text": "Purpose: System performance metrics. Latency, throughput, uptime, error rates, compared against SLAs and industry benchmarks."}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Metric", "Current", "SLA", "Industry Avg"], "rows": [["P99 Latency", "120ms", "<200ms", "180ms"], ["Uptime", "99.97%", "99.95%", "99.9%"], ["Error Rate", "0.02%", "<0.1%", "0.05%"], ["Throughput", "12K rps", ">10K rps", "8K rps"]]}'::jsonb, '{"headers": ["Metric", "Current", "SLA", "Industry Avg"], "rows": [["P99 Latency", "120ms", "<200ms", "180ms"], ["Uptime", "99.97%", "99.95%", "99.9%"], ["Error Rate", "0.02%", "<0.1%", "0.05%"], ["Throughput", "12K rps", ">10K rps", "8K rps"]]}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Benchmark against your SLAs first, competitors second. Your customers care about your promises, not industry averages."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Benchmark against your SLAs first, competitors second. Your customers care about your promises, not industry averages."}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'performance-benchmark-deck'
ON CONFLICT DO NOTHING;

-- vendor-evaluation-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Vendor Evaluation Deck"}'::jsonb, '{"level": 1, "text": "Vendor Evaluation Deck"}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Compare vendors side by side. Scoring criteria, feature comparison, pricing analysis, references, and recommendation."}'::jsonb, '{"text": "Purpose: Compare vendors side by side. Scoring criteria, feature comparison, pricing analysis, references, and recommendation."}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Criteria", "Vendor A", "Vendor B", "Vendor C"], "rows": [["Price", "$X/yr", "$Y/yr", "$Z/yr"], ["Feature fit", "85%", "72%", "90%"], ["Support SLA", "4hr", "24hr", "1hr"], ["References", "3 enterprise", "1 enterprise", "5 enterprise"]]}'::jsonb, '{"headers": ["Criteria", "Vendor A", "Vendor B", "Vendor C"], "rows": [["Price", "$X/yr", "$Y/yr", "$Z/yr"], ["Feature fit", "85%", "72%", "90%"], ["Support SLA", "4hr", "24hr", "1hr"], ["References", "3 enterprise", "1 enterprise", "5 enterprise"]]}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Price is the last criterion to evaluate. Feature fit, support quality, and reference checks predict long-term value better."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Price is the last criterion to evaluate. Feature fit, support quality, and reference checks predict long-term value better."}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'vendor-evaluation-deck'
ON CONFLICT DO NOTHING;

-- change-readiness-assessment
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Change Readiness Assessment"}'::jsonb, '{"level": 1, "text": "Change Readiness Assessment"}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Assess organizational readiness for change. Stakeholder analysis, impact assessment, communication plan, and training needs."}'::jsonb, '{"text": "Purpose: Assess organizational readiness for change. Stakeholder analysis, impact assessment, communication plan, and training needs."}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Dimension", "Score (1-5)", "Risk", "Mitigation"], "rows": [["Leadership alignment", "4", "Low", "Weekly syncs"], ["Employee awareness", "2", "High", "Communication plan"], ["Training readiness", "3", "Medium", "Pilot group first"], ["Technical readiness", "4", "Low", "Staging complete"]]}'::jsonb, '{"headers": ["Dimension", "Score (1-5)", "Risk", "Mitigation"], "rows": [["Leadership alignment", "4", "Low", "Weekly syncs"], ["Employee awareness", "2", "High", "Communication plan"], ["Training readiness", "3", "Medium", "Pilot group first"], ["Technical readiness", "4", "Low", "Staging complete"]]}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "The biggest risk in change management is not technology. It is people. Invest 60% of your change budget in communication and training."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "The biggest risk in change management is not technology. It is people. Invest 60% of your change budget in communication and training."}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'change-readiness-assessment'
ON CONFLICT DO NOTHING;

-- quarterly-ops-review
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Quarterly Operations Review"}'::jsonb, '{"level": 1, "text": "Quarterly Operations Review"}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: End-of-quarter operational performance. KPIs, process improvements, team capacity, cost optimization, and next quarter priorities."}'::jsonb, '{"text": "Purpose: End-of-quarter operational performance. KPIs, process improvements, team capacity, cost optimization, and next quarter priorities."}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["KPI", "Target", "Actual", "Status"], "rows": [["Revenue", "$X M", "$Y M", "On track"], ["Customer satisfaction", "4.5/5", "4.3/5", "At risk"], ["Employee retention", ">90%", "92%", "On track"], ["Cost per acquisition", "<$X", "$Y", "Over budget"]]}'::jsonb, '{"headers": ["KPI", "Target", "Actual", "Status"], "rows": [["Revenue", "$X M", "$Y M", "On track"], ["Customer satisfaction", "4.5/5", "4.3/5", "At risk"], ["Employee retention", ">90%", "92%", "On track"], ["Cost per acquisition", "<$X", "$Y", "Over budget"]]}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Red metrics are not failures. They are early warnings. The only failure is a red metric nobody is working on."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Red metrics are not failures. They are early warnings. The only failure is a red metric nobody is working on."}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'quarterly-ops-review'
ON CONFLICT DO NOTHING;

-- compliance-audit-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Compliance Audit Deck"}'::jsonb, '{"level": 1, "text": "Compliance Audit Deck"}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Audit findings, risk ratings, remediation timeline, and compliance status across regulatory requirements."}'::jsonb, '{"text": "Purpose: Audit findings, risk ratings, remediation timeline, and compliance status across regulatory requirements."}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Finding", "Severity", "Status", "Due Date"], "rows": [["Access control gaps", "High", "Remediation in progress", "Q2"], ["Data retention policy", "Medium", "Policy drafted", "Q1"], ["Third-party risk review", "Low", "Scheduled", "Q3"]]}'::jsonb, '{"headers": ["Finding", "Severity", "Status", "Due Date"], "rows": [["Access control gaps", "High", "Remediation in progress", "Q2"], ["Data retention policy", "Medium", "Policy drafted", "Q1"], ["Third-party risk review", "Low", "Scheduled", "Q3"]]}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Treat audit findings as gifts. Each one is a vulnerability identified before it becomes an incident."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Treat audit findings as gifts. Each one is a vulnerability identified before it becomes an incident."}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'compliance-audit-deck'
ON CONFLICT DO NOTHING;

-- data-privacy-impact
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Data Privacy Impact Assessment"}'::jsonb, '{"level": 1, "text": "Data Privacy Impact Assessment"}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: GDPR/CCPA privacy impact assessment. Data flows, risk evaluation, consent mechanisms, and compliance roadmap."}'::jsonb, '{"text": "Purpose: GDPR/CCPA privacy impact assessment. Data flows, risk evaluation, consent mechanisms, and compliance roadmap."}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Data Type", "Collection Method", "Storage", "Risk Level"], "rows": [["PII (name, email)", "User registration", "Encrypted at rest", "Medium"], ["Usage analytics", "Automatic tracking", "Anonymized", "Low"], ["Payment data", "Stripe integration", "Not stored locally", "High"]]}'::jsonb, '{"headers": ["Data Type", "Collection Method", "Storage", "Risk Level"], "rows": [["PII (name, email)", "User registration", "Encrypted at rest", "Medium"], ["Usage analytics", "Automatic tracking", "Anonymized", "Low"], ["Payment data", "Stripe integration", "Not stored locally", "High"]]}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Privacy by design costs 10x less than privacy by retrofit. Build it into the architecture from day one."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Privacy by design costs 10x less than privacy by retrofit. Build it into the architecture from day one."}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'data-privacy-impact'
ON CONFLICT DO NOTHING;

-- ml-model-deployment-deck
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "ML Model Deployment Deck"}'::jsonb, '{"level": 1, "text": "ML Model Deployment Deck"}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Model deployment plan. Training data, evaluation metrics, A/B test results, monitoring strategy, and rollout phases."}'::jsonb, '{"text": "Purpose: Model deployment plan. Training data, evaluation metrics, A/B test results, monitoring strategy, and rollout phases."}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Stage", "Metric", "Threshold", "Status"], "rows": [["Training", "Accuracy", ">95%", "97.2% \u2713"], ["Validation", "F1 Score", ">0.90", "0.93 \u2713"], ["A/B Test", "Conversion lift", ">5%", "8.3% \u2713"], ["Production", "Latency P99", "<100ms", "Pending"]]}'::jsonb, '{"headers": ["Stage", "Metric", "Threshold", "Status"], "rows": [["Training", "Accuracy", ">95%", "97.2% \u2713"], ["Validation", "F1 Score", ">0.90", "0.93 \u2713"], ["A/B Test", "Conversion lift", ">5%", "8.3% \u2713"], ["Production", "Latency P99", "<100ms", "Pending"]]}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "A model in staging is worth nothing. Ship to production with monitoring, not perfection."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "A model in staging is worth nothing. Ship to production with monitoring, not perfection."}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'ml-model-deployment-deck'
ON CONFLICT DO NOTHING;

-- analytics-dashboard-review
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Analytics Dashboard Review"}'::jsonb, '{"level": 1, "text": "Analytics Dashboard Review"}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Present your analytics insights. Dashboard walkthrough, key metrics, trends, anomalies, and recommended actions."}'::jsonb, '{"text": "Purpose: Present your analytics insights. Dashboard walkthrough, key metrics, trends, anomalies, and recommended actions."}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Dashboard", "Audience", "Update Freq", "Key Insight"], "rows": [["Revenue", "C-suite", "Daily", "MRR trend + forecast"], ["Product", "PM team", "Weekly", "Feature adoption rates"], ["Support", "CS team", "Real-time", "Ticket volume + CSAT"]]}'::jsonb, '{"headers": ["Dashboard", "Audience", "Update Freq", "Key Insight"], "rows": [["Revenue", "C-suite", "Daily", "MRR trend + forecast"], ["Product", "PM team", "Weekly", "Feature adoption rates"], ["Support", "CS team", "Real-time", "Ticket volume + CSAT"]]}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "A dashboard nobody checks is worse than no dashboard. It creates a false sense of data-driven decision making."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "A dashboard nobody checks is worse than no dashboard. It creates a false sense of data-driven decision making."}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'analytics-dashboard-review'
ON CONFLICT DO NOTHING;

-- ai-ethics-framework
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "AI Ethics Framework"}'::jsonb, '{"level": 1, "text": "AI Ethics Framework"}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Responsible AI principles. Bias detection, fairness metrics, transparency requirements, and governance structure."}'::jsonb, '{"text": "Purpose: Responsible AI principles. Bias detection, fairness metrics, transparency requirements, and governance structure."}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Principle", "Implementation", "Measurement", "Owner"], "rows": [["Fairness", "Bias testing on every release", "Demographic parity score", "ML team"], ["Transparency", "Model cards for all models", "Explainability audit", "Product"], ["Privacy", "Data minimization", "PII scan results", "Security"], ["Accountability", "Human-in-the-loop for high-stakes", "Override rate tracking", "Ops"]]}'::jsonb, '{"headers": ["Principle", "Implementation", "Measurement", "Owner"], "rows": [["Fairness", "Bias testing on every release", "Demographic parity score", "ML team"], ["Transparency", "Model cards for all models", "Explainability audit", "Product"], ["Privacy", "Data minimization", "PII scan results", "Security"], ["Accountability", "Human-in-the-loop for high-stakes", "Override rate tracking", "Ops"]]}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Ethics is not a feature you ship once. It is a practice you maintain. Schedule quarterly bias reviews and publish the results."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Ethics is not a feature you ship once. It is a practice you maintain. Schedule quarterly bias reviews and publish the results."}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'ai-ethics-framework'
ON CONFLICT DO NOTHING;

-- smart-slides-datacenter
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Smart Slides: Datacenter Architecture"}'::jsonb, '{"level": 1, "text": "Smart Slides: Datacenter Architecture"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Live adaptive datacenter pitch. Audience shares RPO, RTO, and budget during the meeting. Architecture and pricing slides regenerate in real-time. Uses live_input and adaptive_block."}'::jsonb, '{"text": "Purpose: Live adaptive datacenter pitch. Audience shares RPO, RTO, and budget during the meeting. Architecture and pricing slides regenerate in real-time. Uses live_input and adaptive_block."}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Parameter", "Input Source", "Downstream Effect"], "rows": [["RPO", "Live Input (slide 3)", "Replication topology adapts"], ["RTO", "Live Input (slide 3)", "Failover architecture adapts"], ["Budget", "Live Input (slide 3)", "Pricing and sizing adapt"], ["Region", "Voice Input", "Compliance and latency adjust"]]}'::jsonb, '{"headers": ["Parameter", "Input Source", "Downstream Effect"], "rows": [["RPO", "Live Input (slide 3)", "Replication topology adapts"], ["RTO", "Live Input (slide 3)", "Failover architecture adapts"], ["Budget", "Live Input (slide 3)", "Pricing and sizing adapt"], ["Region", "Voice Input", "Compliance and latency adjust"]]}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Smart Slides turn your presentation into a live configuration tool. The customer shares requirements, the deck adapts. No follow-up needed."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Smart Slides turn your presentation into a live configuration tool. The customer shares requirements, the deck adapts. No follow-up needed."}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-datacenter'
ON CONFLICT DO NOTHING;

-- smart-slides-voice-pricing
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 0, '{"level": 1, "text": "Smart Slides: Voice-Adaptive Pricing"}'::jsonb, '{"level": 1, "text": "Smart Slides: Voice-Adaptive Pricing"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'text', 1, '{"text": "Purpose: Voice-powered sales deck. Speak naturally with the customer. AI extracts headcount, region, and tier from the conversation and regenerates pricing, ROI, and implementation timeline slides. Uses voice_input and adaptive_block."}'::jsonb, '{"text": "Purpose: Voice-powered sales deck. Speak naturally with the customer. AI extracts headcount, region, and tier from the conversation and regenerates pricing, ROI, and implementation timeline slides. Uses voice_input and adaptive_block."}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 2, '{"level": 2, "text": "Context"}'::jsonb, '{"level": 2, "text": "Context"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'two_col', 3, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb, '{"left": "Current situation. State 3 key facts and the primary constraint or trigger.", "right": "Why this matters now. Connect to time, cost, risk, growth, or compliance."}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 4, '{"level": 2, "text": "Key Points"}'::jsonb, '{"level": 2, "text": "Key Points"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'list', 5, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb, '{"ordered": false, "items": ["Point 1: State the primary insight in one sentence", "Point 2: Quantify the impact with specific numbers", "Point 3: Define the decision or action required"]}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 6, '{"level": 2, "text": "Analysis"}'::jsonb, '{"level": 2, "text": "Analysis"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'table', 7, '{"headers": ["Parameter", "Detection Method", "Downstream Effect"], "rows": [["Headcount", "Voice recognition", "Per-seat pricing recalculates"], ["Region", "Voice recognition", "Compliance requirements adapt"], ["Tier", "Voice recognition", "Feature matrix adjusts"], ["Contract term", "Voice recognition", "Discount schedule adapts"]]}'::jsonb, '{"headers": ["Parameter", "Detection Method", "Downstream Effect"], "rows": [["Headcount", "Voice recognition", "Per-seat pricing recalculates"], ["Region", "Voice recognition", "Compliance requirements adapt"], ["Tier", "Voice recognition", "Feature matrix adjusts"], ["Contract term", "Voice recognition", "Discount schedule adapts"]]}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 8, '{"level": 2, "text": "Recommendation"}'::jsonb, '{"level": 2, "text": "Recommendation"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'callout', 9, '{"icon": "\ud83d\udca1", "text": "Voice-adaptive pricing removes the ''I''ll get back to you'' from sales meetings. The deck listens, extracts, and recalculates in real-time."}'::jsonb, '{"icon": "\ud83d\udca1", "text": "Voice-adaptive pricing removes the ''I''ll get back to you'' from sales meetings. The deck listens, extracts, and recalculates in real-time."}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
INSERT INTO template_blocks (template_id, type, order_index, content, block_payload) 
SELECT t.id, 'heading', 10, '{"level": 2, "text": "Next Steps"}'::jsonb, '{"level": 2, "text": "Next Steps"}'::jsonb
FROM templates t WHERE t.slug = 'smart-slides-voice-pricing'
ON CONFLICT DO NOTHING;
