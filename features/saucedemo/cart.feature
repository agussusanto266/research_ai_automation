@regression @cart
Feature: SauceDemo shopping cart
  As a logged-in user
  I want to review and manage items in my cart
  So that I can prepare for checkout

  Rule: Authenticated cart operations

    Background:
      Given I am logged in as "standard_user"

    # --- EP: Equivalent Partitioning ---

    @smoke
    Scenario: View cart containing added items
      Given I have 1 items in the cart
      When I navigate to the cart page
      Then the cart should contain 1 items
      And the cart badge should show "1"
      And the cart should display item name price and remove button

    @smoke
    Scenario: View empty cart
      Given I have 0 items in the cart
      When I navigate to the cart page
      Then the cart should be empty

    @regression
    Scenario: View cart with all 6 products
      Given I have 6 items in the cart
      When I navigate to the cart page
      Then the cart should contain 6 items

    # --- BVA: Boundary Value Analysis ---

    @regression
    Scenario Outline: Cart badge boundary values
      Given I have <count> items in the cart
      When I navigate to the cart page
      Then the cart badge count should be "<badge_value>"

      Examples:
        | count | badge_value |
        | 0     | hidden      |
        | 1     | 1           |
        | 6     | 6           |

    # --- ST: State Transition ---

    @smoke
    Scenario: Remove item from multi-item cart updates count and badge
      Given I have 2 items in the cart
      When I navigate to the cart page
      And I remove the item at position 1
      Then the cart should contain 1 items
      And the cart badge should show "1"

    @smoke
    Scenario: Remove last item empties cart and hides badge
      Given I have 1 items in the cart
      When I navigate to the cart page
      And I remove the item at position 1
      Then the cart should be empty
      And the cart badge should not be visible

    @smoke
    Scenario: Continue shopping returns to inventory and preserves cart
      Given I have 1 items in the cart
      When I navigate to the cart page
      And I click continue shopping
      Then I should be on the inventory page
      And the cart badge should show "1"

    @smoke
    Scenario: Checkout button navigates to checkout step 1
      Given I have 1 items in the cart
      When I navigate to the cart page
      And I click checkout
      Then I should be on the checkout page

    # --- DT: Decision Table ---

    @regression
    Scenario: Checkout is allowed even with an empty cart
      Given I have 0 items in the cart
      When I navigate to the cart page
      And I click checkout
      Then I should be on the checkout page

    @regression
    Scenario: Cart badge decrements immediately after item removal
      Given I have 2 items in the cart
      When I navigate to the cart page
      Then the cart badge should show "2"
      When I remove the item at position 1
      Then the cart badge should show "1"

    # --- EG: Error Guessing ---

    @regression
    Scenario: Product name in cart navigates to product detail page
      Given I have 1 items in the cart
      When I navigate to the cart page
      And I click the first product name in the cart
      Then I should be on the product detail page

    @regression
    Scenario: Cart state persists after page refresh
      Given I have 1 items in the cart
      When I navigate to the cart page
      And I refresh the page
      Then the cart should contain 1 items

    @regression
    Scenario: Remove all items sequentially results in empty cart
      Given I have 3 items in the cart
      When I navigate to the cart page
      And I remove the item at position 1
      And I remove the item at position 1
      And I remove the item at position 1
      Then the cart should be empty
      And the cart badge should not be visible

  Rule: Access control

    # --- EG: Error Guessing (unauthenticated) ---

    @regression
    Scenario: Unauthenticated user accessing cart URL is redirected to login
      Given I am not logged in
      When I navigate to the cart page
      Then I should be on the login page
