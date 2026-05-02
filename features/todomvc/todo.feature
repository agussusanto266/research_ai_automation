Feature: TodoMVC Todo Management

  Background:
    Given I am on the TodoMVC app

  @smoke @todo @todomvc
  Scenario Outline: EP - Adding valid and empty todo items
    When I type "<text>" in the todo input and press Enter
    Then the todo list item count should be <count>

    Examples:
      | text          | count |
      | Buy groceries | 1     |

  @smoke @todo @todomvc
  Scenario: EP - Submit empty input does not add item
    When I type "" in the todo input and press Enter
    Then the todo list item count should be 0

  @smoke @todo @todomvc
  Scenario: BVA - Add todo with minimum length
    When I type "Hi" in the todo input and press Enter
    Then the todo list item count should be 1
    And the footer should show "1 item left"

  @regression @todo @todomvc
  Scenario: ST - Mark todo as completed
    Given I have added a todo "Walk the dog"
    When I complete the todo "Walk the dog"
    Then the todo "Walk the dog" should be marked as completed
    And the footer should show "0 items left"

  @regression @todo @todomvc
  Scenario: ST - Unmark a completed todo
    Given I have added a todo "Walk the dog"
    And I have completed the todo "Walk the dog"
    When I uncomplete the todo "Walk the dog"
    Then the todo "Walk the dog" should not be marked as completed
    And the footer should show "1 item left"

  @regression @todo @todomvc
  Scenario: ST - Delete a todo item
    Given I have added a todo "Take out trash"
    When I delete the todo "Take out trash"
    Then the todo list item count should be 0

  @regression @todo @todomvc
  Scenario: ST - Filter Active shows only active todos
    Given I have added a todo "Pay bills"
    And I have added a todo "Call mom"
    And I have completed the todo "Call mom"
    When I click the "Active" filter
    Then only the active todos should be visible
    And the completed todos should be hidden

  @regression @todo @todomvc
  Scenario: ST - Filter Completed shows only completed todos
    Given I have added a todo "Pay bills"
    And I have added a todo "Call mom"
    And I have completed the todo "Call mom"
    When I click the "Completed" filter
    Then only the completed todos should be visible
    And the active todos should be hidden

  @regression @todo @todomvc
  Scenario: ST - Filter All shows all todos
    Given I have added a todo "Pay bills"
    And I have added a todo "Call mom"
    And I have completed the todo "Call mom"
    And I have clicked the "Active" filter
    When I click the "All" filter
    Then the todo list item count should be 2

  @regression @todo @todomvc
  Scenario: ST - Clear completed removes only completed todos
    Given I have added a todo "Pay bills"
    And I have added a todo "Call mom"
    And I have completed the todo "Call mom"
    When I click "Clear completed"
    Then the todo list item count should be 1
    And the footer should show "1 item left"

  @smoke @todo @todomvc
  Scenario: DT - Footer shows correct count for 1 active item
    When I type "Read a book" in the todo input and press Enter
    Then the footer should show "1 item left"

  @regression @todo @todomvc
  Scenario: DT - Footer shows correct count for 2 active items
    When I type "Read a book" in the todo input and press Enter
    And I type "Learn TypeScript" in the todo input and press Enter
    Then the footer should show "2 items left"

  @regression @todo @todomvc
  Scenario: DT - Footer count decreases after completing one of two todos
    Given I have added a todo "Read a book"
    And I have added a todo "Learn TypeScript"
    When I complete the todo "Read a book"
    Then the footer should show "1 item left"

  @regression @todo @todomvc
  Scenario: EG - Add todo with special characters
    When I type "Todo!@# special^chars" in the todo input and press Enter
    Then the todo list item count should be 1
    And the todo item "Todo!@# special^chars" should be visible

  @regression @todo @todomvc
  Scenario: EG - Add todo with whitespace only does not add item
    When I type "   " in the todo input and press Enter
    Then the todo list item count should be 0
