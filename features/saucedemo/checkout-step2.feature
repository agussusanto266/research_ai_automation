@regression @checkout-step2
Feature: SauceDemo checkout step 2 — order overview
  As a logged-in user
  I want to review my order summary before confirming
  So that I can verify prices, taxes, and totals

  Rule: Order overview content and navigation

    Background:
      Given I am logged in as "standard_user"

    # --- EP: Equivalence Partitioning ---

    @smoke
    Scenario: Order overview displays subtotal, tax, and total for 1 item
      Given I have 1 items in the cart
      When I proceed to checkout step 2 with info "John" "Doe" "12345"
      Then the checkout step 2 should show a subtotal
      And the checkout step 2 should show a tax amount
      And the checkout step 2 should show a total

    @regression
    Scenario: Order overview item count matches cart
      Given I have 2 items in the cart
      When I proceed to checkout step 2 with info "John" "Doe" "12345"
      Then the checkout step 2 cart item count should be 2

    # --- BVA: Boundary Value Analysis ---

    @regression
    Scenario Outline: Checkout step 2 shows items for boundary cart sizes
      Given I have <count> items in the cart
      When I proceed to checkout step 2 with info "John" "Doe" "12345"
      Then the checkout step 2 cart item count should be <count>

      Examples:
        | count |
        | 1     |
        | 6     |

    # --- ST: State Transition ---

    @smoke @sanity
    Scenario: Finish button navigates to checkout complete
      Given I have 1 items in the cart
      When I proceed to checkout step 2 with info "John" "Doe" "12345"
      And I click the finish button
      Then I should be on the checkout complete page

    @regression
    Scenario: Cancel from step 2 returns to inventory
      Given I have 1 items in the cart
      When I proceed to checkout step 2 with info "John" "Doe" "12345"
      And I click the cancel button on checkout step 2
      Then I should be on the inventory page

    # --- DT: Decision Table ---

    @regression
    Scenario: Total equals subtotal plus tax
      Given I have 1 items in the cart
      When I proceed to checkout step 2 with info "John" "Doe" "12345"
      Then the checkout total should equal subtotal plus tax

    # --- EG: Error Guessing ---

    @regression
    Scenario: Unauthenticated direct access to step 2 redirects to login
      Given I am not logged in
      When I navigate directly to checkout step 2
      Then I should be on the login page
