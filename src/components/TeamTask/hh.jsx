import React, { useState } from "react";
import "./teamtask.css";

const sample_data = [
  {
    id: 1,
    assignee: "Rishi Jain",
    todo_tasks: [
      { id: 1, text: "Call broker for Dream Valley" },
      { id: 2, text: "Share brochure with lead #45231" },
      { id: 3, text: "Confirm site visit schedule" },
    ],
    followup_tasks: [
      { id: 4, text: "Follow up: Site visit with Sharma family" },
      { id: 5, text: "Follow up: Payment confirmation mail" },
    ],
  },
  {
    id: 2,
    assignee: "Saikat Roy",
    todo_tasks: [
      { id: 6, text: "Prepare weekly CPL/CPQL sheet" },
      { id: 7, text: "Publish Gurukul testimonial reel" },
    ],
    followup_tasks: [
      { id: 8, text: "Follow up: Agency invoice approval" },
      { id: 9, text: "Follow up: Budget finalization with accounts" },
    ],
  },
  {
    id: 3,
    assignee: "Ananya Sen",
    todo_tasks: [
      { id: 10, text: "Update project landing page banners" },
      { id: 11, text: "Schedule DWC social media posts" },
    ],
    followup_tasks: [
      { id: 12, text: "Follow up: Feedback from design team" },
      { id: 13, text: "Follow up: Pending approvals from management" },
    ],
  },
];

export default function TeamTask() {
  const [cards, set_cards] = useState(sample_data);

  const mark_done = (card_id, task_id) => {
    set_cards((prev) =>
      prev.map((card) => {
        if (card.id !== card_id) return card;
        const task = card.todo_tasks.find((t) => t.id === task_id);
        if (!task) return card;
        return {
          ...card,
          todo_tasks: card.todo_tasks.filter((t) => t.id !== task_id),
          followup_tasks: [task, ...card.followup_tasks],
        };
      })
    );
  };

  const reopen_task = (card_id, task_id) => {
    set_cards((prev) =>
      prev.map((card) => {
        if (card.id !== card_id) return card;
        const task = card.followup_tasks.find((t) => t.id === task_id);
        if (!task) return card;
        return {
          ...card,
          followup_tasks: card.followup_tasks.filter((t) => t.id !== task_id),
          todo_tasks: [task, ...card.todo_tasks],
        };
      })
    );
  };

  return (
    <div className="board">
      {cards.map((card) => (
        <div key={card.id} className="task_card">
          <div className="card_header">
            <div className="avatar">
              {card.assignee.split(" ").map((w) => w[0]).join("").toUpperCase()}
            </div>
            <h3 className="card_title">{card.assignee}</h3>
          </div>

          <div className="task_section">
            <h4>To-Do</h4>
            {card.todo_tasks.length === 0 && <p className="empty">No tasks</p>}
            {card.todo_tasks.map((task) => (
              <div key={task.id} className="task_item">
                <button
                  className="check_btn"
                  onClick={() => mark_done(card.id, task.id)}
                  aria-label="Mark done"
                >
                  ✓
                </button>
                <span className="task_text">{task.text}</span>
              </div>
            ))}
          </div>

          <div className="task_section">
            <h4>Follow-Up (Completed)</h4>
            {card.followup_tasks.length === 0 && (
              <p className="empty">No follow-ups</p>
            )}
            {card.followup_tasks.map((task) => (
              <div key={task.id} className="task_item followup">
                <button
                  className="reopen_btn"
                  onClick={() => reopen_task(card.id, task.id)}
                  aria-label="Reopen"
                >
                  ↺
                </button>
                <span className="task_text">{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
