@regression @employee @orangehrm
Feature: OrangeHRM Employee List
  As an authenticated Admin user
  I want to browse and search the employee list
  So that I can manage workforce records

  Background:
    Given I am logged in to OrangeHRM as "Admin"
    And I navigate to the OrangeHRM employee list

  # --- EP: Equivalence Partitioning ---

  @smoke @orangehrm
  Scenario: Employee list loads and displays records
    Then the OrangeHRM employee table should be visible
    And the OrangeHRM employee list should have at least 1 record

  # --- BVA: Boundary Value Analysis ---

  @regression @orangehrm
  Scenario: Search with non-existent employee ID returns no records
    When I search the OrangeHRM employee list by ID "99999999"
    Then the OrangeHRM employee list should show no records

  @regression @orangehrm
  Scenario: Search with empty ID returns all records
    When I click the OrangeHRM employee search button
    Then the OrangeHRM employee list should have at least 1 record

  # --- ST: State Transition ---

  @regression @orangehrm
  Scenario: Reset after filtered search restores full list
    When I search the OrangeHRM employee list by ID "99999999"
    Then the OrangeHRM employee list should show no records
    When I reset the OrangeHRM employee search
    Then the OrangeHRM employee list should have at least 1 record

  # --- DT: Decision Table ---

  @regression @orangehrm
  Scenario Outline: Various search inputs produce correct result sets
    When I search the OrangeHRM employee list by ID "<id>"
    Then the OrangeHRM employee list result should be "<result>"

    Examples:
      | id                    | result    |
      | 99999999              | no-records|
      |                       | has-records|

  # --- EG: Error Guessing ---

  @regression @orangehrm
  Scenario: Special characters in employee ID search do not crash the page
    When I search the OrangeHRM employee list by ID "'; DROP TABLE employees;--"
    Then the OrangeHRM employee table should be visible

  @regression @no-retry @orangehrm
  Scenario: Add Employee button navigates to add employee form
    When I click the OrangeHRM add employee button
    Then I should be on the OrangeHRM add employee page
