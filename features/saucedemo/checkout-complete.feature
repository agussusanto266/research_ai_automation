@regression @checkout-complete
Feature: SauceDemo checkout complete
  As a logged-in user
  I want to see the order confirmation after completing checkout
  So that I know my order was placed successfully

  Rule: Order confirmation after successful checkout

    Background:
      Given I am logged in as "standard_user"

    # --- EP: Equivalence Partitioning ---

    @smoke
    Scenario: Confirmation header is displayed after successful checkout
      Given I have completed the checkout process
      Then the confirmation header should be "Thank you for your order!"

    @smoke
    Scenario: Confirmation message body is displayed after successful checkout
      Given I have completed the checkout process
      Then the confirmation text should be "Your order has been dispatched, and will arrive just as fast as the pony can get there!"

    @smoke
    Scenario: Confirmation image is displayed after successful checkout
      Given I have completed the checkout process
      Then the confirmation image should be visible

    @smoke
    Scenario: Page title is Checkout Complete after successful checkout
      Given I have completed the checkout process
      Then the page title should be "Checkout: Complete!"

    # --- BVA: Boundary Value Analysis ---

    @regression
    Scenario Outline: Checkout with boundary item count shows confirmation page
      Given I have <count> items in the cart
      When I complete the checkout flow with first name "John" last name "Doe" and zip "12345"
      Then I should be on the checkout complete page

      Examples:
        | count |
        | 1     |
        | 6     |

    @regression
    Scenario: Exact confirmation header text matches expected value
      Given I have completed the checkout process
      Then the confirmation header should be "Thank you for your order!"

    @regression
    Scenario: Exact confirmation body text matches expected value
      Given I have completed the checkout process
      Then the confirmation text should be "Your order has been dispatched, and will arrive just as fast as the pony can get there!"

    # --- ST: State Transition ---

    @smoke
    Scenario: Clicking Finish on order overview navigates to checkout complete
      Given I have 1 items in the cart
      When I complete the checkout flow with first name "John" last name "Doe" and zip "12345"
      Then I should be on the checkout complete page

    @smoke
    Scenario: Back Home button navigates from checkout complete to inventory
      Given I have completed the checkout process
      When I click back home
      Then I should be on the inventory page

    @regression
    Scenario: Browser back from checkout complete returns to checkout step 2
      Given I have completed the checkout process
      When I navigate back in the browser
      Then I should be on the checkout step 2 page

    # --- DT: Decision Table ---

    @regression
    Scenario: Logged-in user can access checkout complete page directly without completing checkout
      When I navigate to the checkout complete page
      Then I should be on the checkout complete page

    # --- EG: Error Guessing ---

    @regression
    Scenario: Cart badge is not visible after checkout is complete
      Given I have completed the checkout process
      Then the cart badge should not be visible

    @regression
    Scenario: Checkout complete page persists after page refresh
      Given I have completed the checkout process
      When I refresh the page
      Then I should be on the checkout complete page

    @regression
    Scenario: Cart is empty after navigating Back Home from checkout complete
      Given I have completed the checkout process
      When I click back home
      And I navigate to the cart page
      Then the cart should be empty

  Rule: Access control

    # --- EG: Error Guessing (unauthenticated) ---

    @regression
    Scenario: Unauthenticated user accessing checkout complete URL is redirected to login
      Given I am not logged in
      When I navigate to the checkout complete page
      Then I should be on the login page
