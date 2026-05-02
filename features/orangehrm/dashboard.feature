@regression @dashboard @orangehrm
Feature: OrangeHRM Dashboard
  As an authenticated Admin user
  I want to access the main dashboard
  So that I can navigate to any module

  Background:
    Given I am logged in to OrangeHRM as "Admin"

  # --- EP: Equivalence Partitioning ---

  @smoke @orangehrm
  Scenario: Dashboard heading is displayed after login
    Then the OrangeHRM dashboard heading should be "Dashboard"

  @smoke @orangehrm
  Scenario: Navigation menu is visible after login
    Then the OrangeHRM navigation menu should be visible

  # --- BVA: Boundary Value Analysis ---

  @regression @orangehrm
  Scenario: Navigation menu contains core modules
    Then the OrangeHRM navigation menu should contain "Admin"
    And the OrangeHRM navigation menu should contain "PIM"
    And the OrangeHRM navigation menu should contain "Leave"

  # --- ST: State Transition ---

  @regression @orangehrm
  Scenario: Navigating to PIM updates the breadcrumb
    When I navigate to the OrangeHRM module "PIM"
    Then the OrangeHRM breadcrumb should contain "PIM"

  @regression @orangehrm
  Scenario: Navigating to Admin updates the breadcrumb
    When I navigate to the OrangeHRM module "Admin"
    Then the OrangeHRM breadcrumb should contain "Admin"

  # --- EG: Error Guessing ---

  @regression @orangehrm
  Scenario: Direct URL access to dashboard without login redirects to login
    Given I am not logged in to OrangeHRM
    When I navigate directly to the OrangeHRM dashboard
    Then I should be redirected to the OrangeHRM login page
