import { r as reactExports, x as updateDisplayPathEnvInfoForWebview, j as jsxRuntimeExports, z as ClientStateContextProvider, P as PromptEditor, G as markdownCodeBlockLanguageIDForFilename, F as FileLink, M as MarkdownFromCody, D as client, R as React, H as getGenericVSCodeAPI } from './index-DVtcckEh.js';

const StopSpinner = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stop-spinner", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-loading spinner" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-debug-stop stop" })
] });
const UserInput = ({ mode, onSubmit }) => {
  const [description, setDescription] = reactExports.useState("");
  const onEnter = reactExports.useCallback(
    (event) => {
      if (event && !event.shiftKey && !event.isComposing && description.trim().length > 0) {
        event.preventDefault();
        if (onSubmit) {
          onSubmit(description);
        }
        setDescription("");
      }
    },
    [description, onSubmit]
  );
  const onEditorChange = reactExports.useCallback((value) => {
    setDescription(value.text);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PromptEditor,
      {
        onChange: onEditorChange,
        onEnterKey: onEnter,
        placeholder: mode === "start" ? "Describe what you'd like to do" : "Make a comment"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "input-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-comment" }) })
  ] });
};
const PlanStepControls = ({ status, setStatus }) => {
  const baseStatusIcon = ["todo", "run-disabled"].includes(status) ? "circle-large" : "pass-filled";
  const hoverStatusIcon = ["todo", "run-disabled"].includes(status) ? "pass" : "pass-filled";
  const [statusHover, setStatusHover] = reactExports.useState(false);
  const setStatusHoverTrue = reactExports.useCallback(() => setStatusHover(true), []);
  const setStatusHoverFalse = reactExports.useCallback(() => setStatusHover(false), []);
  const setStatusDone = reactExports.useCallback(() => setStatus("done"), [setStatus]);
  const setStatusTodo = reactExports.useCallback(() => setStatus("todo"), [setStatus]);
  const statusIcon = statusHover ? hoverStatusIcon : baseStatusIcon;
  const controls = [];
  switch (status) {
    case "todo":
    case "run-disabled":
      controls.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "event-button",
            onMouseEnter: setStatusHoverTrue,
            onMouseLeave: setStatusHoverFalse,
            onClick: setStatusDone,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: `codicon codicon-${statusIcon}` })
          },
          1
        )
      );
      break;
    case "done":
      controls.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "event-button",
            onMouseEnter: setStatusHoverTrue,
            onMouseLeave: setStatusHoverFalse,
            onClick: setStatusTodo,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: `codicon codicon-${statusIcon}` })
          },
          1
        )
      );
      break;
  }
  switch (status) {
    case "todo":
      controls.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "event-button",
            onClick: () => setStatus("running"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-play" })
          },
          2
        )
      );
      break;
    case "running":
      controls.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "event-button", onClick: () => setStatus("todo"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StopSpinner, {}) }, 2)
      );
      break;
    case "run-disabled":
      controls.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "event-button event-button-disabled", children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-play", title: "Run disabled" }) }, 2)
      );
      break;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `step-controls ${controls.length > 1 && "step-controls-multi"}`, children: controls });
};
const PlanBlock = ({ status, title, steps, stepStatus, updateStep }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: 0, codicon: "checklist", title, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "steps-container", children: steps.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PlanStepControls,
        {
          status: stepStatus[step.stepId]?.status ?? "run-disabled",
          setStatus: (status2) => {
            updateStep(step.stepId, status2);
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-title", children: step.title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-description", children: step.description })
  ] }, step.title)) }) });
};
const EventItem = ({ level, codicon, title, children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `event event-l${level}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "event-title", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: `codicon codicon-${codicon}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "event-title-name", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "event-body", children })
  ] });
};
const BlockItem = ({ title, state, onReplay, onCancelCurrent }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "node-block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: state === "doing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "node-header-button",
        onClick: () => onCancelCurrent(),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(StopSpinner, {})
      }
    ) : state === "cancelled" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "node-header-button", onClick: () => onReplay(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-play" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "node-header-button", onClick: () => onReplay(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-debug-restart" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "node-title", children: `${capitalize(title)}${state === "cancelled" ? " (stopped)" : ""}` })
  ] });
};
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function displayInfoForEvent(event) {
  const hardcoded = {
    describe: { codicon: "lightbulb" },
    restate: { codicon: "comment-discussion" },
    contextualize: { codicon: "search" },
    reproduce: { codicon: "beaker" },
    plan: { codicon: "checklist" },
    search: { codicon: "search" },
    open: { codicon: "file" },
    scroll: { codicon: "eye" },
    edit: { codicon: "edit" },
    bash: { codicon: "terminal" },
    human: { codicon: "robot", title: "Observed human" }
  };
  const info = hardcoded[event.type] || {};
  switch (event.type) {
    case "open": {
      info.title = `Open ${event.file}`;
      break;
    }
  }
  return {
    codicon: info?.codicon ?? "circle",
    title: info?.title ?? capitalize(event.type).replace("-", " ")
  };
}
function uriRangeString(uri, range) {
  return `${uri.toString()}${range.start.line + 1}:${range.start.character + 1}-${range.end.line + 1}:${range.end.character + 1}`;
}
function renderEvent(event, key, planStepStatus, actions) {
  if (event.type === "plan") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlanBlock,
      {
        title: "Plan",
        steps: event.steps,
        status: "todo",
        stepStatus: planStepStatus[event.blockid] ?? {},
        updateStep: (stepid, status) => {
          actions.updateStep(event.blockid, stepid, status);
        }
      }
    );
  }
  const { codicon, title } = displayInfoForEvent(event);
  switch (event.type) {
    case "describe": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "event-text", children: event.description }) });
    }
    case "restate": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "event-text", children: event.output }) });
    }
    case "contextualize": {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(EventItem, { level: event.level, codicon, title, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contextualize-explanation", children: "Found some relevant context:" }),
        event.output.map((annotatedContext) => {
          const langID = markdownCodeBlockLanguageIDForFilename(
            annotatedContext.source.uri
          );
          const md = "```" + langID + "\n" + annotatedContext.text + "\n```";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "event-code-container",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "event-code-filename", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FileLink,
                  {
                    linkClassName: "event-code-filename-link",
                    uri: annotatedContext.source.uri,
                    range: annotatedContext.source.range
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownFromCody, { className: "event-code-snippet", children: md }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "event-text", children: annotatedContext.comment })
              ]
            },
            uriRangeString(
              annotatedContext.source.uri,
              annotatedContext.source.range
            )
          );
        })
      ] });
    }
    case "reproduce": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title });
    }
    case "search": {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(EventItem, { level: event.level, codicon, title, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Query: ",
          event.query
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { children: event.results.map((result) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: result }, result)) })
      ] });
    }
    case "open": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title });
    }
    case "scroll": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title: `Scroll ${event.direction}` });
    }
    case "edit": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "event-input" }) });
    }
    case "bash": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "event-input" }) });
    }
    case "human": {
      let child;
      switch (event.actionType) {
        case "edit":
          child = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "human-action", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-edit" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.description })
          ] });
          break;
        case "view":
          child = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "human-action", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-eye" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.description })
          ] });
          break;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title, children: child });
    }
    default: {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EventItem, { level: event.level, codicon, title });
    }
  }
}
const MinionApp = ({ vscodeAPI }) => {
  const [transcript, setTranscript] = reactExports.useState([]);
  const [sessionIds, setSessionIds] = reactExports.useState([]);
  const [currentSessionId, setCurrentSessionId] = reactExports.useState();
  const [planStepsStatus, setPlanStepsStatus] = reactExports.useState({});
  const [clientState] = reactExports.useState({
    initialContext: []
  });
  reactExports.useEffect(() => {
    vscodeAPI.onMessage((message) => {
      switch (message.type) {
        case "config":
          updateDisplayPathEnvInfoForWebview(message.workspaceFolderUris);
          break;
        case "update-session-ids":
          setCurrentSessionId(message.currentSessionId);
          setSessionIds(message.sessionIds);
          break;
        case "update-transcript":
          setTranscript(message.transcript);
          break;
        case "update-plan-step-status": {
          const { blockid, stepStatus } = message;
          setPlanStepsStatus({ ...planStepsStatus, [blockid]: stepStatus });
          break;
        }
      }
    });
    vscodeAPI.postMessage({ type: "ready" });
  }, [vscodeAPI, planStepsStatus]);
  const clearHistory = reactExports.useCallback(() => {
    vscodeAPI.postMessage({ type: "clear-history" });
  }, [vscodeAPI]);
  const replayFromBlock = reactExports.useCallback(
    (transcriptIndex) => {
      if (transcriptIndex >= transcript.length || transcript[transcriptIndex].type !== "block") {
        throw new Error(
          "Item at index was not block: " + JSON.stringify(transcript[transcriptIndex])
        );
      }
      vscodeAPI.postMessage({
        type: "replay-from-index",
        index: transcriptIndex
      });
    },
    [vscodeAPI, transcript]
  );
  const cancelCurrentBlock = reactExports.useCallback(() => {
    vscodeAPI.postMessage({ type: "cancel-current-block" });
  }, [vscodeAPI]);
  const updatePlanStep = reactExports.useCallback(
    (blockid, stepid, status) => {
      vscodeAPI.postMessage({
        type: "update-plan-step",
        blockid,
        stepid,
        status
      });
    },
    [vscodeAPI]
  );
  const onSelectSession = reactExports.useCallback(
    (event) => {
      const sessionId = event.target.value;
      if (sessionId === void 0 || sessionId.length === 0) {
        return;
      }
      setCurrentSessionId(sessionId);
      vscodeAPI.postMessage({ type: "set-session", id: sessionId });
    },
    [vscodeAPI]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientStateContextProvider, { value: clientState, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-add" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: clearHistory, children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "codicon codicon-clear-all" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          className: "controls-session-selector",
          onChange: onSelectSession,
          value: currentSessionId,
          children: sessionIds.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: id }, id))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "transcript", children: transcript.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: item.type === "event" ? renderEvent(item.event, `${i}`, planStepsStatus, {
      updateStep: updatePlanStep
    }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      BlockItem,
      {
        state: item.status,
        title: item.block.nodeid,
        onReplay: () => replayFromBlock(i),
        onCancelCurrent: () => cancelCurrentBlock()
      }
    ) }, `${item.type}-${i}`)) }),
    transcript.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "user-input", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserInput,
      {
        mode: "start",
        onSubmit: (text) => {
          vscodeAPI.postMessage({ type: "start", description: text });
        }
      }
    ) })
  ] }) });
};

client.createRoot(document.querySelector("#root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MinionApp, { vscodeAPI: getGenericVSCodeAPI() }) })
);
