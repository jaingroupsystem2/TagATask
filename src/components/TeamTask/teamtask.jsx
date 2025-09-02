import React, { useState, useEffect } from 'react';
import "./teamtask.css";
import axios from 'axios';
import { Tooltip } from "react-tooltip";
import TargetTime from "../TargetTime";


export default function TeamTask() {
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const current_user_id = localStorage.getItem("tagatask_user_id");

  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState(null);
  const [todo_tasks, setTodo_tasks] = useState({});

  // modal state
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [active_assignee, set_active_assignee] = useState(null);
  const [active_tasks, set_active_tasks] = useState([]);

  const fetch_teamTask_data = async () => {
    set_is_loading(true);
    set_error(null);
    try {
      const response = await axios.get(
        `${Base_URL}/api_list/team_task_tracker`,
        {
          params: { current_personnel_id: current_user_id },
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'any',
          },
        }
      );

      const api_items = response?.data?.personnels ?? {};
      setTodo_tasks(api_items);
    } catch (err) {
      console.error('calendar fetch failed', err);
      set_error('Failed to load team tasks.');
      setTodo_tasks({});
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    if (current_user_id) fetch_teamTask_data();
  }, [current_user_id]);

  const open_assignee_modal = (assignee, tasks) => {
    set_active_assignee(assignee);
    set_active_tasks(Array.isArray(tasks) ? tasks : []);
    set_is_modal_open(true);
  };

  const close_assignee_modal = () => {
    set_is_modal_open(false);
    set_active_assignee(null);
    set_active_tasks([]);
  };

  return (
    <div className="board">
      {is_loading && <p className="loading">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!is_loading && !error && Object.keys(todo_tasks).length === 0 && (
        <div className="empty-wrapper">
          <div className="task_card">
            <p className="empty">Ups Sorry, You Don’t Have Any Team</p>
          </div>
        </div>

      )}

      {/* Render each assignee card */}
      {Object.entries(todo_tasks).map(([assignee, tasks]) => {
        const safe_tasks = Array.isArray(tasks) ? tasks : [];
        return (
          <div
            key={assignee}
            className="task_card task_card--clickable"
            role="button"
            tabIndex={0}
            onClick={() => open_assignee_modal(assignee, safe_tasks)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              open_assignee_modal(assignee, safe_tasks)
            }
          >
            <div className="card_header">
              <h3 className="card_title">{assignee}</h3>
            </div>

            <div className="card_content">
              <div className="task_section">
                <span className="h4">To-Do</span>
                {safe_tasks.length === 0 && <p className="empty">No tasks</p>}
                {safe_tasks.map((task) => (
                  <div key={task.task_priority_id} className="task_item">
                    <input type="checkbox" className="deadline-checkbox" checked={false} readOnly />
                    <span
                      className="task_text"
                      dangerouslySetInnerHTML={{ __html: task.task_description }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Popup Modal */}
      {is_modal_open && (
        <div className="modal_backdrop" onClick={close_assignee_modal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignee-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal_close" aria-label="Close" onClick={close_assignee_modal}>
              ×
            </button>
            <h4 id="assignee-modal-title" className="modal_title">
              {active_assignee || "Tasks"}
            </h4>


            {[...active_tasks]
  .sort((a, b) => {
    const A = (a?.task_given_by ?? "").trim();
    const B = (b?.task_given_by ?? "").trim();

    // push blanks to the bottom
    if (!A && !B) return 0;
    if (!A) return 1;
    if (!B) return -1;

    return A.localeCompare(B, undefined, { sensitivity: "base" }); // case-insensitive A→Z
  }).map((task, index) => (
              <>
                <div key={task.task_priority_id} className="main-div">
                  <div className="first-container-modal">
                    <input
                      checked={false}
                      type="checkbox"
                      className="new-div-checkbox"
                    />
                    <div
                      suppressContentEditableWarning={true}
                      className="new-div-input-modal"
                    >
                      <span dangerouslySetInnerHTML={{ __html: task.task_description }} />

                    </div>

                  </div>
                  <div className="second-container-modal">
                      <div >
                        <TargetTime dateTime={task.target_date} />
                      </div>

                    <div className="task-given-name">
                      <span>{task.task_given_by}</span>
                    </div>

                  </div>
                </div>

              </>

            ))}

          </div>
        </div>
      )}
    </div>
  );
}
