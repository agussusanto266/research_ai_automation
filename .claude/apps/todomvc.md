# App Config — TodoMVC

---

## App Identity

```
App Name    : todomvc
Display Name: TodoMVC (React)
Base URL    : https://todomvc.com/examples/react/dist
Environment : production (public demo)
```

---

## Authentication

```
Auth Required : no
Auth Type     : none
```

---

## Pages / Modules

| Page name      | URL path       | Notes                                           |
| -------------- | -------------- | ----------------------------------------------- |
| Todo List      | `/`            | Main page — add, complete, delete, filter todos |
| Active view    | `/#/active`    | Filtered view — active todos only               |
| Completed view | `/#/completed` | Filtered view — completed todos only            |

---

## Key UI Elements & Locators

| Element             | Selector                       | Notes                                      |
| ------------------- | ------------------------------ | ------------------------------------------ |
| New todo input      | `.new-todo`                    | Press Enter to add                         |
| Todo item row       | `.todo-list li`                | One per item                               |
| Todo label          | `.todo-list li label`          | Displays item text                         |
| Complete checkbox   | `.todo-list li .toggle`        | Click to toggle complete/active            |
| Delete button       | `.todo-list li button.destroy` | Visible on hover                           |
| Footer              | `footer.footer`                | Hidden when list is empty                  |
| Remaining count     | `.todo-count`                  | e.g. "1 item left", "2 items left"         |
| Count number        | `.todo-count strong`           | Number only                                |
| Filter All          | `a[href="#/"]`                 | Default active filter                      |
| Filter Active       | `a[href="#/active"]`           | Shows only uncompleted                     |
| Filter Completed    | `a[href="#/completed"]`        | Shows only completed                       |
| Clear completed btn | `.clear-completed`             | Visible only when ≥1 completed item exists |

---

## Known Quirks & Limitations

- No backend — all state lives in memory; refreshing the page resets the list
- Whitespace-only input is trimmed and not added as a todo item
- Delete button (×) is only visible when hovering over the todo row
- Footer (count, filters, clear completed) is hidden when the list is empty
- "1 item left" (singular) vs "N items left" (plural) — count text changes at exactly 1
- No `data-test` attributes — use CSS class selectors as primary locators
- React SPA — URL hash changes for filters (`#/`, `#/active`, `#/completed`)

---

## Existing Automation Coverage

| Feature | Feature file                    | Step definitions                         | POM                 |
| ------- | ------------------------------- | ---------------------------------------- | ------------------- |
| Todo    | `features/todomvc/todo.feature` | `step-definitions/todomvc/todo.steps.ts` | `pages/TodoPage.ts` |

---

## Changelog

| Date       | Change         |
| ---------- | -------------- |
| 2026-05-02 | Initial config |
