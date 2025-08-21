import React from "react";
import "./teamtask.css";

const sample_data = [
  {
    id: 1,
    assignee: "Rishi Jain",
    todo_tasks: [
      { id: 1, text: "Call broker for Dream Valley dbch cy rbfr f r fr fbrf rf rbfrbfrbf rfbrfrf rfvrfgrfvr fgrvfrvrfrvfrvfr fgrvfr gfrvfgvrgfrgfr fgrvfrgf rfr gf rgf " },
      { id: 2, text: "Share brochure with lead #45231" },
      { id: 3, text: "Confirm site visit schedule" },
      { id: 4, text: "Arrange client meeting at site" },
      { id: 5, text: "Send updated price sheet" },
      { id: 6, text: "Draft new brochure" },
      { id: 7, text: "Draft new brochure" },
      { id: 8, text: "Draft new brochure" },
      { id: 9, text: "Draft new brochure" },
      { id: 10, text: "Draft new brochure" },
      { id: 11, text: "Draft new brochure" },
      { id: 12, text: "Draft new brochure" },
      { id: 13, text: "Draft new brochure" },
      { id: 14, text: "Draft new brochure" },
      { id: 15, text: "Draft new brochure" },

    ],
    followup_tasks: [
      { id: 7, text: "Follow up: Site visit with Sharma family" },
      { id: 8, text: "Follow up: Payment confirmation mail" },
    ],
  },
  {
    id: 2,
    assignee: "Saikat Roy",
    todo_tasks: [
      { id: 9, text: "Prepare weekly CPL/CPQL sheet" },
      { id: 10, text: "Publish Gurukul testimonial reel" },
    ],
    followup_tasks: [
      { id: 11, text: "Follow up: Agency invoice approval" },
      { id: 12, text: "Follow up: Budget finalization with accounts" },
    ],
  },
  {
    id: 3,
    assignee: "Ananya Sen",
    todo_tasks: [
      { id: 13, text: "Update project landing page banners" },
      { id: 14, text: "Schedule DWC social media posts" },
    ],
    followup_tasks: [
      { id: 15, text: "Follow up: Feedback from design team" },
      { id: 16, text: "Follow up: Pending approvals from management" },
    ],
  },
  {
    id: 4,
    assignee: "Kunal Sharma",
    todo_tasks: [
      { id: 17, text: "Prepare monthly sales report" },
      { id: 18, text: "Follow up with new leads" },
    ],
    followup_tasks: [
      { id: 19, text: "Follow up: Sent quotation to client" },
    ],
  },
  {
    id: 5,
    assignee: "Priya Mehta",
    todo_tasks: [
      { id: 20, text: "Design ad creatives for Dream Valley" },
      { id: 21, text: "Plan content calendar" },
    ],
    followup_tasks: [
      { id: 22, text: "Follow up: Approved creatives" },
    ],
  },
];

export default function TeamTask() {
  return (
    <div className="board">
      {sample_data.map((card) => (
        <div key={card.id} className="task_card">
          <div className="card_header">
            <h3 className="card_title">{card.assignee}</h3>
          </div>

          <div className="card_content">
            <div className="task_section">
              <span className="h4">To-Do</span>
              {card.todo_tasks.length === 0 && (
                <p className="empty">No tasks</p>
              )}
              {card.todo_tasks.map((task) => (
                <div key={task.id} className="task_item">
                <input
                  type="checkbox"
                  checked={false}
                  className="deadline-checkbox"
                />
                  <span className="task_text">{task.text}</span>
                </div>
              ))}
            </div>
        <hr/>
            <div className="task_section">
              <span className="h4">Follow-Up</span>
              {card.followup_tasks.length === 0 && (
                <p className="empty">No follow-ups</p>
              )}
              {card.followup_tasks.map((task) => (
                <div key={task.id} className="task_item followup">
              
                  <input
                    type="checkbox"
                    checked={false}
                    className="deadline-checkbox"
                    />
                  <span className="task_text">{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
