@smoke @sanity
Feature: Basic healthcheck
  As a framework sanity check
  I want to open the base URL
  So that I can verify test infrastructure is working

  Scenario: Open homepage and validate title
    Given I navigate to the base URL
    Then the page title should contain "Swag Labs"
