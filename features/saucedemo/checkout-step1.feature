@regression @checkout-step1
Feature: SauceDemo checkout step 1 — customer information
  As a logged-in user
  I want to enter my details on the checkout form
  So that I can progress to the order review

  Rule: Form validation and navigation

    Background:
      Given I am logged in as "standard_user"
      And I have 1 items in the cart
      And I navigate to the cart page
      And I click checkout

    # --- EP: Equivalence Partitioning ---

    @smoke
    Scenario: Valid customer info advances to step 2
      When I fill in checkout info with first name "Jane" last name "Doe" and zip "90210"
      And I click the continue button
      Then I should be on the checkout step 2 page

    @regression
    Scenario: Missing first name shows error
      When I fill in checkout info with first name "" last name "Doe" and zip "90210"
      And I click the continue button
      Then the checkout step 1 error should contain "First Name is required"

    @regression
    Scenario: Missing last name shows error
      When I fill in checkout info with first name "Jane" last name "" and zip "90210"
      And I click the continue button
      Then the checkout step 1 error should contain "Last Name is required"

    @regression
    Scenario: Missing zip code shows error
      When I fill in checkout info with first name "Jane" last name "Doe" and zip ""
      And I click the continue button
      Then the checkout step 1 error should contain "Postal Code is required"

    # --- BVA: Boundary Value Analysis ---

    @regression
    Scenario: Single character in each field advances to step 2
      When I fill in checkout info with first name "A" last name "B" and zip "1"
      And I click the continue button
      Then I should be on the checkout step 2 page

    # --- ST: State Transition ---

    @smoke
    Scenario: Cancel from step 1 returns to cart
      When I click the cancel button on checkout step 1
      Then I should be on the cart page

    # --- DT: Decision Table ---

    @regression
    Scenario Outline: All fields empty returns error for each missing field
      When I fill in checkout info with first name "<fn>" last name "<ln>" and zip "<zip>"
      And I click the continue button
      Then the checkout step 1 error should contain "<error>"

      Examples:
        | fn   | ln  | zip   | error                      |
        |      | Doe | 12345 | First Name is required     |
        | Jane |     | 12345 | Last Name is required      |
        | Jane | Doe |       | Postal Code is required    |

    # --- EG: Error Guessing ---

    @regression
    Scenario: First name with special characters is accepted
      When I fill in checkout info with first name "O'Brien" last name "Smith" and zip "12345"
      And I click the continue button
      Then I should be on the checkout step 2 page
